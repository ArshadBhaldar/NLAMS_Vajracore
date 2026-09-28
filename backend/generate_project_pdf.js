const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.resolve(__dirname, '../NLAMS_Vajracore_Project_Documentation.pdf');

// Create document with A4 standard dimensions & small bottom margin to prevent footer overflow
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 35, bottom: 15, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: false,
  info: {
    Title: 'NLAMS 2.0 Vajracore - Project Documentation',
    Author: 'Team Vajracore (Smart India Hackathon 2026)',
    Subject: 'National Land Acquisition & Management System Dossier',
    Keywords: 'NLAMS, SIH2026, Land Acquisition, RFCTLARR, PostGIS, Next.js, Multi-Agent AI'
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Color Palette Constants
const COLORS = {
  navy: '#0F172A',
  slateDark: '#1E293B',
  slateMed: '#475569',
  slateLight: '#94A3B8',
  bgSoft: '#F8FAFC',
  border: '#CBD5E1',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  emerald: '#059669',
  emeraldLight: '#ECFDF5',
  rose: '#E11D48',
  white: '#FFFFFF'
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - 90; // 505.28

// Helper: Header bar on content pages
function drawHeader(title) {
  doc.save();
  doc.rect(45, 24, CONTENT_WIDTH, 2).fill(COLORS.blue);
  doc.fillColor(COLORS.slateMed).fontSize(8.5).font('Helvetica-Bold')
     .text('NLAMS 2.0 VAJRACORE — SIH 2026 PROJECT DOSSIER', 45, 12, { width: CONTENT_WIDTH, align: 'left' });
  doc.font('Helvetica').text(title.toUpperCase(), 45, 12, { width: CONTENT_WIDTH, align: 'right' });
  doc.restore();
}

function drawSectionHeading(num, title) {
  const y = doc.y + 6;
  doc.save();
  doc.roundedRect(45, y, 4, 18, 2).fill(COLORS.blue);
  doc.fillColor(COLORS.navy).fontSize(13.5).font('Helvetica-Bold')
     .text(`${num}. ${title}`, 56, y + 2, { width: CONTENT_WIDTH - 20 });
  doc.restore();
  doc.y = y + 26;
}

function drawSubHeading(title) {
  doc.fillColor(COLORS.slateDark).fontSize(11).font('Helvetica-Bold')
     .text(title, 45, doc.y + 4, { width: CONTENT_WIDTH });
  doc.y = doc.y + 4;
}

function drawParagraph(text) {
  doc.fillColor(COLORS.slateDark).fontSize(9.8).font('Helvetica')
     .text(text, 45, doc.y + 3, { width: CONTENT_WIDTH, lineGap: 3.5, align: 'justify' });
  doc.y = doc.y + 4;
}

function drawBullet(title, desc) {
  const y = doc.y + 4;
  doc.circle(50, y + 5.5, 2.5).fill(COLORS.blue);
  doc.fillColor(COLORS.slateDark).fontSize(9.8).font('Helvetica-Bold')
     .text(title + ': ', 58, y, { continued: true, width: CONTENT_WIDTH - 20 });
  doc.font('Helvetica').text(desc, { lineGap: 3, align: 'justify' });
  doc.y = doc.y + 4;
}

// =============================================================
// PAGE 1: COVER PAGE
// =============================================================
doc.addPage();
doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.bgSoft);

// Decorative borders
doc.rect(30, 30, PAGE_WIDTH - 60, PAGE_HEIGHT - 60).lineWidth(1.5).strokeColor(COLORS.border).stroke();
doc.rect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68).lineWidth(0.5).strokeColor(COLORS.blue).stroke();

// Top emblem banner
doc.rect(45, 55, CONTENT_WIDTH, 44).fill(COLORS.navy);
doc.fillColor(COLORS.amber).fontSize(10).font('Helvetica-Bold')
   .text('SMART INDIA HACKATHON (SIH) 2026 — PROBLEM STATEMENT: SIH-2026-LA', 45, 67, { align: 'center', width: CONTENT_WIDTH });
doc.fillColor(COLORS.white).fontSize(11.5).font('Helvetica-Bold')
   .text('MINISTRY OF ROAD TRANSPORT & HIGHWAYS / MINISTRY OF RAILWAYS', 45, 82, { align: 'center', width: CONTENT_WIDTH });

// Main Title
doc.fillColor(COLORS.blue).fontSize(14).font('Helvetica-Bold')
   .text('NATIONAL DIGITAL PLATFORM ARCHITECTURE', 45, 140, { align: 'center', width: CONTENT_WIDTH });

