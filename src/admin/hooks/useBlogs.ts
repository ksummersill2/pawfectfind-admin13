import { useState, useEffect } from 'react';
import { adminSupabase } from '../../lib/supabase/client';
import { useAuth } from '../../auth/hooks/useAuth';
import { BlogPost, BlogFormData } from '../types/blog';
import { generateSlug, ensureUniqueSlug } from '../utils/slugify';

export const useBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBlogs = async (): Promise<BlogPost[]> => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await adminSupabase
        .from('blog_posts')
        .select(`
          *,
          categories (
            id,
            name,
            description,
            icon,
            type
          ),
          blog_breed_associations (
            breed:dog_breeds(
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedData = data?.map(blog => ({
        ...blog,
        breeds: blog.blog_breed_associations?.map((assoc: any) => assoc.breed),
        breed_ids: blog.blog_breed_associations?.map((assoc: any) => assoc.breed.id)
      })) || [];

      setBlogs(transformedData);
      return transformedData;
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveBlog = async (blogData: BlogFormData): Promise<BlogPost | null> => {
    if (!user) {
      setError('You must be logged in to save a blog post');
      return null;
    }

    try {
      setLoading(true);
      const timestamp = new Date().toISOString();
      const { breed_ids, ...postData } = blogData;

      // Generate a unique slug
      const slug = await ensureUniqueSlug(generateSlug(blogData.title));

      // Create new blog post
      const { data: savedBlog, error: insertError } = await adminSupabase
        .from('blog_posts')
        .insert([{
          title: postData.title,
          slug,
          content: postData.content,
          excerpt: postData.excerpt,
          cover_image: postData.cover_image,
          author_id: user.id,
          status: postData.status || 'draft',
          published_at: null,
          tags: postData.tags || [],
          category_id: postData.category_id || null,
          meta_description: postData.meta_description,
          meta_keywords: postData.meta_keywords || [],
          created_at: timestamp,
          updated_at: timestamp,
          views_count: 0,
          likes_count: 0,
          featured: false,
          allow_comments: true,
          scheduled_for: postData.scheduled_for
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Handle breed associations if any
      if (savedBlog && breed_ids?.length) {
        const breedAssociations = breed_ids.map(breedId => ({
          blog_id: savedBlog.id,
          breed_id: breedId,
          created_at: timestamp,
          updated_at: timestamp
        }));

        const { error: associationError } = await adminSupabase
          .from('blog_breed_associations')
          .insert(breedAssociations);

        if (associationError) throw associationError;
      }

      await fetchBlogs();
      return savedBlog;
    } catch (err) {
      console.error('Error saving blog:', err);
      setError('Failed to save blog post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (blogId: string, blogData: BlogFormData): Promise<BlogPost | null> => {
    if (!user) {
      setError('You must be logged in to update a blog post');
      return null;
    }

    try {
      setLoading(true);
      const timestamp = new Date().toISOString();
      const { breed_ids, ...postData } = blogData;

      // Generate a unique slug if title changed
      const slug = await ensureUniqueSlug(generateSlug(blogData.title), blogId);

      const { data: savedBlog, error: updateError } = await adminSupabase
        .from('blog_posts')
        .update({
          ...postData,
          slug,
          updated_at: timestamp
        })
        .eq('id', blogId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update breed associations
      await adminSupabase
        .from('blog_breed_associations')
        .delete()
        .eq('blog_id', blogId);

      if (breed_ids?.length) {
        const breedAssociations = breed_ids.map(breedId => ({
          blog_id: blogId,
          breed_id: breedId,
          created_at: timestamp,
          updated_at: timestamp
        }));

        const { error: associationError } = await adminSupabase
          .from('blog_breed_associations')
          .insert(breedAssociations);

        if (associationError) throw associationError;
      }

      await fetchBlogs();
      return savedBlog;
    } catch (err) {
      console.error('Error updating blog:', err);
      setError('Failed to update blog post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to delete a blog post');
      return false;
    }

    try {
      setLoading(true);
      
      // Delete breed associations first
      await adminSupabase
        .from('blog_breed_associations')
        .delete()
        .eq('blog_id', blogId);

      // Then delete the blog post
      const { error: deleteError } = await adminSupabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId)
        .eq('author_id', user.id);

      if (deleteError) throw deleteError;
      
      await fetchBlogs();
      return true;
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Failed to delete blog post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const publishBlog = async (blogId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to publish a blog post');
      return false;
    }

    try {
      setLoading(true);
      const { error: publishError } = await adminSupabase
        .from('blog_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', blogId)
        .eq('author_id', user.id);

      if (publishError) throw publishError;
      await fetchBlogs();
      return true;
    } catch (err) {
      console.error('Error publishing blog:', err);
      setError('Failed to publish blog post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return {
    blogs,
    loading,
    error,
    fetchBlogs,
    saveBlog,
    updateBlog,
    deleteBlog,
    publishBlog
  };
};

export default useBlogs;