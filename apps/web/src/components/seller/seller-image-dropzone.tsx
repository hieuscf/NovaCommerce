'use client';

import { useEffect, useState } from 'react';
import { CloudUpload, FileText, ImageIcon, X } from 'lucide-react';
import { Label } from '@novacommerce/ui/components/label';
import { cn } from '@/lib/utils';

const IMAGE_ACCEPT = 'image/png,image/jpeg';

function isImageFile(file: File) {
  return file.type === 'image/png' || file.type === 'image/jpeg';
}

export function SellerImageDropzone({
  id,
  label,
  required,
  hint,
  value,
  error,
  accept = IMAGE_ACCEPT,
  hideOptionalLabel = false,
  compact = false,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint: string;
  value: File | null;
  error?: string;
  accept?: string;
  hideOptionalLabel?: boolean;
  compact?: boolean;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const errorId = `${id}-error`;
  const imagePreview = Boolean(value && isImageFile(value) && previewUrl);

  useEffect(() => {
    if (!value || !isImageFile(value)) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function applyFile(file: File | undefined) {
    if (!file) return;
    onChange(file);
  }

  return (
    <div className="grid gap-2">
      {hideOptionalLabel ? (
        <Label htmlFor={id} className="sr-only">
          {label}
        </Label>
      ) : (
        <Label htmlFor={id}>
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              {' '}
              *
            </span>
          ) : (
            <span className="font-normal text-muted-foreground"> (Optional)</span>
          )}
        </Label>
      )}
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
          compact ? 'min-h-31' : 'min-h-[10.5rem]',
          dragOver
            ? 'border-primary bg-primary/10'
            : compact
              ? 'border-primary/20 bg-white'
              : 'border-primary/25 bg-primary/[0.03]',
          error && 'border-destructive',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          applyFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onBlur={onBlur}
          onChange={(event) => {
            applyFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        {imagePreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={previewUrl ?? ''} alt="" className="absolute inset-0 size-full object-cover" />
            <label
              htmlFor={id}
              className="absolute inset-0 grid cursor-pointer place-items-center bg-ink/40 text-[13px] font-semibold text-white opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100"
            >
              Replace file
            </label>
            <button
              type="button"
              className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/95 text-ink shadow-sm hover:bg-white focus-ring"
              aria-label={`Remove ${label}`}
              onClick={() => onChange(null)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : value ? (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <FileText className="size-6 text-primary" aria-hidden="true" />
            <p className="max-w-full truncate text-[13px] font-semibold text-ink">{value.name}</p>
            <label htmlFor={id} className="cursor-pointer text-[12px] font-semibold text-primary">
              Replace file
            </label>
            <button
              type="button"
              className="text-[12px] font-medium text-muted-foreground hover:text-ink"
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className={cn(
              'flex cursor-pointer flex-col items-center text-center',
              compact ? 'gap-1 px-2 py-5' : 'gap-2 px-4 py-8',
            )}
          >
            {compact ? (
              <CloudUpload className="size-7 text-primary" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon className="size-5" aria-hidden="true" />
              </span>
            )}
            <span
              className={cn(
                'font-semibold text-primary',
                compact ? 'text-[12px] leading-snug' : 'text-[13px]',
              )}
            >
              Click to upload or drag and drop
            </span>
            <span className="text-[12px] text-muted-foreground">{hint}</span>
          </label>
        )}
      </div>
      {error ? (
        <p id={errorId} className="text-caption font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
