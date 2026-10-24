/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_ENABLE_REPORT?: string;
  readonly VITE_ENABLE_SPEED?: string;
  readonly VITE_ENABLE_PLATES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