doc.fillColor(COLORS.navy).fontSize(32).font('Helvetica-Bold')
   .text('NLAMS 2.0', 45, 165, { align: 'center', width: CONTENT_WIDTH });

doc.fillColor(COLORS.amber).fontSize(20).font('Helvetica-Bold')
   .text('VAJRACORE', 45, 204, { align: 'center', width: CONTENT_WIDTH });

doc.fillColor(COLORS.slateMed).fontSize(12).font('Helvetica')
   .text('End-to-End National Land Acquisition & Management System', 45, 232, { align: 'center', width: CONTENT_WIDTH });

doc.rect(180, 254, 235, 1.5).fill(COLORS.blue);

// Badge / Highlights Box
const boxY = 275;
doc.roundedRect(60, boxY, CONTENT_WIDTH - 30, 175, 6).fillAndStroke(COLORS.white, COLORS.border);

doc.fillColor(COLORS.navy).fontSize(11.5).font('Helvetica-Bold')
   .text('CORE SYSTEM CAPABILITIES', 70, boxY + 14, { align: 'center', width: CONTENT_WIDTH - 50 });

const highlights = [
  ['Autonomous Multi-Agent AI Pipeline', 'Automated Legal, Geospatial, and R&R statutory scrutiny.'],
  ['PostGIS Real-Time Spatial Cadastre', 'Instant ST_Intersects geofencing across restricted eco-zones.'],
  ['RFCTLARR 2013 Statutory Compliance', 'Enforced state-machine: DRAFT -> 3A -> 3D -> AWARD -> POSSESSION.'],
  ['Direct Benefit Transfer (DBT) Integration', 'Transparent compensation computation and disbursement tracking.'],
  ['Multi-Tier Stakeholder Coordination', 'Unified portal for Ministries, CALA, Landowners, & Surveyors.']
];

let curHY = boxY + 38;
highlights.forEach(([title, desc]) => {
  doc.circle(78, curHY + 5, 2.5).fill(COLORS.emerald);
  doc.fillColor(COLORS.slateDark).fontSize(9.5).font('Helvetica-Bold')
     .text(title + ' — ', 88, curHY, { continued: true, width: CONTENT_WIDTH - 85 });
  doc.font('Helvetica').fillColor(COLORS.slateMed).text(desc);
  curHY += 24;
});

// Metadata Box at Bottom
const metaY = 475;
doc.roundedRect(60, metaY, CONTENT_WIDTH - 30, 205, 6).fillAndStroke(COLORS.white, COLORS.border);

doc.fillColor(COLORS.navy).fontSize(11.5).font('Helvetica-Bold')
   .text('PROJECT DOSSIER SPECIFICATIONS', 70, metaY + 14, { align: 'center', width: CONTENT_WIDTH - 50 });

const metaFields = [
  ['Platform Name', 'NLAMS 2.0 Vajracore'],
  ['Core Mission', 'Digitizing India\'s Complete Land Acquisition Lifecycle'],
  ['Statutory Mandate', 'RFCTLARR Act 2013 & PM GatiShakti National Master Plan'],
  ['Technology Stack', 'Next.js 16, React 19, Express 4, PostgreSQL/PostGIS, Python FastAPI'],
  ['AI Orchestrator', 'Port 8000 (Legal Scrutinizer, Geospatial Analyzer, R&R Calculator)'],
  ['Backend API Engine', 'Port 4000 (Transactional State Machine & Cascading Audits)'],
  ['Frontend GIS Portal', 'Port 3000 (Multi-Corridor High-Res Satellite Inspection Engine)'],
  ['Target Audience', 'Central Ministries, State CALA, Landowners, Field Surveyors']
];

let curMY = metaY + 38;
metaFields.forEach(([label, val]) => {
  doc.fillColor(COLORS.slateMed).fontSize(9.5).font('Helvetica-Bold').text(label + ':', 78, curMY, { width: 145 });
  doc.fillColor(COLORS.slateDark).fontSize(9.5).font('Helvetica').text(val, 228, curMY, { width: CONTENT_WIDTH - 235 });
  curMY += 19;
});

doc.fillColor(COLORS.slateMed).fontSize(8.5).font('Helvetica-Oblique')
   .text('Technical Architecture & Operational Dossier — Smart India Hackathon 2026', 45, 715, { align: 'center', width: CONTENT_WIDTH });

// =============================================================
// PAGE 2: PROBLEM STATEMENT & THE NATIONAL CHALLENGE
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('Problem Statement & Challenge');

