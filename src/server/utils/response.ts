import { Response } from 'express';
import { NativeError } from 'mongoose';

/*
  NAME: Fatal Error
  CODE: 500
  DESC: Used whenever something out of a user's control happens. Such as a library/dependency failing
        for an unknown reason.
*/
const fatalError = (res: Response) => {
  return (message: string | NativeError) => {
    res.statusCode = 500;
    if (!res.headersSent) return res.json({ fatalError: message });
  };
};

/*
  NAME: Validation Error
  CODE: 400
  DESC: Used when a user submits input that fails validation.
*/
const validationError = (res: Response) => {
  return (message: string) => {
    res.statusCode = 400;
    if (!res.headersSent) return res.json({ error: message });
  };
};

/*
  NAME: Not Found Error
  CODE: 404
  DESC: Used when a resource or API route is not found.
*/
const notFoundError = (res: Response) => {
  return (message: string) => {
    res.statusCode = 404;
    if (!res.headersSent) return res.json({ error: message });
  };
};

/*
  NAME: Authentication Error
  CODE: 403
  DESC: Used when a user fails to authenticate successfully.
*/
const authenticationError = (res: Response) => {
  return (message: string) => {
    res.statusCode = 403;
    if (!res.headersSent) return res.json({ error: message });
  };
};

/*
  NAME: Authorization Error
  CODE: 401
  DESC: Used when a user tries to perform an action with insufficient permission.
*/
const authorizationError = (res: Response) => {
  return (message: string) => {
    res.statusCode = 401;
    if (!res.headersSent) return res.json({ error: message });
  };
};

/*
  NAME: Success
  CODE: 200
  DESC: Used to send a successful API response.
*/
const success = (res: Response) => {
  return (message: string, data = {}) => {
    res.statusCode = 200;
    if (!res.headersSent) return res.json({ message, ...data });
  };
};

export const configureResponseHandlers = (res: Response) => {
  res.fatalError = fatalError(res);
  res.validationError = validationError(res);
  res.notFoundError = notFoundError(res);
  res.authenticationError = authenticationError(res);
  res.authorizationError = authorizationError(res);
  res.success = success(res);
};
