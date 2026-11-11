import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  orderId?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

// Dedicated offscreen canvas for converting any CSS color expression (oklab, oklch, lab, lch, color-mix, color) to standard sRGB rgba
let helperCanvas: HTMLCanvasElement | null = null;
let helperCtx: CanvasRenderingContext2D | null = null;

function getHelperContext(): CanvasRenderingContext2D | null {
  if (helperCtx) return helperCtx;
  if (typeof document === 'undefined') return null;
  try {
    helperCanvas = document.createElement('canvas');
    helperCanvas.width = 1;
    helperCanvas.height = 1;
    helperCtx = helperCanvas.getContext('2d', { willReadFrequently: true });
    return helperCtx;
  } catch {
    return null;
  }
}

// Cache resolved colors to accelerate DOM tree scanning
const colorCache = new Map<string, string>();

/**
 * Converts any browser-supported CSS color (including oklab, oklch, lab, lch, color-mix, color)
 * to a standard rgba(r, g, b, a) string that html2canvas can parse without error.
 */
export function toStandardRgba(colorStr: string, fallback = 'rgba(30, 41, 59, 1)'): string {
  if (!colorStr) return fallback;
  const trimmed = colorStr.trim();
  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }

  const ctx = getHelperContext();
  if (!ctx) return fallback;

  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = trimmed;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const alpha = (a / 255).toFixed(3);
    const resolved = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    colorCache.set(trimmed, resolved);
    return resolved;
  } catch {
    return fallback;
  }
}

/**
 * Replaces modern color functions (oklab, oklch, lab, lch, color-mix, color) in any CSS value with safe rgba(...)
 */
export function sanitizeColorString(str: string): string {
  if (!str || typeof str !== 'string') return str;
  if (
    !str.includes('okl') &&
    !str.includes('lab') &&
    !str.includes('lch') &&
    !str.includes('color-mix') &&
    !str.includes('color(')
  ) {
    return str;
  }

  let result = str;
  // Replace innermost color functions iteratively (up to 6 passes for nested expressions like color-mix)
  for (let iter = 0; iter < 6; iter++) {
    const prev = result;
    result = result.replace(
      /\b(oklab|oklch|lab|lch|color-mix|color)\s*\(([^()]+)\)/gi,
      (match) => {
        return toStandardRgba(match);
      }
    );
    if (result === prev) break;
  }
  return result;
}

const PROXY_MARKER = Symbol('__isSafeStyleProxy');

/**
 * Creates a Proxy around CSSStyleDeclaration that intercepts getPropertyValue and property getters,
 * converting any modern oklab/oklch colors to standard rgba(...) so html2canvas never encounters unsupported color functions.
 * CRITICAL: We avoid passing `receiver` to Reflect.get so native WebIDL getters (e.g. `length`, `item`)
 * bind directly to the underlying CSSStyleDeclaration without throwing `TypeError: Illegal invocation`.
 */
function createSafeStyleProxy(style: CSSStyleDeclaration): CSSStyleDeclaration {
  if (!style || (style as any)[PROXY_MARKER]) return style;

  return new Proxy(style, {
    get(target, prop) {
      if (prop === PROXY_MARKER) return true;

      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          try {
            const raw = target.getPropertyValue(propertyName);
            return sanitizeColorString(raw);
          } catch {
            return '';
          }
        };
      }

      if (prop === 'getPropertyPriority') {
        return (propertyName: string) => {
          try {
            return target.getPropertyPriority(propertyName);
          } catch {
            return '';
          }
        };
      }

      if (prop === 'item') {
        return (index: number) => {
          try {
            return target.item(index);
          } catch {
            return '';
          }
        };
      }

      try {
        // Access target directly without proxy receiver to preserve native C++ WebIDL accessor bindings
        const val = (target as any)[prop];
        if (typeof val === 'function') {
          return val.bind(target);
        }
        if (typeof val === 'string') {
          return sanitizeColorString(val);
        }
        return val;
      } catch {
        return undefined;
      }
    },
  });
}

