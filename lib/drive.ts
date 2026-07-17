// Descarga de archivos públicos de Google Drive (por link, sin credenciales).
// Los .xlsx de la carpeta compartida se bajan directo desde el endpoint `uc`.

export async function downloadXlsx(fileId: string): Promise<Uint8Array> {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Drive ${fileId}: HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") ?? "";
  const buf = new Uint8Array(await res.arrayBuffer());
  // El interstitial de análisis antivirus (archivos grandes) o un archivo no
  // público devuelven HTML en vez del binario.
  if (ct.includes("text/html")) {
    throw new Error(
      `Drive ${fileId}: se recibió HTML en vez del archivo (¿no es público o es demasiado grande?).`,
    );
  }
  return buf;
}
