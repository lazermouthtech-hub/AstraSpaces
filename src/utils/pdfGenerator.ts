import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  orderId?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

/**
 * Exports an HTML element as a multi-page high-resolution PDF document.
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `Boxabl-WorkOrder-${Date.now()}.pdf`,
    onStart,
    onSuccess,
    onError,
  } = options;

  try {
    if (onStart) onStart();

    // High resolution canvas capture with onclone sanitization to prevent "unsupported color function oklch" errors
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution retina capture
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc: Document) => {
        // Tailwind v4 compiles colors and CSS variables into oklch(...) which html2canvas 1.4.1 crashes on.
        try {
          // 1. Sanitize all stylesheet rules in the cloned document
          const styleSheets = Array.from(clonedDoc.styleSheets);
          styleSheets.forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              rules.forEach((rule, idx) => {
                if (rule.cssText && rule.cssText.includes('oklch')) {
                  try {
                    // Replace oklch(...) occurrences in the rule text with safe fallbacks or delete
                    const sanitized = rule.cssText.replace(/oklch\([^)]+\)/gi, '#475569');
                    sheet.deleteRule(idx);
                    sheet.insertRule(sanitized, idx);
                  } catch {
                    // ignore if cross-origin or immutable
                  }
                }
              });
            } catch {
              // ignore cross-origin stylesheet access errors
            }
          });

          // 2. Also inspect and sanitize <style> tag innerHTML directly
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleEl) => {
            if (styleEl.innerHTML.includes('oklch')) {
              styleEl.innerHTML = styleEl.innerHTML.replace(/oklch\([^)]+\)/gi, '#475569');
            }
          });

          // 3. Helper canvas context for exact sRGB color parsing
          const canvasHelper = document.createElement('canvas');
          canvasHelper.width = 1;
          canvasHelper.height = 1;
          const ctx = canvasHelper.getContext('2d');

          const resolveToRgb = (colorStr: string): string => {
            if (!ctx) return '#1e293b';
            try {
              ctx.fillStyle = '#1e293b';
              ctx.fillStyle = colorStr;
              const result = ctx.fillStyle;
              return result && !result.includes('oklch') ? result : '#1e293b';
            } catch {
              return '#1e293b';
            }
          };

          // 4. Check all elements in cloned DOM
          const allElements = clonedDoc.querySelectorAll('*');
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
            'fill',
            'stroke',
          ];

          allElements.forEach((el) => {
            if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;
            const computed = window.getComputedStyle(el);
            
            // Check computed styles
            for (const prop of colorProperties) {
              const val = computed.getPropertyValue(prop);
              if (val && (val.includes('oklch') || val.includes('lab') || val.includes('color-mix'))) {
                const rgb = resolveToRgb(val);
                el.style.setProperty(prop, rgb, 'important');
              }
            }

            // Also check any inline style attribute
            const inlineStyle = el.getAttribute('style');
            if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('lab') || inlineStyle.includes('color-mix'))) {
              const cleaned = inlineStyle.replace(/oklch\([^)]+\)/gi, '#1e293b');
              el.setAttribute('style', cleaned);
            }
          });
        } catch (e) {
          console.warn('Style sanitization notice:', e);
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 8; // 8mm margin
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
    heightLeft -= (pdfHeight - margin * 2);

    // Multi-page handling if document is long
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - margin * 2);
    }

    pdf.save(filename);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    // Fallback: trigger print dialog if canvas generation failed
    window.print();
    if (onError) onError(error);
  }
}
