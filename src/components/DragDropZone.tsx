
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface DragDropZoneProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string[];
}

const DragDropZone = ({ onFileSelected, acceptedFileTypes = ['image/*'] }: DragDropZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`neo-glass w-full p-8 rounded-lg cursor-pointer transition-all duration-300 
        ${isDragActive ? 'bg-white/20' : 'hover:bg-white/10'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className="w-12 h-12 text-white/60" />
        <div className="text-center">
          <p className="text-lg font-medium">
            {isDragActive ? "Drop the file here" : "Drag & drop a file here"}
          </p>
          <p className="text-sm text-white/60 mt-1">
            or click to select a file
          </p>
        </div>
      </div>
    </div>
  );
};

export default DragDropZone;
