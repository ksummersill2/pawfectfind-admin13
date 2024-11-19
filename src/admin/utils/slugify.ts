import { adminSupabase } from '../../lib/supabase/client';

export const generateSlug = (text: string): string => {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return slug;
};

export const ensureUniqueSlug = async (slug: string, blogId?: string): Promise<string> => {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const query = adminSupabase
      .from('blog_posts')
      .select('id')
      .eq('slug', uniqueSlug);

    if (blogId) {
      query.neq('id', blogId);
    }

    const { data } = await query.single();

    if (!data) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};