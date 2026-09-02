import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../types/request.type';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AppRequest>();
    return request.session?.userId;
  },
);
