export const getPublicBaseUrl = (): string => {
  // Electron production: app loads from file://, overlays served by local Express on port 3456
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3456';
  }
  // Vite dev server or any other HTTP context — use current origin
  return window.location.origin;
};
