import React, { useMemo, useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  X,
  RotateCcw,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { BASE_MODELS } from '../../data/models';

interface ModelPhotosManagerProps {
  modelId: string;
  modelName: string;
  image?: string;
  gallery?: string[];
  onChangePhotos: (nextImage: string | undefined, nextGallery: string[]) => boolean | void;
}

const normalizePhotoList = (image?: string, gallery?: string[]): string[] => {
  const list: string[] = [];
  const pushUnique = (val?: string) => {
    const trimmed = typeof val === 'string' ? val.trim() : '';
    if (trimmed && !list.includes(trimmed)) {
      list.push(trimmed);
    }
  };
  pushUnique(image);
  if (Array.isArray(gallery)) {
    gallery.forEach(pushUnique);
  }
  return list;
};

const compressImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) {
        reject(new Error(`Empty file ${file.name}`));
        return;
      }

      // Skip raster re-encoding for SVGs
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        try {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Preserve transparency if PNG with alpha or use JPEG for smaller localStorage footprint
          const usePng = file.type === 'image/png' && dataUrl.length < 180000;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL(
            usePng ? 'image/png' : 'image/jpeg',
            usePng ? undefined : 0.82
          );
          resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error(`Invalid image file: ${file.name}`));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

export const ModelPhotosManager: React.FC<ModelPhotosManagerProps> = ({
  modelId,
  modelName,
  image,
  gallery,
  onChangePhotos,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = useMemo(() => normalizePhotoList(image, gallery), [image, gallery]);

  const factoryPhotos = useMemo(() => {
    const def = BASE_MODELS.find((m) => m.id === modelId);
    return def ? normalizePhotoList(def.image, def.gallery) : [];
  }, [modelId]);

  const canRestoreFactory =
    factoryPhotos.length > 0 &&
    JSON.stringify(photos) !== JSON.stringify(factoryPhotos);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const commitPhotos = (nextList: string[], successMsg?: string) => {
    const deduped: string[] = [];
    nextList.forEach((p) => {
      const trimmed = p.trim();
      if (trimmed && !deduped.includes(trimmed)) {
        deduped.push(trimmed);
      }
    });
    const nextCover = deduped.length > 0 ? deduped[0] : '';
    const savedOk = onChangePhotos(nextCover, deduped);
    if (savedOk === false) {
      showStatus(
        'error',
        'Browser storage limit reached. Try fewer/smaller photos or paste an image URL instead.'
      );
      return false;
    }
    if (successMsg) {
      showStatus('success', successMsg);
    }
    return true;
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showStatus('error', 'Please select valid image files (JPG, PNG, WebP, or GIF).');
      return;
    }

    setIsProcessing(true);
    try {
      const encoded = await Promise.all(imageFiles.map((f) => compressImageFile(f)));
      const next = [...photos, ...encoded];
      const ok = commitPhotos(
        next,
        `Added ${encoded.length} photo${encoded.length > 1 ? 's' : ''} and saved live.`
      );
      if (ok && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      showStatus('error', err?.message || 'Unable to process selected image file(s).');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (photos.includes(trimmed)) {
      showStatus('error', 'This photo URL is already in the gallery.');
      return;
    }
    const ok = commitPhotos([...photos, trimmed], 'Photo URL added and saved live.');
    if (ok) {
      setUrlInput('');
    }
  };

  const handleSetCover = (idx: number) => {
    if (idx <= 0 || idx >= photos.length) return;
    const chosen = photos[idx];
    const next = [chosen, ...photos.filter((_, i) => i !== idx)];
    commitPhotos(next, 'Cover photo updated and saved live.');
  };

  const handleMove = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    commitPhotos(next, 'Photo order saved live.');
  };

  const handleRemove = (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    commitPhotos(next, 'Photo removed and saved live.');
    if (lightboxIndex !== null) {
      if (next.length === 0) {
        setLightboxIndex(null);
      } else if (lightboxIndex >= next.length) {
        setLightboxIndex(next.length - 1);
      }
    }
  };

  const handleClearAll = () => {
    if (photos.length === 0) return;
    if (!window.confirm(`Remove all ${photos.length} photo(s) from "${modelName}"?`)) return;
    commitPhotos([], 'All house photos cleared.');
  };

  const handleRestoreDefaults = () => {
    if (factoryPhotos.length === 0) return;
    commitPhotos(factoryPhotos, 'Restored default factory house photos.');
  };

  return (
    <div className="pt-4 mt-1 border-t border-gray-100 space-y-3.5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-800">
                House Photos &amp; Gallery
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  photos.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
              </span>
            </div>
            <p className="text-[10.5px] text-gray-500">
              Upload photos or add image URLs. Photo #1 serves as the primary cover in catalogs, customer portal, and order gallery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {canRestoreFactory && (
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Restore default factory photos"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Defaults</span>
            </button>
          )}
          {photos.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-white bg-black hover:bg-neutral-800 disabled:opacity-60 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-orange-400" />
            <span>{isProcessing ? 'Processing...' : 'Upload Photos'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Upload Dropzone & URL Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFilesSelected(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`lg:col-span-5 px-3.5 py-2.5 rounded-2xl border-2 border-dashed transition-all flex items-center gap-3 cursor-pointer ${
            isDragging
              ? 'border-orange-500 bg-orange-50 text-orange-900'
              : 'border-gray-200 bg-gray-50/70 hover:border-orange-400 hover:bg-orange-50/30 text-gray-600'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs">
            <ImageIcon className="w-4 h-4 text-orange-600" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-900 truncate">
              {isDragging ? 'Drop house photos here' : 'Drag & drop or click to upload photos'}
            </div>
            <div className="text-[10px] text-gray-500 truncate">
              Supports multiple JPG, PNG, WebP images · Auto-optimized
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex items-center gap-2 bg-gray-50/80 border border-gray-200 rounded-2xl px-3 py-2">
          <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Or paste photo URL (https://... or /assets/...)"
            className="flex-1 min-w-0 bg-transparent text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add URL</span>
          </button>
        </div>
      </div>

      {/* Live Status Feedback */}
      {statusMessage && (
        <div
          className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Gallery Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photoUrl, idx) => {
            const isCover = idx === 0;
            const isBroken = Boolean(brokenUrls[photoUrl]);

            return (
              <div
                key={`${photoUrl.slice(0, 48)}-${idx}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all bg-gray-100 flex flex-col ${
                  isCover
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative aspect-16/10 bg-gray-900/5 overflow-hidden">
                  {!isBroken ? (
                    <img
                      src={photoUrl}
                      alt={`${modelName} photo ${idx + 1}`}
                      onError={() =>
                        setBrokenUrls((prev) => ({ ...prev, [photoUrl]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center bg-gray-100">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-[10px] font-semibold">Failed to load image</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                    {isCover ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/65 text-white backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="pointer-events-auto p-1 rounded-lg bg-black/65 hover:bg-black text-white opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                      title="Preview full size"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-2 py-1.5 bg-white border-t border-gray-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move photo left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === photos.length - 1}
                      className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move photo right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 cursor-pointer"
                        title="Make this the primary cover photo"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-center text-[11px] text-gray-500">
          No photos added for <strong className="text-gray-700">{modelName}</strong> yet. Upload house photos above or paste an image URL to populate its gallery.
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-neutral-950 rounded-3xl overflow-hidden border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <Camera className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-xs font-bold truncate">{modelName}</span>
                <span className="text-[11px] font-mono text-gray-400">
                  ({lightboxIndex + 1} / {photos.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center max-h-[75vh] min-h-[300px]">
              <img
                src={photos[lightboxIndex]}
                alt={`${modelName} preview`}
                className="max-h-[75vh] w-auto object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
