import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout, retryWhen, delay, scan } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api'; // ajuste conforme env
  private http = inject(HttpClient);

  private defaultPipe<T>(obs$: Observable<T>): Observable<T> {
    return obs$.pipe(
      timeout(10000),
      retryWhen(errors =>
        errors.pipe(
          scan((acc, err) => {
            if (acc >= 2) throw err;
            return acc + 1;
          }, 0),
          delay(300)
        )
      )
    );
  }

  get<T>(path: string, params?: any) {
    return firstValueFrom(
      this.defaultPipe(
        this.http.get<T>(`${this.base}${path}`, { params })
      )
    );
  }

  post<T>(path: string, body: any, headers?: HttpHeaders) {
    return firstValueFrom(
      this.defaultPipe(
        this.http.post<T>(`${this.base}${path}`, body, { headers })
      )
    );
  }
}
