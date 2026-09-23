const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const sampleDir = path.resolve(__dirname, '../sample_documents');
const publicDir = path.resolve(__dirname, '../public/sample_documents');

if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const scenarios = [
  {
    filename: 'Title_Deed_Pune_Nashik_Ganesh_Patil.pdf',
    projectName: 'Pune-Nashik Semi-High Speed Rail Corridor — Package IV',
    ownerName: 'Mr. Ganesh Patil',
    declaredAreaSqm: '12000',
    areaHectares: '1.20',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Mulshi / Haveli Corridor',
    surveyNo: 'Gat No. 184/2A',
    ulpin: 'MH1234567890',
    regNo: 'MH-PUN-REG-2026/8941',
  },
  {
    filename: 'Title_Deed_WDFC_Devendra_Singh_Yadav.pdf',
    projectName: 'Western Dedicated Freight Corridor (WDFC) — Phase II Feeder Spur',
    ownerName: 'Shri Devendra Singh Yadav',
    declaredAreaSqm: '47500',
    areaHectares: '4.75',
    state: 'Haryana',
    district: 'Gurugram',
    village: 'Sohna Rural Industrial Sector',
    surveyNo: 'Khasra No. 412/1 & 413',
    ulpin: 'HR9876543210',
    regNo: 'HR-GUR-REG-2026/3312',
  },
  {
    filename: 'Title_Deed_Expressway_Bhavnaben_Patel.pdf',
    projectName: 'Delhi-Mumbai Greenfield Expressway (NE-4) — Vadodara-Bharuch Section',
    ownerName: 'Smt. Bhavnaben Patel',
    declaredAreaSqm: '68000',
    areaHectares: '6.80',
    state: 'Gujarat',
    district: 'Vadodara',
    village: 'Karjan Agricultural Zone',
    surveyNo: 'Revenue Block No. 209/P',
    ulpin: 'GJ4567890123',
    regNo: 'GJ-VAD-REG-2026/5521',
  },
  {
    filename: 'Title_Deed_MMLP_Talegaon_Ganesh_Patil.pdf',
    projectName: 'PM GatiShakti Multi-Modal Logistics Park (MMLP) — Talegaon Hub',
    ownerName: 'Mr. Ganesh Patil',
    declaredAreaSqm: '84000',
    areaHectares: '8.40',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Talegaon Dabhade / Maval',
    surveyNo: 'Gat No. 512/B',
    ulpin: 'MH5678901234',
    regNo: 'MH-PUN-REG-2026/1029',
  },
  {
    filename: 'Title_Deed_Khavda_Solar_Suresh_Jadeja.pdf',
    projectName: 'Khavda Ultra Mega Renewable Energy Hybrid Park — 765kV Evacuation Substation',
    ownerName: 'Shri Suresh Kumar Jadeja',
    declaredAreaSqm: '145000',
    areaHectares: '14.50',
    state: 'Gujarat',
    district: 'Kutch',
    village: 'Khavda Northern Scrubland',
    surveyNo: 'Revenue Survey No. 844/1',
    ulpin: 'GJ7890123456',
    regNo: 'GJ-KUT-REG-2026/7714',
  },
  {
    filename: 'Title_Deed_Bengaluru_Expressway_Venkataswamy.pdf',
    projectName: 'Bengaluru-Chennai Expressway (NE-7) — Hoskote to Malur Package I',
    ownerName: 'Shri M. Venkataswamy',
    declaredAreaSqm: '36500',
    areaHectares: '3.65',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    village: 'Hoskote Rural Industrial Zone',
    surveyNo: 'Sy. No. 142/3',
    ulpin: 'KA3210987654',
    regNo: 'KA-BLR-REG-2026/4108',
  },
  {
    filename: 'Title_Deed_Mismatch_Disputed_Sample.pdf',
    projectName: 'National Infrastructure Acquisition Prototype (Mismatch Test)',
    ownerName: 'Shri Ramesh Chandra Sharma',
    declaredAreaSqm: '25000',
    areaHectares: '2.50',
    state: 'Delhi NCR',
    district: 'New Delhi',
    village: 'Alipur Northern Belt',
    surveyNo: 'Khasra No. 89/A',
    ulpin: 'DL1122334455',
    regNo: 'DL-DEL-REG-2026/9999',
    isMismatchDemo: true,
  },
];

