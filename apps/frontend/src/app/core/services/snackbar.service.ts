import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private snack = inject(MatSnackBar);

  show(message: string, config: { panelClass?: string; duration?: number } = {}) {
    this.snack.open(message, 'Fechar', {
      duration: config.duration ?? 3000,
      panelClass: config.panelClass ? [config.panelClass] : undefined,
    });
  }
}
