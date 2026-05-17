export const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlOGY1ZTkiLz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2M4ZTZjOSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+";

export function getProductImageUrl(images: { url: string }[] | undefined, index = 0): string {
  if (!images || images.length === 0) return "";
  return images[index]?.url || "";
}

export function getImageAlt(images: { alt?: string | null }[] | undefined, productName: string, index = 0): string {
  if (!images || images.length === 0) return productName;
  return images[index]?.alt || `${productName} - Imagen ${index + 1}`;
}