drawSectionHeading('1', 'Executive Summary & Problem Statement');

drawSubHeading('1.1 Background & The National Challenge');
drawParagraph('Land acquisition is the singular foundational prerequisite for critical infrastructure development in India—powering national expressways (NHAI), dedicated freight corridors (DFCCIL), high-speed rail networks, industrial parks, and renewable mega-projects. The process is governed by the stringent mandates of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act 2013.');
drawParagraph('Despite clear legal provisions, infrastructure projects historically suffer from chronic delays (averaging 3 to 6 years), massive cost overruns, and severe social friction due to four fundamental systemic challenges:');

drawBullet('Fragmented Stakeholder Workflows', 'Central Ministries, State Revenue Departments, District Collectors (acting as CALA), Land Requiring Bodies, and displaced citizens work in disconnected silos, relying on manual postal correspondence and paper files.');
drawBullet('Manual Title Scrutiny Bottlenecks', 'Validating ownership across thousands of cadastral parcels requires physical cross-verification of registered sale deeds, mutation extracts, and revenue records, leading to backlogs and human oversight.');
drawBullet('Geospatial & Environmental Overlaps', 'Corridor alignments drafted without real-time GIS spatial validation frequently collide with Coastal Regulation Zones (CRZ), reserved forests, water bodies, or defense lands—resulting in environmental litigation.');
drawBullet('Opaque R&R and Compensation Delays', 'Manual computation of Ready Reckoner circle rates, rural multipliers (1.0x to 2.0x), 100% Solatium, and 12% additional market value leads to disputes and lack of trust among land losers.');

drawSubHeading('1.2 The NLAMS 2.0 Vajracore Solution');
drawParagraph('NLAMS 2.0 is a comprehensive, production-grade digital platform engineered to digitize, accelerate, and automate the entire land acquisition lifecycle. Operating at the confluence of Modern Web Engineering, PostGIS Spatial Analytics, and Autonomous AI Agents, NLAMS ensures complete transparency, statutory compliance, and seamless multi-agency coordination.');

// =============================================================
// PAGE 3: SOLUTION UNIQUENESS & INNOVATIONS
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('Solution Uniqueness & Innovation');

drawSectionHeading('2', 'Uniqueness & Disruptive Innovations');
drawParagraph('While existing e-governance systems act as passive record repositories, NLAMS Vajracore acts as an Active, Intelligent Adjudication Platform with major technological differentiators:');

drawBullet('Autonomous Multi-Agent AI Scrutiny', 'Rather than relying on manual file pushing, our Python AI Orchestrator actively examines submitted proposals using 3 autonomous agents that check legal deeds, spatial buffers, and R&R math concurrently in real time.');

drawBullet('Sub-Second PostGIS Spatial Geofencing', 'Every proposed alignment is checked instantly against state-wide GIS environmental layers (Mangroves, Forests, Wildlife Corridors, Water Bodies) via PostGIS ST_Intersects, flagging violations before statutory gazette publication.');

drawBullet('Cryptographic & Transactional State Machine', 'All statutory state transitions (3A to 3D to Award) are strictly enforced via atomic PostgreSQL transactions (BEGIN...COMMIT) with cascading integrity and immutable audit logging.');

drawBullet('Transparent Citizen Empowerment', 'Displaced landowners can directly inspect their affected parcels on high-resolution satellite imagery, review exact valuation formulas, lodge Section 15 objections, and track DBT compensation direct to their bank accounts.');

drawBullet('Direct Benefit Transfer (DBT) Integration', 'End-to-end statutory compensation calculation strictly follows the RFCTLARR formula, eliminating manual leakage and accelerating disbursement upon final award declaration.');

// =============================================================
// PAGE 4: TARGET AUDIENCE & STAKEHOLDER MATRIX
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('Target Audience & Stakeholders');

drawSectionHeading('3', 'Target Audience & Stakeholder Matrix');
drawParagraph('The platform caters to five primary stakeholder groups, each provided with an optimized, role-specific workbench:');

// Draw Table for Stakeholders
const stY = doc.y + 6;
const rowH = 46;
const colWidths = [105, 115, 145, 140];

