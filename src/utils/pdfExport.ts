import { RphData } from '../types/rph';

export function getPdfFilename(data: RphData): string {
  const kod = (data.tajuk.kod || 'rph').replace(/[^a-zA-Z0-9.-]/g, '_');
  const tarikh = (data.tarikh || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9.-]/g, '_');
  return `RPH_${kod}_${tarikh}.pdf`;
}

/**
 * Muat turun dokumen RPH sebagai fail PDF A4 berkualiti tinggi.
 * - Menyokong eksport daripada telefon (termasuk apabila pratonton tersembunyi/dizum) dengan mengklon ke lebar desktop A4 tepat (780px).
 * - Memastikan 1 hingga 4 RPH dimuatkan dengan kemas dalam 1 muka surat A4 tanpa halaman kosong di muka 1.
 */
export async function exportToPdf(elementId: string, data: RphData): Promise<void> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Element #${elementId} tidak dijumpai.`);
  }

  const filename = getPdfFilename(data);
  const slotCount = data.slots && data.slots.length > 0 ? data.slots.length : 1;
  const shouldFitSingleA4 = slotCount <= 4;

  // Offscreen desktop-width staging container so iPhone/Android narrow viewports & preview zoom never distort A4 PDF
  const stagingHost = document.createElement('div');
  stagingHost.style.position = 'fixed';
  stagingHost.style.left = '-12000px';
  stagingHost.style.top = '0';
  stagingHost.style.width = '780px';
  stagingHost.style.backgroundColor = '#ffffff';
  stagingHost.style.zIndex = '-1';
  stagingHost.style.pointerEvents = 'none';

  const clonedElement = sourceElement.cloneNode(true) as HTMLElement;
  clonedElement.id = `${elementId}-pdf-staging`;
  clonedElement.style.width = '780px';
  clonedElement.style.maxWidth = '780px';
  clonedElement.style.margin = '0';
  clonedElement.style.padding = slotCount >= 3 ? '12px 16px' : '18px 20px';
  clonedElement.style.border = 'none';
  clonedElement.style.borderRadius = '0';
  clonedElement.style.boxShadow = 'none';
  clonedElement.style.transform = 'none';
  clonedElement.style.backgroundColor = '#ffffff';

  // Neutralize break-inside-avoid spacing glitches during html2pdf canvas capture
  clonedElement.querySelectorAll('.break-inside-avoid').forEach((el) => {
    (el as HTMLElement).style.breakInside = 'auto';
    (el as HTMLElement).style.pageBreakInside = 'auto';
  });

  stagingHost.appendChild(clonedElement);
  document.body.appendChild(stagingHost);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // @ts-expect-error - html2pdf.js does not have official ts types
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // A4 Portrait (210 x 297 mm) with 5mm top/bottom & 6mm side margins -> inner 198 x 287 mm
    const marginTopBottom = 5;
    const marginLeftRight = 6;
    const innerRatio = (297 - marginTopBottom * 2) / (210 - marginLeftRight * 2); // 287 / 198 ≈ 1.4495

    const opt = {
      margin: [marginTopBottom, marginLeftRight, marginTopBottom, marginLeftRight],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      pagebreak: { mode: [] as string[] },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        width: 780,
        windowWidth: 780,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    const worker = html2pdf().set(opt).from(clonedElement);

    if (shouldFitSingleA4) {
      // Capture canvas first so 1-4 RPHs ALWAYS land cleanly on Page 1 (1 of 1) without spilling blank pages
      await worker.toCanvas();
      const rawCanvas: HTMLCanvasElement | undefined = worker.prop?.canvas;

      if (rawCanvas) {
        const maxSinglePageHeight = Math.floor(rawCanvas.width * innerRatio);
        if (rawCanvas.height > maxSinglePageHeight) {
          const fitScale = maxSinglePageHeight / rawCanvas.height;
          const fittedCanvas = document.createElement('canvas');
          fittedCanvas.width = rawCanvas.width;
          fittedCanvas.height = maxSinglePageHeight;
          const ctx = fittedCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, fittedCanvas.width, fittedCanvas.height);
            const targetW = Math.floor(rawCanvas.width * fitScale);
            const offsetX = Math.floor((rawCanvas.width - targetW) / 2);
            ctx.drawImage(rawCanvas, offsetX, 0, targetW, maxSinglePageHeight);
            worker.prop.canvas = fittedCanvas;
          }
        }
      }

      await worker.toPdf().save();
    } else {
      await worker.save();
    }
  } catch (err) {
    console.error('Ralat semasa menjana PDF melalui html2pdf:', err);
    window.print();
  } finally {
    if (stagingHost.parentNode) {
      stagingHost.parentNode.removeChild(stagingHost);
    }
  }
}
