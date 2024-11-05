import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ErrorLoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    res.on('finish', () => {
      if (res.statusCode >= 500) {
        console.error(`Error ${res.statusCode} on ${req.method} ${req.url}`);
      }
    });
    next();
  }
}
