/**
 * Compression d'image dans le navigateur avant envoi (réduit le poids des photos de
 * smartphone et respecte la limite de 4,5 Mo par requête de certains hébergeurs).
 * Les PDF et formats non pris en charge sont renvoyés tels quels.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Remplace le fichier sélectionné d'un <input type="file"> par sa version compressée. */
export async function compressInputFile(input: HTMLInputElement, maxSide?: number): Promise<void> {
  const file = input.files?.[0];
  if (!file) return;
  const compressed = await compressImage(file, maxSide);
  if (compressed === file) return;
  const dt = new DataTransfer();
  dt.items.add(compressed);
  input.files = dt.files;
}
