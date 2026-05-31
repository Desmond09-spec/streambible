export const getPublicBaseUrl = (): string => {
  if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
    return 'https://streambible.vercel.app';
  }
  return window.location.origin;
};
