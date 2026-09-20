const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
const outputPath = 'C:\\NLAMS_Vajracore\\Sample_Title_Deed.pdf';
doc.pipe(fs.createWriteStream(outputPath));

doc.fontSize(24).text('Sample Title Deed', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('This is a sample document generated for testing the NLAMS 2.0 system.');
doc.moveDown();
doc.text('Owner Name: Ganesh Patil');
doc.text('Declared Area: 12000 square meters');
doc.moveDown();
doc.text('Please upload this file via the Requiring Body dashboard to test the document upload and AI Scrutiny features.');

doc.end();

console.log('Successfully generated ' + outputPath);
