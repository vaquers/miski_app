/// <reference types="vite/client" />

declare module '*.JPG' {
  const src: string;
  export default src;
}

declare const __BUILD_COMMIT__: string;
declare const __BUILD_TIME__: string;
