import { createClient } from '@/lib/supabase/client';

export type ImageUploadOptions = {
  bucket: 'car-images' | 'car-thumbnails' | 'documents';
  folder?: string;
  fileName?: string;
  maxSizeMB?: number;
};

export type UploadResult = {
  path: string;
  url: string;
  error?: string;
};

class StorageClient {
  private supabase = createClient();

  /**
   * Validates file before upload
   */
  private validateFile(file: File, options: ImageUploadOptions): string | null {
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      return `File size exceeds ${options.maxSizeMB || 5}MB limit`;
    }

    const allowedTypes = {
      'car-images': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      'car-thumbnails': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      'documents': ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    };

    if (!allowedTypes[options.bucket].includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  }

  /**
   * Generates a unique file name
   */
  private generateFileName(originalName: string, customName?: string): string {
    if (customName) return customName;
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const extension = originalName.split('.').pop();
    
    return `${timestamp}_${random}.${extension}`;
  }

  /**
   * Uploads a single file to Supabase storage
   */
  async uploadFile(file: File, options: ImageUploadOptions): Promise<UploadResult> {
    try {
      // Validate file
      const validationError = this.validateFile(file, options);
      if (validationError) {
        return { path: '', url: '', error: validationError };
      }

      // Generate file path
      const fileName = this.generateFileName(file.name, options.fileName);
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      // Upload to Supabase
      const { data, error } = await this.supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { path: '', url: '', error: error.message };
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: publicUrl,
      };
    } catch (error) {
      return {
        path: '',
        url: '',
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Uploads multiple files
   */
  async uploadMultiple(
    files: File[],
    options: ImageUploadOptions
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(bucket: ImageUploadOptions['bucket'], path: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Deletes multiple files
   */
  async deleteMultiple(bucket: ImageUploadOptions['bucket'], paths: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove(paths);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Moves a file to a different location
   */
  async moveFile(
    bucket: ImageUploadOptions['bucket'],
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    try {
      const { data, error: downloadError } = await this.supabase.storage
        .from(bucket)
        .download(fromPath);

      if (downloadError || !data) return false;

      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(toPath, data, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) return false;

      // Delete original file
      await this.deleteFile(bucket, fromPath);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets a signed URL for private files
   */
  async getSignedUrl(
    bucket: ImageUploadOptions['bucket'],
    path: string,
    expiresIn = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      return error ? null : data.signedUrl;
    } catch {
      return null;
    }
  }

  /**
   * Lists files in a folder
   */
  async listFiles(bucket: ImageUploadOptions['bucket'], folder?: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
        });

      return error ? [] : data;
    } catch {
      return [];
    }
  }
}

export const storageClient = new StorageClient();