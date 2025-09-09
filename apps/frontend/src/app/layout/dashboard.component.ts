import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #drawer mode="side" [opened]="opened()"
        class="w-64 bg-surface-variant">
        <mat-toolbar color="primary" class="!text-white">
          <span>Clínica</span>
        </mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/pacientes" routerLinkActive="active">
            <mat-icon>person</mat-icon>
            <span class="ml-2">Pacientes</span>
          </a>
          <a mat-list-item routerLink="/exames" routerLinkActive="active">
            <mat-icon>science</mat-icon>
            <span class="ml-2">Exames</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="!text-white">
          <button mat-icon-button (click)="toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="ml-4">Dashboard</span>
        </mat-toolbar>

        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active {
      background-color: rgba(0,0,0,0.08);
      border-radius: 8px;
    }
    mat-sidenav-container {
      height: 100vh;
    }
  `]
})
export class DashboardComponent {
  opened = signal(true);

  toggle() {
    this.opened.update(o => !o);
  }
}
