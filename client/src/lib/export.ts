import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportToWord(content: string, filename: string = 'nepali-document.docx') {
  // Clean HTML content and convert to plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';

  // Split text into paragraphs
  const paragraphs = plainText.split('\n').filter(p => p.trim().length > 0);

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs.map(text => 
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: text.trim(),
              font: "Mangal", // Nepali Unicode font
              size: 24, // 12pt font size
            }),
          ],
        })
      ),
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('Export to Word failed:', error);
    throw new Error('Failed to export document to Word format');
  }
}

export async function exportToPDF(content: string, filename: string = 'nepali-document.pdf') {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  // Style the content for PDF export
  const styledContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Nepali Document</title>
      <style>
        @page {
          margin: 1in;
        }
        body {
          font-family: 'Mangal', 'Kalimati', serif;
          font-size: 12pt;
          line-height: 1.6;
          text-align: justify;
          color: black;
        }
        p {
          margin-bottom: 1em;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  printWindow.document.write(styledContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}