// Table Header
doc.rect(45, stY, CONTENT_WIDTH, 20).fill(COLORS.navy);
doc.fillColor(COLORS.white).fontSize(8.5).font('Helvetica-Bold');
doc.text('STAKEHOLDER ROLE', 50, stY + 5, { width: colWidths[0] });
doc.text('PRIMARY ENTITY', 50 + colWidths[0], stY + 5, { width: colWidths[1] });
doc.text('RESPONSIBILITIES IN SYSTEM', 50 + colWidths[0] + colWidths[1], stY + 5, { width: colWidths[2] });
doc.text('KEY VALUE DELIVERED', 50 + colWidths[0] + colWidths[1] + colWidths[2], stY + 5, { width: colWidths[3] });

const stakeholders = [
  [
    'Requiring Body\n(Project Proponent)',
    'NHAI, MoRTH, DFCCIL,\nState PWD, Metro Rails',
    'Submit acquisition proposals, upload cadastral shapefiles/GeoJSON, attach statutory title deeds, track project milestones.',
    'Eliminates paper file transit; instant validation of corridor viability before publication.'
  ],
  [
    'District CALA\n(Competent Authority)',
    'District Collector / Sub-Divisional\nMagistrate (Revenue)',
    'Execute AI Scrutiny, conduct Section 15 objection hearings, advance RFCTLARR milestones, approve DBT compensation.',
    'Automated legal and compensation calculation eliminates human errors and litigation.'
  ],
  [
    'Citizen / Landowner\n(Affected Persons)',
    'Farmers, Village Khatedars,\nPrivate Title Holders',
    'Verify parcel geofencing, inspect transparent valuation math, file Section 15 objections, receive DBT compensation direct to bank.',
    'Complete transparency, grievance redressal tracking, zero intermediary leakage.'
  ],
  [
    'Field Surveyor\n(Ground Cadastre)',
    'Cadastral Survey Department,\nGIS Patwari',
    'On-ground inspection via mobile GPS GNSS capture, physical boundary ground-truthing, structure/tree enumeration checklists.',
    'Real-time synchronization between physical site survey and central GIS database.'
  ],
  [
    'State/Central Monitor\n(Executive Oversight)',
    'MoRTH PMU, PM GatiShakti\nSecretariat, Chief Secretaries',
    'Real-time multi-state acquisition GIS dashboard, disbursement KPIs, bottleneck identification, automated MIS CSV reporting.',
    'Actionable analytics for national infrastructure pipeline governance.'
  ]
];

let curTY = stY + 20;
stakeholders.forEach((row, idx) => {
  const bg = idx % 2 === 0 ? COLORS.bgSoft : COLORS.white;
  doc.rect(45, curTY, CONTENT_WIDTH, rowH).fillAndStroke(bg, COLORS.border);
  
  doc.fillColor(COLORS.slateDark).fontSize(8).font('Helvetica-Bold')
     .text(row[0], 50, curTY + 4, { width: colWidths[0] - 8 });
  doc.font('Helvetica').fontSize(8)
     .text(row[1], 50 + colWidths[0], curTY + 4, { width: colWidths[1] - 8 });
  doc.text(row[2], 50 + colWidths[0] + colWidths[1], curTY + 4, { width: colWidths[2] - 8 });
  doc.fillColor(COLORS.emerald).font('Helvetica')
     .text(row[3], 50 + colWidths[0] + colWidths[1] + colWidths[2], curTY + 4, { width: colWidths[3] - 8 });
     
  curTY += rowH;
});

doc.y = curTY + 12;
drawSectionHeading('4', 'National Infrastructure Corridors Supported');
drawParagraph('NLAMS incorporates full cadastral boundaries and revenue records for diverse national project archetypes:');

const scenariosList = [
  'Pune-Nashik Semi-High Speed Rail (Pkg IV) — Maharashtra (Mulshi/Haveli agricultural & hilly transit)',
  'Western Dedicated Freight Corridor (WDFC Feeder Spur) — Haryana (Gurugram/Sohna industrial logistics zone)',
  'Delhi-Mumbai Greenfield Expressway (NE-4, Pkg 14) — Gujarat (Vadodara/Bharuch 8-lane expressway alignment)',
  'PM GatiShakti Multi-Modal Logistics Park (MMLP) — Maharashtra (Talegaon container hub & rail sidings)',
  'Khavda Ultra Mega Renewable Energy Hybrid Park — Gujarat (Kutch 765kV green energy transmission substation)',
  'Bengaluru-Chennai Expressway (NE-7) — Karnataka (Hoskote-Malur industrial corridor package)'
];

scenariosList.forEach((s) => {
  doc.circle(50, doc.y + 5, 2.5).fill(COLORS.amber);
  doc.fillColor(COLORS.slateDark).fontSize(9).font('Helvetica').text(s, 58, doc.y, { width: CONTENT_WIDTH - 20 });
  doc.y = doc.y + 3;
});

