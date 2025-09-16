import express, { Application, Request } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import globalErrHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/router';

const app: Application = express();

/** ---------- CORS (must come BEFORE routes) ---------- */
const allowlist = (process.env.CORS_ORIGINS ??
  'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(s => s.trim());

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // allow non-browser requests (e.g., curl, server-to-server) where origin may be undefined
    if (!origin) return callback(null, true);
    if (allowlist.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // required because you use cookies/withCredentials
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Apply CORS and handle preflight
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // respond to preflight with same options

/** ---------- Parsers ---------- */
app.use(express.json());
app.use(cookieParser());

/** ---------- Routes ---------- */
app.use('/api/v1', router);

/** ---------- Error & 404 ---------- */
app.use(globalErrHandler);
app.use(notFound);

export default app;
