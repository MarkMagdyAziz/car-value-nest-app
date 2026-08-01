import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';
//1. this ensure that the dto passed in is actualle a class
// we can instantiate (it has a constructor )
interface ClassConstructor<T> {
  new (...args: unknown[]): T;
}
// 2. this is a CUSTOM Decorator
// Instead of writing @UseInterceptors(new SerializeInterceptor(UserDto)

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor<T, T> {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(
    context: ExecutionContext, // information about the current request/route
    next: CallHandler<T>, // a reference to the route  handler (the controller method)
  ): Observable<T> | Promise<Observable<T>> {
    // Everything BEFORE 'next.handle()' runs BEFORE the request hits the controller.
    console.log(
      'Step 1: Run something before the handler is called',
      context.getHandler().name,
    );
    return next.handle().pipe(
      // 3. Transformation Magic:
      // This converts the plain JavaScript object into an instance of your DTO.
      // excludeExtraneousValues: true is the KEY. It tells class-transformer
      // to ignore any property in 'data' that DOES NOT have an @Expose() decorator
      // in your DTO. This is how we hide the password!

      map((data) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
