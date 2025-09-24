import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function convertBigInt(value: any): any {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(convertBigInt);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      out[key] = convertBigInt(value[key]);
    }
    return out;
  }
  return value;
}

@Injectable()
export class SerializeBigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => convertBigInt(data)));
  }
}


