import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportToPDF(elementId, fileName = "resume.pdf") {
  const element = document.getElementById(elementId);
  if (!element) return alert("Element not found!");

  // Create canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: document.documentElement.offsetWidth,
    windowHeight: document.documentElement.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  let position = 0;
  let heightLeft = pdfHeight;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();

  while (heightLeft > 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }

  pdf.save(fileName);
}
