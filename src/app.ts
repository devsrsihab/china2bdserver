import express, { Application } from 'express';
import cors from 'cors';
import globalErrHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/router';
import cookieParser from 'cookie-parser';
const app: Application = express();

// express parse
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173','http://localhost:5174'], credentials: true }));
// application routes
app.use('/api/v1', router);

// globa err handler
app.use(globalErrHandler)

// not found route
app.use(notFound)

export default app;
