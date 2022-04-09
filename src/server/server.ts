import fs from 'fs';
import https from 'https';
import http from 'http';
import express from 'express';
import mongoose, { NativeError } from 'mongoose';
import morgan from 'morgan';
import methodOverride from 'method-override';
import { PORT } from '../config';
import { DB_HOST, DB_PORT, DB_NAME, DB_OPTIONS } from '../config/db';
import { configureResponseHandlers } from './utils';
import { configureRoutes } from '../routes';
import { TokenData, PaginationData } from '../validation';
import { UserInstance } from '../models';

// Extend the types availble on the Express request/response objects.
declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      credentials: string[];
      tokenData: TokenData;
      user: UserInstance;
      requestedUser: UserInstance;
      paginationData: PaginationData;
    }
    interface Response {
      fatalError: (message: string | NativeError | Error) => Response;
      validationError: (message: string) => Response;
      notFoundError: (message: string) => Response;
      authenticationError: (message: string) => Response;
      authorizationError: (message: string) => Response;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      success: (message: string, data?: any) => Response;
    }
  }
}

// Connect to the DB instance.
const databaseUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose.connect(databaseUrl, DB_OPTIONS);
const db = mongoose.connection;
db.on('error', (errorDetails) =>
  console.error('database connection error %s', errorDetails),
);
db.once('open', () => {
  // Create / Configure the Express app.
  const app = express();
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );
  app.use(express.json());
  app.use(methodOverride());
  app.use(morgan('dev'));

  // Setup custom response handlers for the app.
  app.use((_req, res, next) => {
    configureResponseHandlers(res);
    next();
  });

  // Setup all API routes.
  const apiRouter = express.Router();
  configureRoutes(apiRouter);
  app.use(apiRouter);

  // Setup a catch-all for routes that do not exist.
  app.use('*', (req, res) => {
    return res.notFoundError('API route not found');
  });

  // Build an HTTP or HTTPS server depending on configs available.
  let server;
  const certExists = fs.existsSync('../config/ssl/cert.pem');
  const keyExists = fs.existsSync('../config/ssl/key.pem');
  const useHttps = certExists && keyExists;
  if (useHttps) {
    server = https.createServer(
      {
        key: fs.readFileSync('../config/ssl/key.pem'),
        cert: fs.readFileSync('../config/ssl/cert.pem'),
      },
      app,
    );
  } else {
    server = http.createServer(app);
  }

  server.listen(PORT, () => {
    console.log(
      'JSON CMS API listening on port %s using %s protocol',
      PORT,
      useHttps ? 'https' : 'http',
    );
  });
});
