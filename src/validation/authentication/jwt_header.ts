import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { SECRET } from '../../config/auth';
import { TokenData } from '../utils';

export const jwtHeader = (req: Request, res: Response, next: NextFunction) => {
  const header: string = req.headers['x-auth-token']
    ? req.headers['x-auth-token'].toString()
    : '';
  if (!header) return res.validationError('x-auth-token header is missing from input');

  jwt.verify(header, SECRET, (err: VerifyErrors, tokenData: TokenData) => {
    if (err && err.name.toLowerCase() === 'tokenexpirederror')
      return res.validationError('x-auth-token is expired');

    if (err && err.name.toLowerCase() === 'jsonwebtokenerror')
      return res.validationError('x-auth-token is invalid');

    const { _id, apiKey } = tokenData;
    if (!_id || !apiKey)
      return res.validationError('x-auth-token is missing required fields');

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.validationError('x-auth-token contains an invalid id');
    }

    req.tokenData = { _id, apiKey };
    next();
  });
};