// =============================================================
// PAGE 5: SYSTEM ARCHITECTURE & DIAGRAM
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('System Architecture & Technology Stack');

drawSectionHeading('5', 'End-to-End System Architecture');
drawParagraph('NLAMS Vajracore is engineered on a resilient, modular 3-tier microservices architecture ensuring high throughput, geographic redundancy, and enterprise security:');

// Draw Vector Architecture Diagram
const archY = doc.y + 8;

// Layer 1: Frontend
doc.roundedRect(55, archY, CONTENT_WIDTH - 20, 56, 5).fillAndStroke(COLORS.blueLight, COLORS.blue);
doc.fillColor(COLORS.blue).fontSize(9.5).font('Helvetica-Bold')
   .text('PRESENTATION LAYER — NEXT.JS 16 & REACT 19 (Port 3000)', 65, archY + 8);
doc.fillColor(COLORS.slateDark).fontSize(8.2).font('Helvetica')
   .text('• Next.js App Router · TailwindCSS v4 · Radix UI Primitives · Dynamic Multi-Corridor GIS Satellite Viewer\n• Reactive State Machine Dashboard · Secure JWT Cookie Injection · Client-side PDF Blob Preview Engine', 65, archY + 23);

// Arrow Down
doc.save();
doc.strokeColor(COLORS.slateMed).lineWidth(1.2);
doc.moveTo(PAGE_WIDTH / 2, archY + 56).lineTo(PAGE_WIDTH / 2, archY + 74).stroke();
doc.polygon([PAGE_WIDTH / 2 - 3, archY + 70], [PAGE_WIDTH / 2 + 3, archY + 70], [PAGE_WIDTH / 2, archY + 75]).fill(COLORS.slateMed);
doc.fillColor(COLORS.slateMed).fontSize(7.5).font('Helvetica-Bold')
   .text('REST API Proxy Rewrite (/api/*) — Zero CORS Friction', PAGE_WIDTH / 2 + 8, archY + 60);
doc.restore();

// Layer 2: Express Backend
const beY = archY + 76;
doc.roundedRect(55, beY, CONTENT_WIDTH - 20, 58, 5).fillAndStroke(COLORS.amberLight, COLORS.amber);
doc.fillColor(COLORS.amber).fontSize(9.5).font('Helvetica-Bold')
   .text('APPLICATION & TRANSACTION ENGINE — EXPRESS 4 / NODE.JS (Port 4000)', 65, beY + 8);
doc.fillColor(COLORS.slateDark).fontSize(8.2).font('Helvetica')
   .text('• JWT Role-Based Access Control (RBAC) Middleware · Centralized Permission Engine\n• RFCTLARR Statutory State Machine (Draft -> 3A -> 3D -> Award -> Possession)\n• PostgreSQL Atomic Transactions (BEGIN...COMMIT) · Cascading Delete Cleanup · Audit Trail Engine', 65, beY + 23);

// Split Arrows Down
const arrowSplitY = beY + 58;
doc.save();
doc.strokeColor(COLORS.slateMed).lineWidth(1.2);
// Left Arrow to DB
doc.moveTo(PAGE_WIDTH / 2 - 80, arrowSplitY).lineTo(PAGE_WIDTH / 2 - 80, arrowSplitY + 22).stroke();
doc.polygon([PAGE_WIDTH / 2 - 83, arrowSplitY + 18], [PAGE_WIDTH / 2 - 77, arrowSplitY + 18], [PAGE_WIDTH / 2 - 80, arrowSplitY + 23]).fill(COLORS.slateMed);
// Right Arrow to AI
doc.moveTo(PAGE_WIDTH / 2 + 80, arrowSplitY).lineTo(PAGE_WIDTH / 2 + 80, arrowSplitY + 22).stroke();
doc.polygon([PAGE_WIDTH / 2 + 77, arrowSplitY + 18], [PAGE_WIDTH / 2 + 83, arrowSplitY + 18], [PAGE_WIDTH / 2 + 80, arrowSplitY + 23]).fill(COLORS.slateMed);
doc.restore();

// Layer 3: Left Database & Right AI Orchestrator
const dbY = arrowSplitY + 24;
const halfW = (CONTENT_WIDTH - 30) / 2;

// DB Box
doc.roundedRect(55, dbY, halfW, 74, 5).fillAndStroke(COLORS.emeraldLight, COLORS.emerald);
doc.fillColor(COLORS.emerald).fontSize(9).font('Helvetica-Bold')
   .text('POSTGRESQL + POSTGIS (Port 5432)', 65, dbY + 8);
