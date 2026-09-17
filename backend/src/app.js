const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const proposalRoutes = require('./routes/proposal.routes');
const documentRoutes = require('./routes/document.routes');
const parcelRoutes = require('./routes/parcel.routes');
const compensationRoutes = require('./routes/compensation.routes');
const objectionRoutes = require('./routes/objection.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'nlams-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/compensation', compensationRoutes);
app.use('/api/objections', objectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// 404 for anything unmatched
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Must be registered last: catches errors from asyncHandler-wrapped routes
app.use(errorHandler);

module.exports = app;
