import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export type AuthRequest = Request & { auth?: { username: string } };

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.query.token !== 'SecretToken') {
      res.statusCode = 401;
      res.send();
      return;
    }

    req.auth = {
      username: 'Username',
    };

    next();
  }
}