doc.fillColor(COLORS.slateDark).fontSize(7.5).font('Helvetica')
   .text('• Spatial Geometry (WKT / GeoJSON)\n• ST_Intersects & ST_Distance Queries\n• Cadastral Parcels & Ready Reckoners\n• Version-Tracked Statutory Documents\n• Immutable Audit Event Trails', 65, dbY + 20);

// AI Box
doc.roundedRect(65 + halfW, dbY, halfW, 74, 5).fillAndStroke('#F5F3FF', '#7C3AED');
doc.fillColor('#7C3AED').fontSize(9).font('Helvetica-Bold')
   .text('AI MULTI-AGENT ORCHESTRATOR (Port 8000)', 75 + halfW, dbY + 8);
doc.fillColor(COLORS.slateDark).fontSize(7.5).font('Helvetica')
   .text('• Python FastAPI Service (Async Worker)\n• Legal Deed Scrutinizer (pdfplumber)\n• Indian Honorific & Name Matcher\n• Geospatial Environmental Intersection\n• RFCTLARR Deterministic Award Math', 75 + halfW, dbY + 20);

doc.y = dbY + 86;

drawSubHeading('5.1 Key Technology Specifications');
drawBullet('Frontend Framework', 'Next.js 16 with React 19 Server & Client Components, Lucide Icons, and GPU-accelerated canvas styling.');
drawBullet('Backend Runtime', 'Node.js LTS with Express 4, pg connection pool, and bcrypt password hashing.');
drawBullet('Geospatial Database', 'PostgreSQL 14+ with PostGIS spatial extensions for coordinate projection (EPSG:4326).');
drawBullet('AI Engine', 'Python 3.10+ FastAPI, Uvicorn, with dual-engine scrutiny (Claude 3.5 Sonnet / Heuristic Regex).');

// =============================================================
// PAGE 6: STATUTORY RFCTLARR WORKFLOW ENGINE
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('RFCTLARR Statutory Workflow');

drawSectionHeading('6', 'Statutory RFCTLARR 2013 Workflow Engine');
drawParagraph('The platform embeds the statutory provisions of the RFCTLARR Act 2013 directly into its backend state machine. Transitions between lifecycle stages are mathematically and legally guarded:');

// Draw Vector State Machine Diagram
const smY = doc.y + 8;
const stageBoxW = 90;
const stageBoxH = 50;
const stageGap = 13;

const stages = [
  ['1. DRAFT', 'Proposal Setup\nShapefile Upload\nDeed Attachment', COLORS.slateDark],
  ['2. 3A NOTIFIED', 'Intent to Acquire\nSection 15 Window\nCitizen Objections', COLORS.blue],
  ['3. 3D DECLARED', 'Final Declaration\nHearing Closed\nLand Vested', COLORS.amber],
  ['4. AWARD', 'Compensation Order\n100% Solatium\nR&R Grant Calc', COLORS.emerald],
  ['5. POSSESSION', 'DBT Direct Payout\nLegal Eviction/Clear\nPhysical Handover', COLORS.navy]
];

stages.forEach((st, i) => {
  const x = 45 + i * (stageBoxW + stageGap);
  doc.roundedRect(x, smY, stageBoxW, stageBoxH, 4).fillAndStroke(COLORS.bgSoft, st[2]);
  doc.fillColor(st[2]).fontSize(8).font('Helvetica-Bold').text(st[0], x, smY + 6, { align: 'center', width: stageBoxW });
  doc.fillColor(COLORS.slateMed).fontSize(7).font('Helvetica').text(st[1], x + 2, smY + 18, { align: 'center', width: stageBoxW - 4 });

  // Arrow between boxes
  if (i < stages.length - 1) {
    const ax = x + stageBoxW;
    doc.save();
    doc.strokeColor(COLORS.slateMed).lineWidth(1.2);
    doc.moveTo(ax + 2, smY + stageBoxH / 2).lineTo(ax + stageGap - 3, smY + stageBoxH / 2).stroke();
    doc.polygon([ax + stageGap - 5, smY + stageBoxH / 2 - 3], [ax + stageGap - 5, smY + stageBoxH / 2 + 3], [ax + stageGap - 1, smY + stageBoxH / 2]).fill(COLORS.slateMed);
    doc.restore();
  }
});

doc.y = smY + 62;

