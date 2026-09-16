'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Label } from '@novacommerce/ui/components/label';
import { cn } from '@/lib/utils';

const ACCEPT = 'image/png,image/jpeg';

export function SellerImageDropzone({
  id,
  label,
  required,
  hint,
  value,
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint: string;
  value: File | null;
  error?: string;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const errorId = `${id}-error`;

  useEffect(() => {
    if (!value) {
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
      <div
        className={cn(
          'relative flex min-h-[10.5rem] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
          dragOver ? 'border-primary bg-primary/10' : 'border-primary/25 bg-primary/[0.03]',
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
          accept={ACCEPT}
          className="sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onBlur={onBlur}
          onChange={(event) => {
            applyFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
            <label
              htmlFor={id}
              className="absolute inset-0 grid cursor-pointer place-items-center bg-ink/40 text-[13px] font-semibold text-white opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100"
            >
              Replace image
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
        ) : (
          <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center gap-2 px-4 py-8 text-center"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[13px] font-semibold text-primary">
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
