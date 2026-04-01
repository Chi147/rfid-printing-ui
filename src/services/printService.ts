export function printLabelFromHtml(labelHtml: string): boolean {
  const printWindow = window.open("", "", "width=500,height=300");

  if (!printWindow) {
    return false;
  }

  const doc = printWindow.document;
  doc.open();
  doc.head.innerHTML = `
    <title>Print Label</title>
    <style>
      @page { size: 82mm 38mm; margin: 0; }
      html, body {
        width: 82mm;
        height: 38mm;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-root {
        width: 82mm;
        height: 38mm;
        margin: 0;
        padding: 0;
      }
    </style>
  `;
  doc.body.innerHTML = `<div class="print-root">${labelHtml}</div>`;
  doc.close();

  printWindow.focus();
  printWindow.print();
  printWindow.close();

  return true;
}