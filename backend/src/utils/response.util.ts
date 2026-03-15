import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Created successfully',
) => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
  },
  message: string = 'Success',
) => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      ...pagination,
      items: data,
    },
  });
};

export const sendMessage = (
  res: Response,
  message: string,
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
  });
};
