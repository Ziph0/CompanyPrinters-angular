import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Loading } from './loading';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(Loading);

  if (req.method === 'GET' && !req.headers.has('X-Skip-Loading')) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};