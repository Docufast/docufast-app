// Prepares a passport photo or e-signature for LagosCoMiS: JPEG, 100 KB or less (#185,
// first live filing 19 Oct 2026). Runs in the browser; nothing is uploaded.

const MAX_BYTES = 100 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file is not an image the browser can read."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not convert the image."))), "image/jpeg", quality)
  );
}

export async function toCourtJpeg(file: File, maxSide = 1200): Promise<Blob> {
  const img = await loadImage(file);
  let scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  for (let pass = 0; pass < 6; pass++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot convert images.");
    ctx.fillStyle = "#FFFFFF"; // signatures with transparent backgrounds become white, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
      const blob = await toBlob(canvas, quality);
      if (blob.size <= MAX_BYTES) return blob;
    }
    scale *= 0.75;
  }
  throw new Error("Could not get this image under 100 KB. Try a smaller or cropped image.");
}
