import { RphData } from '../types/rph';

export function getPdfFilename(data: RphData): string {
  const kod = (data.tajuk.kod || 'rph').replace(/[^a-zA-Z0-9.-]/g, '_');
  const tarikh = (data.tarikh || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9.-]/g, '_');
  return `RPH_${kod}_${tarikh}.pdf`;
}

export async function exportToPdf(elementId: string, data: RphData): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} tidak dijumpai.`);
  }

  const filename = getPdfFilename(data);

  try {
    // Dynamic import of html2pdf.js to avoid SSR/bundling issues
    // @ts-expect-error - html2pdf.js does not have official ts types
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: [8, 8, 8, 8], // mm
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('Ralat semasa menjana PDF melalui html2pdf:', err);
    // Fallback to window.print() if html2pdf encounters an issue
    window.print();
  }
}
