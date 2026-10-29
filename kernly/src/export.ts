import { getFontEmbedCSS, toJpeg, toPng } from 'html-to-image';

function download(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'slides';

async function snap(node: HTMLElement, w: number, h: number, fontCSS: string, jpeg = false) {
  const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true, fontEmbedCSS: fontCSS, backgroundColor: '#ffffff' };
  // JPEG keeps PDFs small enough to email; PNG stays lossless for images and the ZIP.
  return jpeg ? toJpeg(node, { ...opts, quality: 0.92 }) : toPng(node, opts);
}

export async function exportPng(root: HTMLElement, index: number, w: number, h: number, title: string) {
  const node = root.querySelector<HTMLElement>(`[data-ex="${index}"]`);
  if (!node) return;
  await document.fonts.ready;
  const css = await getFontEmbedCSS(node);
  download(await snap(node, w, h, css), `${slug(title)}-${index + 1}.png`);
}

export async function exportAll(root: HTMLElement, count: number, w: number, h: number, title: string, as: 'zip' | 'pdf') {
  await document.fonts.ready;
  const nodes = Array.from({ length: count }, (_, i) => root.querySelector<HTMLElement>(`[data-ex="${i}"]`)!);
  const css = await getFontEmbedCSS(nodes[0]);
  const shots: string[] = [];
  for (const n of nodes) shots.push(await snap(n, w, h, css, as === 'pdf'));

  if (as === 'zip') {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    shots.forEach((s, i) => zip.file(`${slug(title)}-${String(i + 1).padStart(2, '0')}.png`, s.split(',')[1], { base64: true }));
    const url = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));
    download(url, `${slug(title)}.zip`);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'px', format: [w, h], hotfixes: ['px_scaling'] });
  shots.forEach((s, i) => {
    if (i > 0) pdf.addPage([w, h], w > h ? 'landscape' : 'portrait');
    pdf.addImage(s, 'JPEG', 0, 0, w, h);
  });
  pdf.save(`${slug(title)}.pdf`);
}