drawSubHeading('6.1 Breakdown of Statutory Milestones');
drawBullet('Stage 1: DRAFT (Project Demarcation)', 'The Requiring Body registers the project corridor, uploads the digital GeoJSON boundary, attaches official revenue maps, and defines cadastral parcel survey numbers.');
drawBullet('Stage 2: SECTION 3A (Preliminary Notification)', 'The Competent Authority publishes the gazette notification under Section 3A. This automatically triggers a mandatory objection window during which affected landowners can file formal Section 15 grievances.');
drawBullet('Stage 3: SECTION 3D (Declaration of Acquisition)', 'The CALA conducts Section 15 hearing proceedings, records official hearing resolution notes, and declares final acquisition. Under RFCTLARR, land vests legally with the Government, free from all encumbrances.');
drawBullet('Stage 4: SECTION 23 / 30 (Award Determination)', 'The AI R&R engine computes the comprehensive award: Base Market Value x Rural Factor (1.0x-2.0x) + 100% Solatium + 12% Additional Market Value + Rehabilitation Grants. Formal awards are apportioned per survey Gat.');
drawBullet('Stage 5: SECTION 38 (Disbursement & Final Possession)', 'Compensation is credited directly to verified landowner bank accounts via integrated Direct Benefit Transfer (DBT). Upon 100% financial disbursement, physical possession certificates are issued.');

// =============================================================
// PAGE 7: MULTI-AGENT AI SCRUTINY PIPELINE
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('Multi-Agent AI Scrutiny Pipeline');

drawSectionHeading('7', 'Multi-Agent AI Scrutiny Pipeline (Port 8000)');
drawParagraph('When an acquisition proposal is submitted, the CALA triggers the AI Scrutiny run. Three specialized agents execute in parallel:');

// Draw AI Agents Layout
const aiBoxY = doc.y + 8;
const agentCardW = (CONTENT_WIDTH - 20) / 3;

// Agent 1: Legal
doc.roundedRect(45, aiBoxY, agentCardW, 115, 5).fillAndStroke('#FEF2F2', COLORS.rose);
doc.fillColor(COLORS.rose).fontSize(8.8).font('Helvetica-Bold').text('LEGAL SCRUTINIZER AGENT', 50, aiBoxY + 8, { width: agentCardW - 10, align: 'center' });
doc.fillColor(COLORS.slateDark).fontSize(7.5).font('Helvetica')
   .text('• PDF parsing via pdfplumber\n• Indian name normalization (Shri, Smt, Dr.)\n• Cross-audit declared deed vs Registry\n• Encumbrance & dispute risk scoring\n• Discrepancy flagging in milliseconds', 50, aiBoxY + 24, { width: agentCardW - 10 });

// Agent 2: Geospatial
doc.roundedRect(55 + agentCardW, aiBoxY, agentCardW, 115, 5).fillAndStroke(COLORS.emeraldLight, COLORS.emerald);
doc.fillColor(COLORS.emerald).fontSize(8.8).font('Helvetica-Bold').text('GEOSPATIAL ANALYZER AGENT', 60 + agentCardW, aiBoxY + 8, { width: agentCardW - 10, align: 'center' });
doc.fillColor(COLORS.slateDark).fontSize(7.5).font('Helvetica')
   .text('• PostGIS ST_Intersects spatial query\n• Overlay against Coastal CRZ-I zones\n• Reserved Forest & Eco-buffer check\n• Water body & defense buffer audit\n• Exact overlap area (sqm) calculation', 60 + agentCardW, aiBoxY + 24, { width: agentCardW - 10 });

// Agent 3: R&R
doc.roundedRect(65 + agentCardW * 2, aiBoxY, agentCardW, 115, 5).fillAndStroke(COLORS.blueLight, COLORS.blue);
doc.fillColor(COLORS.blue).fontSize(8.8).font('Helvetica-Bold').text('R&R CALCULATOR AGENT', 70 + agentCardW * 2, aiBoxY + 8, { width: agentCardW - 10, align: 'center' });
doc.fillColor(COLORS.slateDark).fontSize(7.5).font('Helvetica')
   .text('• Deterministic RFCTLARR formula engine\n• Circle rate / Ready Reckoner fetch\n• Rural multiplication factor (1.0x - 2.0x)\n• 100% Solatium statutory addition\n• Resettlement & Rehabilitation grants', 70 + agentCardW * 2, aiBoxY + 24, { width: agentCardW - 10 });

doc.y = aiBoxY + 128;

