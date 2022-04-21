import mongoose from 'mongoose';
import { DB_HOST, DB_PORT, DB_NAME, DB_OPTIONS } from '../../src/config/db';

const databaseUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

let dbConnection: mongoose.Connection = null;

export const connectDatabase = () =>
  new Promise<mongoose.Connection>((resolve) => {
    if (dbConnection) return resolve(dbConnection);
    mongoose.connect(databaseUrl, DB_OPTIONS);
    const db = mongoose.connection;
    db.on('error', () => {
      console.error('Unit Tests DB Error');
      resolve(null);
    });
    db.once('open', () => {
      dbConnection = db;
      resolve(dbConnection);
    });
  });
