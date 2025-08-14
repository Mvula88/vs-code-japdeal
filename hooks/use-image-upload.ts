'use client';

import { useState, useCallback } from 'react';
import { storageClient, type ImageUploadOptions, type UploadResult } from '@/lib/storage/client';
import { toast } from 'sonner';

export type UploadState = {
  isUploading: boolean;
  progress: number;
  uploadedFiles: UploadResult[];
  errors: string[];
};

export function useImageUpload(options?: Partial<ImageUploadOptions>) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    errors: [],
  });

  const uploadSingle = useCallback(async (
    file: File,
    uploadOptions?: Partial<ImageUploadOptions>
  ): Promise<UploadResult | null> => {
    setState(prev => ({ ...prev, isUploading: true, progress: 0, errors: [] }));

    const mergedOptions: ImageUploadOptions = {
      bucket: 'car-images',
      ...options,
      ...uploadOptions,
    };

    try {
      // Validate file size
      const maxSize = (mergedOptions.maxSizeMB || 5) * 1024 * 1024;
      if (file.size > maxSize) {
        const error = `File ${file.name} exceeds ${mergedOptions.maxSizeMB || 5}MB limit`;
        setState(prev => ({
          ...prev,
          isUploading: false,
          errors: [...prev.errors, error],
        }));
        toast.error(error);
        return null;
      }

      // Upload file
      setState(prev => ({ ...prev, progress: 50 }));
      const result = await storageClient.uploadFile(file, mergedOptions);

      if (result.error) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          progress: 0,
          errors: [...prev.errors, result.error!],
        }));
        toast.error(result.error);
        return null;
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedFiles: [...prev.uploadedFiles, result],
      }));

      toast.success(`${file.name} uploaded successfully`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        errors: [...prev.errors, errorMessage],
      }));
      toast.error(errorMessage);
      return null;
    }
  }, [options]);

  const uploadMultiple = useCallback(async (
    files: File[],
    uploadOptions?: Partial<ImageUploadOptions>
  ): Promise<UploadResult[]> => {
    setState(prev => ({ ...prev, isUploading: true, progress: 0, errors: [] }));

    const mergedOptions: ImageUploadOptions = {
      bucket: 'car-images',
      ...options,
      ...uploadOptions,
    };

    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = ((i + 1) / files.length) * 100;
      setState(prev => ({ ...prev, progress }));

      try {
        const result = await storageClient.uploadFile(file, mergedOptions);
        
        if (result.error) {
          errors.push(`${file.name}: ${result.error}`);
        } else {
          results.push(result);
        }
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }

    setState(prev => ({
      ...prev,
      isUploading: false,
      progress: 100,
      uploadedFiles: [...prev.uploadedFiles, ...results],
      errors: [...prev.errors, ...errors],
    }));

    if (errors.length > 0) {
      toast.error(`${errors.length} file(s) failed to upload`);
    }
    
    if (results.length > 0) {
      toast.success(`${results.length} file(s) uploaded successfully`);
    }

    return results;
  }, [options]);

  const deleteFile = useCallback(async (
    bucket: ImageUploadOptions['bucket'],
    path: string
  ): Promise<boolean> => {
    try {
      const success = await storageClient.deleteFile(bucket, path);
      
      if (success) {
        setState(prev => ({
          ...prev,
          uploadedFiles: prev.uploadedFiles.filter(f => f.path !== path),
        }));
        toast.success('File deleted successfully');
      } else {
        toast.error('Failed to delete file');
      }
      
      return success;
    } catch (error) {
      toast.error('Failed to delete file');
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      errors: [],
    });
  }, []);

  return {
    ...state,
    uploadSingle,
    uploadMultiple,
    deleteFile,
    reset,
  };
}