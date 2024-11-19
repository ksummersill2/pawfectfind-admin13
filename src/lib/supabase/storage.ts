import { supabase, adminSupabase } from './client';

export type ImageBucket = 'blog-images' | 'breeds' | 'products' | 'profiles';

const REQUIRED_BUCKETS: ImageBucket[] = ['blog-images', 'breeds', 'products', 'profiles'];

export const initializeStorage = async () => {
  const isDevelopment = import.meta.env.DEV;

  // Skip initialization in development if no proper configuration
  if (isDevelopment && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
    console.warn('Storage initialization skipped: Development environment without proper Supabase configuration');
    return;
  }

  try {
    // First check if buckets exist
    for (const bucketName of REQUIRED_BUCKETS) {
      try {
        const { data: bucket, error } = await adminSupabase.storage.getBucket(bucketName);
        
        if (error && error.message.includes('does not exist')) {
          // Create bucket if it doesn't exist
          const { error: createError } = await adminSupabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          });

          if (createError && !createError.message.includes('already exists')) {
            console.warn(`Failed to create bucket ${bucketName}:`, createError);
          }
        }
      } catch (err) {
        console.warn(`Error checking/creating bucket ${bucketName}:`, err);
        continue; // Continue with other buckets even if one fails
      }
    }
  } catch (err) {
    console.warn('Storage initialization warning:', err);
    // Don't throw error to prevent app from crashing
  }
};

export const uploadImage = async (
  file: File,
  bucket: ImageBucket,
  options?: {
    maxSizeMB?: number;
    quality?: number;
    folder?: string;
  }
): Promise<string> => {
  try {
    const { maxSizeMB = 5, quality = 0.8, folder = '' } = options || {};

    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const filePath = folder ? `${folder}/${fileName}.${fileExt}` : `${fileName}.${fileExt}`;

    // Ensure bucket exists before uploading
    try {
      const { data: bucket, error: bucketError } = await adminSupabase.storage.getBucket(bucket);
      if (bucketError && bucketError.message.includes('does not exist')) {
        await initializeStorage();
      }
    } catch (err) {
      console.warn('Error checking bucket:', err);
      // Continue anyway as the bucket might still work
    }

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Error uploading image:', err);
    throw err;
  }
};

export const deleteImage = async (path: string, bucket: ImageBucket): Promise<void> => {
  if (!path) return;

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error && !error.message.includes('Object not found')) {
      throw error;
    }
  } catch (err) {
    console.error('Error deleting image:', err);
    // Don't throw error for delete operations to prevent UI disruption
  }
};