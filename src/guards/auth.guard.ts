import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../types/request.type';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AppRequest>();

    return Boolean(request.session?.userId);
  }
}
