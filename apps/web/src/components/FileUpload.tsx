'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  if (selectedFile) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()} 
      className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the PDF file here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">Upload PDF File</p>
            <p className="text-muted-foreground mb-4">
              Drag and drop a PDF file here, or click to select
            </p>
            <Button variant="outline">
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum file size: 25MB
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
