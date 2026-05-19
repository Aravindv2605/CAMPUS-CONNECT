interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_GROQ_API_KEY: string; // add this line
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}