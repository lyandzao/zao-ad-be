import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface IResponse<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        return {
          code: 0,
          status: 200,
          data,
          message: '请求成功',
        };
      }),
    );
  }
}
