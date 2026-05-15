export const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e8f5e9"/><rect width="400" height="300" fill="#c8e6c9" opacity="0.5"/></svg>'
  ).toString("base64");

export function getProductImageUrl(images: { url: string }[] | undefined, index = 0): string {
  if (!images || images.length === 0) return "";
  return images[index]?.url || "";
}

export function getImageAlt(images: { alt?: string | null }[] | undefined, productName: string, index = 0): string {
  if (!images || images.length === 0) return productName;
  return images[index]?.alt || `${productName} - Imagen ${index + 1}`;
}
