import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AppRequest } from '../types/request.type';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<AppRequest>();
    const { userId } = request.session || {};

    if (userId) {
      const user = await this.usersService.findOneById(userId);
      request.currentUser = user;
    }
    return next.handle();
  }
}
