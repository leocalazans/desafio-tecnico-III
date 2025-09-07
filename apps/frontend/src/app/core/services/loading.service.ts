import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = 0;
  private _loading = signal(false);

  public readonly loading = computed(() => this._loading());

  show() {
    this._count++;
    this._loading.set(true);
  }

  hide() {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0) {
      this._loading.set(false);
    }
  }
}
