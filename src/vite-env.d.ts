/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CPP_COMPILER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}