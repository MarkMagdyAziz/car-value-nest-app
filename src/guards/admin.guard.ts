import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../types/request.type';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AppRequest>();
    if (!request.currentUser) {
      return false;
    }

    return request.currentUser.admin;
  }
}
