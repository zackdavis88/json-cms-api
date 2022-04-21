import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET } from '../../config/auth';
import { TokenData } from '../utils';

export const jwtHeader = (req: Request, res: Response, next: NextFunction) => {
  const header: string = req.headers['x-auth-token']
    ? req.headers['x-auth-token'].toString()
    : '';
  if (!header) {
    return res.validationError('x-auth-token header is missing from input');
  }

  let tokenData: JwtPayload | string;
  try {
    tokenData = jwt.verify(header, SECRET);
  } catch (verifyError) {
    if (verifyError && verifyError.name.toLowerCase() === 'tokenexpirederror') {
      return res.validationError('x-auth-token is expired');
    }

    if (verifyError && verifyError.name.toLowerCase() === 'jsonwebtokenerror') {
      return res.validationError('x-auth-token is invalid');
    }
  }

  const { _id, apiKey } = tokenData as TokenData;
  if (!_id || !apiKey) {
    return res.validationError('x-auth-token is missing required fields');
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.validationError('x-auth-token contains an invalid id');
  }

  req.tokenData = { _id, apiKey };
  next();
};
