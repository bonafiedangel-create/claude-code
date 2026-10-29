/** Downscale an uploaded image so it stays small enough to store and export quickly. */
export function loadImage(file: File, max = 1500, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Choose an image file.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const ctx = c.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable.'));
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      // PNG keeps transparency for logos; photos go JPEG.
      resolve(file.type === 'image/png' && max <= 600 ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });
}