function sanitizeClonedDocument(clonedDoc: Document) {
  try {
    // 1. Intercept getComputedStyle in the cloned iframe document
    if (clonedDoc.defaultView) {
      const clonedOrig = clonedDoc.defaultView.getComputedStyle;
      clonedDoc.defaultView.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
        const style = clonedOrig.call(clonedDoc.defaultView, elt, pseudoElt);
        return createSafeStyleProxy(style);
      };
    }

    // 2. Inspect and sanitize inline <style> tag contents directly
    const styleElements = clonedDoc.querySelectorAll('style');
    styleElements.forEach((styleEl) => {
      if (
        styleEl.textContent &&
        (styleEl.textContent.includes('okl') ||
          styleEl.textContent.includes('lab') ||
          styleEl.textContent.includes('lch') ||
          styleEl.textContent.includes('color('))
      ) {
        styleEl.textContent = sanitizeColorString(styleEl.textContent);
      }
    });

    // 3. Ensure target element expands fully to capture all content
    const target = clonedDoc.querySelector('[data-spec-sheet="true"]') || clonedDoc.body;
    if (target instanceof HTMLElement) {
      target.style.overflow = 'visible';
      target.style.maxHeight = 'none';
      target.style.height = 'auto';
      let p = target.parentElement;
      while (p) {
        p.style.overflow = 'visible';
        p.style.maxHeight = 'none';
        p = p.parentElement;
      }
    }

    // 4. Sanitize all color properties on every element in the cloned tree
    const colorProperties = [
      'color',
      'background-color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'text-decoration-color',
      'box-shadow',
      'text-shadow',
      'fill',
      'stroke',
      'caret-color',
    ];

    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        const view = el.ownerDocument?.defaultView || window;
        const computed = view.getComputedStyle(el);
        for (const prop of colorProperties) {
          const val = computed.getPropertyValue(prop);
          if (
            val &&
            (val.includes('okl') ||
              val.includes('lab') ||
              val.includes('lch') ||
              val.includes('color-mix') ||
              val.includes('color('))
          ) {
            el.style.setProperty(prop, sanitizeColorString(val), 'important');
          }
        }

        const inline = el.getAttribute('style');
        if (
          inline &&
          (inline.includes('okl') ||
            inline.includes('lab') ||
            inline.includes('lch') ||
            inline.includes('color-mix') ||
            inline.includes('color('))
        ) {
          el.setAttribute('style', sanitizeColorString(inline));
        }
      }
    });
  } catch (e) {
    console.warn('PDF color sanitization notice:', e);
  }
}

/**
 * Exports an HTML element as a multi-page high-resolution PDF document.
 * Supports discrete page containers ([data-pdf-page="true"]) to guarantee zero content bleeding across pages,
 * with fallbacks for continuous long-scroll elements.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `10Apples-WorkOrder-${Date.now()}.pdf`,
    onStart,
    onSuccess,
    onError,
  } = options;

  // Intercept window.getComputedStyle during html2canvas capture to sanitize all computed colors
  const origGetComputedStyle = window.getComputedStyle;

  try {
    if (onStart) onStart();

    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
      const style = origGetComputedStyle.call(window, elt, pseudoElt);
      return createSafeStyleProxy(style);
    };

    // Check if element has discrete page containers marked with [data-pdf-page="true"]
    const rawPages = element.hasAttribute('data-pdf-page')
      ? [element]
      : Array.from(element.querySelectorAll<HTMLElement>('[data-pdf-page="true"]'));

    const pageElements = rawPages.filter((p) => p.offsetHeight > 0 || p.scrollHeight > 0);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 8; // 8mm margin
    const contentWidth = pdfWidth - margin * 2;
    const contentMaxHeight = pdfHeight - margin * 2;

    if (pageElements.length > 0) {
      // =========================================================================
      // DISCRETE PAGE RENDERING (GUARANTEED ZERO-BLEED MULTI-PAGE DOSSIER)
      // =========================================================================
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(pageEl, {
          scale: 2, // High resolution crisp text and CAD drawings
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
          windowWidth: pageEl.scrollWidth || 1024,
          ignoreElements: (el) => {
            return el.classList.contains('no-print') || el.getAttribute('data-no-print') === 'true';
          },
          onclone: sanitizeClonedDocument,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.96);
        const renderedHeight = (canvas.height * contentWidth) / canvas.width;

        // Scale to fit within single A4 page height budget if needed to prevent ANY bleed
        let finalWidth = contentWidth;
        let finalHeight = renderedHeight;
        if (finalHeight > contentMaxHeight) {
          finalHeight = contentMaxHeight;
          finalWidth = (canvas.width * finalHeight) / canvas.height;
        }

        const xOffset = margin + (contentWidth - finalWidth) / 2;
        const yOffset = margin + (contentMaxHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
      }
    } else {
      // =========================================================================
      // CONTINUOUS SCROLL FALLBACK (FOR GENERIC SINGLE ELEMENTS)
      // =========================================================================
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (el) => {
          return el.classList.contains('no-print') || el.getAttribute('data-no-print') === 'true';
        },
        onclone: sanitizeClonedDocument,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = margin;

      // First page
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= contentMaxHeight;

      // Only add another page if remaining height exceeds 12mm (avoids trailing blank sliver)
      while (heightLeft > 12) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= contentMaxHeight;
      }
    }

    pdf.save(filename);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    try {
      window.print();
    } catch {
      // ignore
    }
    if (onError) onError(error);
  } finally {
    // Always restore the original getComputedStyle
    window.getComputedStyle = origGetComputedStyle;
  }
}
