import { UserInstance } from '../../src/models';
import { SECRET } from '../../src/config/auth';
import jwt from 'jsonwebtoken';

interface DataOverride {
  _id?: string;
  apiKey?: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (
  user: UserInstance,
  dataOverride: DataOverride = {},
  secretOverride?: string,
) => {
  let tokenData = {
    _id: user._id,
    apiKey: user.apiKey,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3,
  };
  tokenData = { ...tokenData, ...dataOverride };
  const token = jwt.sign(tokenData, secretOverride || SECRET);
  return token;
};