function generatePDF(item, destinationPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const writeStream = fs.createWriteStream(destinationPath);
    doc.pipe(writeStream);

    // Header banner
    doc.rect(50, 50, 495, 24).fill('#0b5664');
    doc.fontSize(10).fillColor('#ffffff').text('GOVERNMENT OF INDIA • LAND REVENUE & ACQUISITION ADMINISTRATION', 50, 57, { align: 'center', width: 495 });

    doc.moveDown(1.8);
    doc.fillColor('#123746').fontSize(18).text('STATUTORY TITLE DEED & RECORD OF RIGHTS', { align: 'center' });
    doc.fontSize(10).fillColor('#64748b').text('Form 7/12 & Jamabandi Certified Extract under Section 11 RFCTLARR Act 2013', { align: 'center' });
    doc.moveDown(0.5);

    // Divider line
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // Metadata box
    const startY = doc.y;
    doc.rect(50, startY, 495, 62).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#0f172a').fontSize(9);
    doc.text(`Registration Document No: ${item.regNo}`, 60, startY + 10);
    doc.text(`Bhu-Aadhaar (ULPIN): ${item.ulpin}`, 60, startY + 26);
    doc.text(`Issuing Authority: Sub-Registrar / Land Revenue Office, ${item.district}`, 60, startY + 42);

    doc.text(`State: ${item.state}`, 340, startY + 10);
    doc.text(`District: ${item.district}`, 340, startY + 26);
    doc.text(`Date of Certification: ${new Date().toLocaleDateString('en-IN')}`, 340, startY + 42);

    doc.moveDown(3);

    // Section 1: Project details
    doc.fillColor('#0b5664').fontSize(12).text('1. Public Infrastructure Project Reference');
    doc.fillColor('#334155').fontSize(10);
    doc.text(`Project Name: ${item.projectName}`);
    doc.text(`Acquisition Scope: Prime Infrastructure Right-of-Way Corridor`);
    doc.moveDown(1);

    // Section 2: Owner & Title Holder
    doc.fillColor('#0b5664').fontSize(12).text('2. Certified Landowner & Title Holder Particulars');
    doc.fillColor('#334155').fontSize(10);
    doc.font('Helvetica-Bold').text(`Owner Name: ${item.ownerName}`);
    doc.font('Helvetica').text(`Title Status: Clear, Absolute, Unencumbered & Marketable Title`);
    doc.text(`Citizen Aadhaar/PAN Verification: KYC Verified via UIDAI / Income Tax Ref.`);
    doc.moveDown(1);

    // Section 3: Cadastral Land Specifications
    doc.fillColor('#0b5664').fontSize(12).text('3. Cadastral Land Survey & Spatial Specifications');
    doc.fillColor('#334155').fontSize(10);
    doc.font('Helvetica-Bold').text(`Declared Area: ${item.declaredAreaSqm} square meters (${item.areaHectares} hectares)`);
    doc.font('Helvetica').text(`Revenue Cadastral Demarcation: ${item.surveyNo}`);
    doc.text(`Revenue Village / Sector: ${item.village}`);
    doc.text(`District Jurisdiction: ${item.district}, State of ${item.state}`);
    doc.moveDown(1);

    // Section 4: Statutory Legal Guarantee
    doc.fillColor('#0b5664').fontSize(12).text('4. Statutory Guarantee & Non-Encumbrance Undertaking');
    doc.fillColor('#475569').fontSize(9);
    doc.text(
      'This document certifies that the aforementioned parcel is recorded in the official Government Record of Rights (RoR). ' +
      'The designated owner holds clean and marketable ownership free from any lien, adverse claims, lis pendens, mortgage, ' +
      'or court attachment. The land parcel is eligible for direct assessment, 100% statutory solatium, and Direct Benefit ' +
      'Transfer (DBT) compensation under the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation ' +
      'and Resettlement Act, 2013 (RFCTLARR 2013).',
      { align: 'justify', lineGap: 2 }
    );
    doc.moveDown(1.5);

    if (item.isMismatchDemo) {
      doc.rect(50, doc.y, 495, 30).fillAndStroke('#fff1f2', '#fecdd3');
      doc.fillColor('#be123c').fontSize(8.5).text(
        'NOTE FOR HACKATHON DEMO: This document contains an intentional landowner name mismatch ("Shri Ramesh Chandra Sharma") ' +
        'designed to demonstrate the Legal Scrutinizer Agent\'s automated discrepancy detection and FLAGGED status.',
        55, doc.y + 7, { width: 485 }
      );
      doc.moveDown(2);
    }

    // Signatures block
    const sigY = 700;
    doc.strokeColor('#cbd5e1').lineWidth(0.8).moveTo(60, sigY).lineTo(220, sigY).stroke();
    doc.strokeColor('#cbd5e1').lineWidth(0.8).moveTo(370, sigY).lineTo(530, sigY).stroke();

    doc.fillColor('#64748b').fontSize(8);
    doc.text('Signature of Primary Landowner', 60, sigY + 5);
    doc.text(`${item.ownerName}`, 60, sigY + 16);

    doc.text('Authorized Sub-Registrar / CALA Officer', 370, sigY + 5);
    doc.text(`District Collector Office, ${item.district}`, 370, sigY + 16);

    doc.end();

    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

async function run() {
  console.log('Generating statutory sample documents...');
  for (const s of scenarios) {
    const p1 = path.join(sampleDir, s.filename);
    const p2 = path.join(publicDir, s.filename);
    await generatePDF(s, p1);
    fs.copyFileSync(p1, p2);
    console.log(`✓ Generated ${s.filename} in sample_documents/ and public/sample_documents/`);
  }
  // Also update root Sample_Title_Deed.pdf to match Scenario 1
  fs.copyFileSync(path.join(sampleDir, scenarios[0].filename), path.resolve(__dirname, '../Sample_Title_Deed.pdf'));
  console.log('✓ Updated root Sample_Title_Deed.pdf');
  console.log('All statutory documents successfully generated!');
}

run().catch(console.error);
