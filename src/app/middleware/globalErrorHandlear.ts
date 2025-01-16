import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
// import config from '../config';
import { TErrorSource } from '../interface/error';
import { handleZodError } from '../errors/handelZodError';
import { handelValidationError } from '../errors/handelValidationError';
import { handleCastError } from '../errors/handelCastError';
import handelDuplicateError from '../errors/handelDuplicateError';
import { AppError } from '../errors/AppErrors';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Somthing went wrong!';
  let errorSources: TErrorSource = [
    {
      path: '',
      message: 'Somthing went wrong!!',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handelValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handelDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err?.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err?.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    // stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
