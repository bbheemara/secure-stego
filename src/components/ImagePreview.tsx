
import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

const ImagePreview = ({ imageUrl, onRemove }: ImagePreviewProps) => {
  return (
    <div className="relative animate-fadeIn">
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-64 object-cover rounded-lg neo-glass"
      />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ImagePreview;
