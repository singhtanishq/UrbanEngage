require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const homeRouter = require('./routes/home');
const dashboardRouter = require('./routes/dashboard');
const forumsRouter = require('./routes/forums');
const eventsRouter = require('./routes/events');
const issuesRouter = require('./routes/issues');
const petitionsRouter = require('./routes/petitions');
const pollsRouter = require('./routes/polls');
const volunteersRouter = require('./routes/volunteers');
const accountsRouter = require('./routes/accounts');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/UrbanEngageDB';

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '100kb' }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

app.use('/home', homeRouter);
app.use('/dashboard', dashboardRouter);
app.use('/forums', forumsRouter);
app.use('/events', eventsRouter);
app.use('/issues', issuesRouter);
app.use('/petitions', petitionsRouter);
app.use('/polls', pollsRouter);
app.use('/volunteers', volunteersRouter);
app.use('/accounts', accountsRouter);

const { notFound, errorHandler } = require('./middleware/error');
app.use(notFound);
app.use(errorHandler);

mongoose.connect(MONGODB_URI).catch((err) => {
    console.error('MongoDB connection error:', err.message);
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log(`MongoDB connected: ${connection.name}`);
});
connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
        await mongoose.connection.close().catch(() => {});
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
