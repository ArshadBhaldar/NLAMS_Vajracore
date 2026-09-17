const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const db = require('../src/config/db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function generateAndUploadDeed() {
  const proposalId = 'a1111111-1111-1111-1111-111111111111';
  const parcelId = 'b1111111-1111-1111-1111-111111111111';
  // This matches the Requiring Body demo user ID:
  const uploadedBy = '22222222-2222-2222-2222-222222222222'; 
  
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `title_deed_${Date.now()}.pdf`;
  const storagePath = path.join(uploadDir, filename);

  // Generate PDF
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(storagePath));

  doc.fontSize(20).text('OFFICIAL TITLE DEED', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Date: 2024-01-15', { align: 'right' });
  doc.moveDown();
  doc.text('This is to certify that the parcel of land bearing ULPIN MH1234567890 is officially registered.');
  doc.moveDown();
  // Include the exact name 'Ganesh Patil' and area '12000' so the AI agent fuzzy matches it correctly
  doc.text('Registered Owner: Mr. Ganesh Patil');
  doc.moveDown();
  doc.text('Total Declared Area: 12000 square meters.');
  doc.moveDown();
  doc.text('This document serves as proof of ownership and is subject to the National Land Acquisition & Management System regulations.');

  doc.end();

  // Wait a moment for file stream to finish writing
  await new Promise(resolve => setTimeout(resolve, 500));

  // Insert into DB
  try {
    const existing = await db.query(
      `SELECT COALESCE(MAX(version), 0) AS max_version FROM documents
       WHERE proposal_id = $1 AND doc_type = $2`,
      [proposalId, 'TITLE_DEED']
    );
    const nextVersion = Number(existing.rows[0].max_version) + 1;

    const result = await db.query(
      `INSERT INTO documents (proposal_id, parcel_id, doc_type, filename, storage_path, version, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [proposalId, parcelId, 'TITLE_DEED', filename, storagePath, nextVersion, uploadedBy]
    );

    console.log('Successfully generated and uploaded Title Deed PDF!');
    console.log(result.rows[0]);
  } catch (err) {
    console.error('Error inserting document record:', err);
  } finally {
    process.exit(0);
  }
}

generateAndUploadDeed();
