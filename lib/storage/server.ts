import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export type ProcessedImage = {
  original: { path: string; url: string };
  thumbnail?: { path: string; url: string };
  optimized?: { path: string; url: string };
};

export class ServerStorageClient {
  private supabase: SupabaseClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    this.supabase = await createServerSupabaseClient();
  }

  /**
   * Process and optimize image before upload
   */
  async processImage(buffer: Buffer, options?: {
    generateThumbnail?: boolean;
    thumbnailSize?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<{
    original: Buffer;
    thumbnail?: Buffer;
    optimized?: Buffer;
  }> {
    const {
      generateThumbnail = true,
      thumbnailSize = 300,
      quality = 85,
      format = 'jpeg'
    } = options || {};

    const result: {
      original: Buffer;
      thumbnail?: Buffer;
      optimized?: Buffer;
    } = { original: buffer };

    try {
      // Optimize original image
      result.optimized = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        })
        [format]({ quality })
        .toBuffer();

      // Generate thumbnail if requested
      if (generateThumbnail) {
        result.thumbnail = await sharp(buffer)
          .rotate()
          .resize(thumbnailSize, thumbnailSize, {
            fit: 'cover',
            position: 'center'
          })
          [format]({ quality: 80 })
          .toBuffer();
      }
    } catch (error) {
      console.error('Image processing error:', error);
    }

    return result;
  }

  /**
   * Upload processed images to storage
   */
  async uploadProcessedImages(
    carId: string,
    fileBuffer: Buffer,
    fileName: string,
    options?: {
      generateThumbnail?: boolean;
      isMainImage?: boolean;
    }
  ): Promise<ProcessedImage | null> {
    if (!this.supabase) {
      await this.initializeClient();
    }

    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10);
      const extension = fileName.split('.').pop();
      const baseFileName = `${carId}/${timestamp}_${random}`;

      // Process the image
      const processed = await this.processImage(fileBuffer, {
        generateThumbnail: options?.generateThumbnail ?? true,
      });

      const result: ProcessedImage = {
        original: { path: '', url: '' }
      };

      // Upload optimized image
      if (processed.optimized) {
        const optimizedPath = `${baseFileName}.${extension}`;
        const { data: optimizedData, error: optimizedError } = await this.supabase!.storage
          .from('car-images')
          .upload(optimizedPath, processed.optimized, {
            contentType: `image/${extension}`,
            cacheControl: '3600',
          });

        if (!optimizedError && optimizedData) {
          const { data: { publicUrl } } = this.supabase!.storage
            .from('car-images')
            .getPublicUrl(optimizedData.path);

          result.original = {
            path: optimizedData.path,
            url: publicUrl,
          };
        }
      }

      // Upload thumbnail if generated
      if (processed.thumbnail) {
        const thumbnailPath = `${baseFileName}_thumb.${extension}`;
        const { data: thumbData, error: thumbError } = await this.supabase!.storage
          .from('car-thumbnails')
          .upload(thumbnailPath, processed.thumbnail, {
            contentType: `image/${extension}`,
            cacheControl: '3600',
          });

        if (!thumbError && thumbData) {
          const { data: { publicUrl } } = this.supabase!.storage
            .from('car-thumbnails')
            .getPublicUrl(thumbData.path);

          result.thumbnail = {
            path: thumbData.path,
            url: publicUrl,
          };
        }
      }

      // Save image records to database
      if (result.original.path) {
        const { error: dbError } = await this.supabase!
          .from('lot_images')
          .insert({
            car_id: carId,
            file_path: result.original.url,
            thumbnail_path: result.thumbnail?.url,
            is_thumbnail: options?.isMainImage || false,
            display_order: options?.isMainImage ? 0 : 999,
          });

        if (dbError) {
          console.error('Database error saving image:', dbError);
        }
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }

  /**
   * Bulk upload images for a car
   */
  async bulkUploadCarImages(
    carId: string,
    files: Array<{ buffer: Buffer; name: string; isMain?: boolean }>
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadProcessedImages(
        carId,
        file.buffer,
        file.name,
        {
          generateThumbnail: true,
          isMainImage: file.isMain || i === 0, // First image is main if not specified
        }
      );

      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Delete all images for a car
   */
  async deleteCarImages(carId: string): Promise<boolean> {
    if (!this.supabase) {
      await this.initializeClient();
    }

    try {
      // Get all image records from database
      const { data: images, error: fetchError } = await this.supabase!
        .from('lot_images')
        .select('file_path, thumbnail_path')
        .eq('car_id', carId);

      if (fetchError || !images) return false;

      // Extract file paths from URLs
      const imagePaths: string[] = [];
      const thumbnailPaths: string[] = [];

      images.forEach(img => {
        if (img.file_path) {
          const path = this.extractPathFromUrl(img.file_path, 'car-images');
          if (path) imagePaths.push(path);
        }
        if (img.thumbnail_path) {
          const path = this.extractPathFromUrl(img.thumbnail_path, 'car-thumbnails');
          if (path) thumbnailPaths.push(path);
        }
      });

      // Delete from storage
      if (imagePaths.length > 0) {
        await this.supabase!.storage
          .from('car-images')
          .remove(imagePaths);
      }

      if (thumbnailPaths.length > 0) {
        await this.supabase!.storage
          .from('car-thumbnails')
          .remove(thumbnailPaths);
      }

      // Delete from database
      const { error: deleteError } = await this.supabase!
        .from('lot_images')
        .delete()
        .eq('car_id', carId);

      return !deleteError;
    } catch (error) {
      console.error('Delete images error:', error);
      return false;
    }
  }

  /**
   * Extract storage path from public URL
   */
  private extractPathFromUrl(url: string, bucket: string): string | null {
    try {
      const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`);
      const match = url.match(pattern);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get signed URLs for private documents
   */
  async getSignedUrls(paths: string[], expiresIn = 3600): Promise<string[]> {
    if (!this.supabase) {
      await this.initializeClient();
    }

    const urls: string[] = [];

    for (const path of paths) {
      const { data, error } = await this.supabase!.storage
        .from('documents')
        .createSignedUrl(path, expiresIn);

      urls.push(error ? '' : data.signedUrl);
    }

    return urls;
  }
}

export const serverStorageClient = new ServerStorageClient();