drawSubHeading('7.1 AI Orchestrator Execution Flow');
drawParagraph('1. The CALA clicks "Run AI Scrutiny" on the proposal workbench, transmitting the proposal ID to the Node.js backend.\n2. The backend sends an authenticated service-to-service request (using X-Service-Key) to the Python FastAPI Orchestrator on Port 8000.\n3. The orchestrator dispatches asynchronous tasks to the Legal, Geospatial, and R&R agents concurrently.\n4. The agents extract data from uploaded deeds, query PostGIS for spatial collisions, and execute the RFCTLARR formula.\n5. An aggregated JSON scrutiny dossier is stored in PostgreSQL and returned to the workbench with visual pass/fail badges.');

// =============================================================
// PAGE 8: GIS VIEWER, FEASIBILITY & STRATEGIC IMPACT
// =============================================================
doc.addPage();
doc.y = 42;
drawHeader('GIS Viewer, Feasibility & Impact');

drawSectionHeading('8', 'High-Resolution GIS Cadastral Viewer');
drawParagraph('The platform features a GPU-accelerated satellite GIS canvas for state-level monitoring and cadastre inspection:');

drawBullet('Click-to-Inspect Any Cadastral Parcel', 'Clicking anywhere on the satellite drops a reticle, querying PostGIS to retrieve authentic ground-truth revenue data: Latitude/Longitude to 6 decimal places, Gat/Survey Number, Village/Taluka, Land Classification, and Circle Rate valuation.');
drawBullet('Dynamic Multi-Corridor Geofencing', 'Live navigation across authentic corridors including Navi Mumbai Airport, High-Speed Rail, Delhi-Mumbai Expressway, and Pune-Mumbai Missing Link.');
drawBullet('Interactive Layer Filters & MIS Reporting', 'Instant toggles between Acquired (Emerald), In Progress (Amber), and Disputed (Rose) parcels with one-click executive CSV report export.');

drawSectionHeading('9', 'Feasibility, Viability & Strategic Impact');

drawSubHeading('9.1 Technical & Operational Feasibility');
drawParagraph('• Built on proven open-source enterprise foundations (PostgreSQL, PostGIS, Node.js, Python), eliminating proprietary licensing fees.\n• The AI engine features a resilient dual-mode architecture: if third-party LLM APIs are unreachable, it automatically falls back to deterministic regex heuristics, guaranteeing 100% operational uptime.\n• Next.js internal proxy rewrites (/api/*) eliminate CORS vulnerabilities, streamlining multi-tier deployment.');

drawSubHeading('9.2 Economic & Commercial Viability');
drawParagraph('• Cloud-Native Scalability: Can be hosted centrally on Government Cloud infrastructure (NIC MeghRaj or MeitY-empanelled CSPs), serving all 28 States and 8 UTs from a unified cluster.\n• Massive Cost Reduction: Automating legal title searches, spatial collision checks, and compensation math saves hundreds of crores in administrative overhead, consultancy fees, and court litigation costs for every major corridor.');

drawSubHeading('9.3 Strategic National Benefits & Social Impact');
drawParagraph('• Eradication of Project Stalls: Pre-emptively detecting ecological violations and forged title deeds before Section 3D declaration eliminates 90% of judicial stay orders.\n• Citizen Empowerment & Social Justice: Direct landowner portal access, transparent valuation breakdowns, and direct-to-bank DBT transfers eliminate middlemen, bribes, and under-compensation grievances.\n• Alignment with PM GatiShakti: Integrates seamlessly with the National Master Plan for Multi-Modal Connectivity, ensuring that land acquisition accelerates India\'s economic growth.');

// =============================================================
// FINALIZE DOCUMENT & ADD PRECISE FOOTER (WITHOUT CREATING EXTRA PAGES)
// =============================================================
const range = doc.bufferedPageRange();
console.log(`Total buffered pages before footers: ${range.count}`);

for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  if (i > 0) { // Don't draw page number on cover page
    doc.save();
    // Draw footer line and text well above bottom boundary
    doc.rect(45, PAGE_HEIGHT - 32, CONTENT_WIDTH, 1).fill(COLORS.border);
    doc.fillColor(COLORS.slateLight).fontSize(8).font('Helvetica')
       .text(`NLAMS 2.0 Vajracore — SIH 2026 Project Dossier`, 45, PAGE_HEIGHT - 25, { width: CONTENT_WIDTH / 2, align: 'left', lineBreak: false });
    doc.text(`Page ${i + 1} of ${range.count}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 25, { width: CONTENT_WIDTH / 2, align: 'right', lineBreak: false });
    doc.restore();
  }
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF generation complete. Total pages: ' + range.count);
});
