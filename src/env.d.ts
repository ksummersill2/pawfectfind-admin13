/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAPID_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_KEY: string;
  readonly VITE_UNSPLASH_ACCESS_KEY: string;
  readonly VITE_UNSPLASH_SECRET_KEY: string;
  readonly VITE_UNSPLASH_APP_NAME: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_YOUTUBE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}