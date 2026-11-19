export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  req.log?.error({ err }, 'unhandled error');
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong.' } });
}