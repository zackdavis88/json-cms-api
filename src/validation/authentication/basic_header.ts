import { Request, Response, NextFunction } from 'express';

export const basicHeader = (req: Request, res: Response, next: NextFunction) => {
  const header: string = req.headers['x-auth-basic']
    ? req.headers['x-auth-basic'].toString()
    : '';
  if (!header) return res.validationError('x-auth-basic header is missing from input');

  const encodedRegex = new RegExp('^Basic .+$');
  if (!encodedRegex.test(header))
    return res.validationError('x-auth-basic must use Basic Auth');

  const decodedRegex = new RegExp('^[A-Za-z0-9-_]+[:].*$');
  const headerSplit = header.split(' ');
  const encodedCredentials = Buffer.from(headerSplit[1], 'base64');
  const decodedCredentials = encodedCredentials.toString('ascii');
  if (!decodedRegex.test(decodedCredentials))
    return res.validationError('x-auth-basic credentials have invalid format');

  const credentials = decodedCredentials.split(/:(.*)/);

  // Attach the credentials to the req object so that the controller method can validate them.
  req.credentials = credentials;
  next();
};
