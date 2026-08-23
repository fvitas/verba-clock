// Vite resolves `import flag from '...svg'` to a URL string. Declared here rather than
// via `vite/client` because vite is not a direct dependency, so its types aren't resolvable.
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}
