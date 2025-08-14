# Supabase Storage Setup Guide

## Overview
This document explains how to configure and use Supabase Storage for handling images and documents in the JapDEAL platform.

## Storage Buckets

### 1. car-images
- **Purpose**: Store full-size car images
- **Access**: Public read, authenticated upload
- **Max file size**: 5MB
- **Allowed types**: JPEG, PNG, WebP
- **URL pattern**: `/storage/v1/object/public/car-images/[car-id]/[filename]`

### 2. car-thumbnails
- **Purpose**: Store thumbnail versions of car images
- **Access**: Public read, authenticated upload
- **Max file size**: 2MB
- **Allowed types**: JPEG, PNG, WebP
- **URL pattern**: `/storage/v1/object/public/car-thumbnails/[car-id]/[filename]_thumb`

### 3. documents
- **Purpose**: Store private documents (invoices, inspection reports)
- **Access**: Private (owner and admin only)
- **Max file size**: 10MB
- **Allowed types**: PDF, JPEG, PNG
- **URL pattern**: Requires signed URL for access

## Setup Instructions

### 1. Run Migration
Execute the storage setup migration to create buckets and policies:

```bash
npx supabase db push
```

Or manually run the SQL in Supabase Dashboard:
```sql
-- See: supabase/migrations/20240115_storage_setup.sql
```

### 2. Environment Variables
Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-side only)
```

## Usage Examples

### Client-Side Upload (React)

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

function CarImageUploader() {
  const handleUpload = (urls: string[]) => {
    console.log('Uploaded images:', urls);
  };

  return (
    <ImageUpload
      bucket="car-images"
      folder="cars/toyota"
      maxFiles={10}
      maxSizeMB={5}
      onUpload={handleUpload}
    />
  );
}
```

### Using the Upload Hook

```tsx
import { useImageUpload } from '@/hooks/use-image-upload';

function MyComponent() {
  const { uploadSingle, uploadMultiple, isUploading, progress } = useImageUpload({
    bucket: 'car-images',
    folder: 'lots/2024',
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const results = await uploadMultiple(files);
    console.log('Upload results:', results);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      {isUploading && <progress value={progress} max={100} />}
    </div>
  );
}
```

### Server-Side Processing

```ts
import { ServerStorageClient } from '@/lib/storage/server';

// In an API route or server action
const storageClient = new ServerStorageClient();

// Upload with automatic image optimization and thumbnail generation
const result = await storageClient.uploadProcessedImages(
  carId,
  imageBuffer,
  'toyota-camry.jpg',
  {
    generateThumbnail: true,
    isMainImage: true,
  }
);

// Bulk upload multiple images
const results = await storageClient.bulkUploadCarImages(
  carId,
  [
    { buffer: buffer1, name: 'front.jpg', isMain: true },
    { buffer: buffer2, name: 'side.jpg' },
    { buffer: buffer3, name: 'interior.jpg' },
  ]
);

// Delete all images for a car
await storageClient.deleteCarImages(carId);
```

### Direct Storage Client Usage

```ts
import { storageClient } from '@/lib/storage/client';

// Upload a single file
const result = await storageClient.uploadFile(file, {
  bucket: 'car-images',
  folder: 'temp',
  maxSizeMB: 5,
});

// Delete a file
await storageClient.deleteFile('car-images', 'temp/image.jpg');

// Get signed URL for private document
const signedUrl = await storageClient.getSignedUrl(
  'documents',
  'invoice-123.pdf',
  3600 // expires in 1 hour
);
```

## Image Processing Features

### Automatic Optimization
- Images are automatically resized to max 1920x1920 pixels
- Quality is optimized to 85% for balance between quality and file size
- EXIF rotation is applied automatically
- Format conversion available (JPEG, PNG, WebP)

### Thumbnail Generation
- Thumbnails are automatically created at 300x300 pixels
- Center-cropped for consistent appearance
- Stored in separate bucket for faster loading

## Security Policies

### Public Buckets (car-images, car-thumbnails)
- Anyone can view images
- Only authenticated users can upload
- Users can update/delete their own uploads
- Admins have full access

### Private Bucket (documents)
- Only owner and admins can view
- Authenticated users can upload
- Users can only manage their own documents

## Best Practices

1. **Always validate file types and sizes** on the client before upload
2. **Use folders** to organize files (e.g., `cars/[car-id]/[timestamp]`)
3. **Generate unique filenames** to avoid conflicts
4. **Clean up unused images** when deleting records
5. **Use thumbnails** for list views to improve performance
6. **Implement retry logic** for failed uploads
7. **Show upload progress** for better UX

## Troubleshooting

### Common Issues

1. **"File size exceeds limit"**
   - Check bucket configuration for file_size_limit
   - Validate file size on client before upload

2. **"Invalid file type"**
   - Ensure file MIME type is in allowed_mime_types
   - Check file extension matches content

3. **"Permission denied"**
   - Verify user is authenticated
   - Check RLS policies are correctly configured

4. **"Failed to generate thumbnail"**
   - Ensure Sharp is properly installed
   - Check image format is supported

## Monitoring

### Storage Usage
Check storage usage in Supabase Dashboard:
- Total storage used
- Number of objects
- Bandwidth usage

### Cleanup
Regularly clean up orphaned images:
```sql
-- Find lot_images without corresponding lots
SELECT li.* FROM lot_images li
LEFT JOIN lots l ON li.car_id = l.car_id
WHERE l.id IS NULL;
```

## API Endpoints

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

Fields:
- file: File
- carId: string
- isMainImage: boolean
```

### Delete Car Images
```
DELETE /api/upload?carId=[car-id]
```

## Migration Rollback

If needed, rollback storage setup:

```sql
-- Delete policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
-- ... (all other policies)

-- Delete buckets (WARNING: This will delete all files!)
DELETE FROM storage.buckets WHERE id IN ('car-images', 'car-thumbnails', 'documents');

-- Drop functions
DROP FUNCTION IF EXISTS generate_unique_filename(text);
DROP FUNCTION IF EXISTS get_storage_url(text, text);
```