import fs from 'fs';
import { PORT } from '../../src/config';

export const getServerUrl = () => {
  const certExists = fs.existsSync('../../src/config/ssl/cert.pem');
  const keyExists = fs.existsSync('../../src/config/ssl/key.pem');
  const protocol = certExists && keyExists ? 'https' : 'http';
  return `${protocol}://localhost:${PORT}`;
};
