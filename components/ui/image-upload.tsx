'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/use-image-upload';

interface ImageUploadProps {
  onUpload?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  bucket?: 'car-images' | 'car-thumbnails' | 'documents';
  folder?: string;
  allowMultiple?: boolean;
  showPreview?: boolean;
  className?: string;
}

interface PreviewImage {
  file: File;
  url: string;
  uploaded?: boolean;
  uploadedUrl?: string;
  isMain?: boolean;
  error?: string;
}

export function ImageUpload({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  bucket = 'car-images',
  folder,
  allowMultiple = true,
  showPreview = true,
  className
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isUploading, progress, uploadMultiple, deleteFile } = useImageUpload({
    bucket,
    folder,
    maxSizeMB,
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, maxFiles - previews.length);
    const newPreviews: PreviewImage[] = [];

    newFiles.forEach((file, index) => {
      // Validate file type
      if (!accept.split(',').some(type => file.type.match(type.trim()))) {
        return;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file,
          url: e.target?.result as string,
          isMain: previews.length === 0 && index === 0, // First image is main
        });

        if (newPreviews.length === newFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [accept, maxFiles, maxSizeMB, previews.length]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleUploadAll = async () => {
    const filesToUpload = previews.filter(p => !p.uploaded).map(p => p.file);
    
    if (filesToUpload.length === 0) return;

    const results = await uploadMultiple(filesToUpload, { bucket, folder });
    
    // Update previews with upload results
    const updatedPreviews = [...previews];
    let uploadIndex = 0;
    
    updatedPreviews.forEach((preview, index) => {
      if (!preview.uploaded && uploadIndex < results.length) {
        const result = results[uploadIndex];
        updatedPreviews[index] = {
          ...preview,
          uploaded: !result.error,
          uploadedUrl: result.url,
          error: result.error,
        };
        uploadIndex++;
      }
    });

    setPreviews(updatedPreviews);

    // Call onUpload with successful URLs
    const uploadedUrls = results
      .filter(r => !r.error)
      .map(r => r.url);
    
    if (uploadedUrls.length > 0 && onUpload) {
      onUpload(uploadedUrls);
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index: number) => {
    setPreviews(prev => prev.map((p, i) => ({
      ...p,
      isMain: i === index,
    })));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div
          className="flex flex-col items-center justify-center p-8 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {allowMultiple ? `Up to ${maxFiles} files` : 'Single file'} • Max {maxSizeMB}MB each
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept.replace(/,/g, ', ').replace(/image\//g, '').toUpperCase()}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Preview Grid */}
      {showPreview && previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {previews.length} {previews.length === 1 ? 'file' : 'files'} selected
            </p>
            {previews.some(p => !p.uploaded) && (
              <Button
                size="sm"
                onClick={handleUploadAll}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload All
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <Card
                key={index}
                className={cn(
                  'relative group overflow-hidden',
                  preview.error && 'border-destructive'
                )}
              >
                <div className="aspect-square relative bg-muted">
                  <Image
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Status overlay */}
                  {preview.uploaded && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  )}
                  
                  {preview.error && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                  )}
                  
                  {/* Main image indicator */}
                  {preview.isMain && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Main
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!preview.isMain && !preview.uploaded && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainImage(index);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePreview(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* File info */}
                <div className="p-2">
                  <p className="text-xs truncate">{preview.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}