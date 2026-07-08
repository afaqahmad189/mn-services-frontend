import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures an element and saves it as a single-page A4 PDF.
 * Content is scaled to fit — exactly like the browser's "Print" auto-scale.
 */
export const generatePDF = async (elementId, filename, orientation = 'portrait') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Cannot find area to print');
    return;
  }

  // Capture the element at 2x scale for sharp quality
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: element.offsetWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  // A4 page dimensions in mm
  const pageW = orientation === 'landscape' ? 297 : 210;
  const pageH = orientation === 'landscape' ? 210 : 297;

  // Scale to fit BOTH dimensions — same as browser "Fit to Page" on print
  const imgAspect = canvas.width / canvas.height;
  const pageAspect = pageW / pageH;

  let drawW, drawH;
  if (imgAspect > pageAspect) {
    // Content is wider relative to height — fit by width, height will be within page
    drawW = pageW;
    drawH = drawW / imgAspect;
  } else {
    // Content is taller relative to width — fit by height to avoid cutting off
    drawH = pageH;
    drawW = drawH * imgAspect;
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation, compress: true });
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH);
  // pdf.addImage(imgData, 'JPEG', 0, 0, drawW, drawH);
  pdf.save(filename || `Document_${new Date().getTime()}.pdf`);
};
