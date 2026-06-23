'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-3">
      <Dialog>
        <DialogTrigger className="block w-full">
          <div className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
            <img
              alt={productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-125"
              src={selectedImage}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-2 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{productName}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              alt={productName}
              className="h-full w-full object-contain"
              src={selectedImage}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            className={`overflow-hidden rounded-md border ${
              selectedIndex === index ? 'ring-2 ring-primary' : ''
            }`}
            key={`${image}-${index}`}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <img
              alt={`${productName} ${index + 1}`}
              className="aspect-square w-full object-cover"
              src={image}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
