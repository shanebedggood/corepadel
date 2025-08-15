import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Observable, Subscription, map } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  routerLink?: string;
  icon?: string;
}

interface PrimeBreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbModule],
  template: `
    <div class="page-header-container">
      <!-- Breadcrumbs -->
      <div class="mb-2 pl-0">
        @if (breadcrumbs && breadcrumbs.length > 0) {
          <p-breadcrumb 
            [model]="primeBreadcrumbItems" 
            [home]="(homeItem$ | async) || undefined">
            <ng-template #item let-item>
              <a class="cursor-pointer" [routerLink]="item.url">
                {{ item.label }}
              </a>
            </ng-template>
            <ng-template #separator> / </ng-template>
          </p-breadcrumb>
        }
      </div>

      <!-- Page Title -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ title }}
          </h1>
          @if (subtitle) {
            <p class="text-gray-600 dark:text-gray-400 mb-1">
              {{ subtitle }}
            </p>
          }
        </div>
        <div class="flex items-center">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];

  homeItem$: Observable<PrimeBreadcrumbItem>;
  private subscription = new Subscription();

  constructor(private authService: FirebaseAuthService) {
    // Create dynamic home item based on user role
    this.homeItem$ = this.authService.userProfile$.pipe(
      map(profile => {
        const roles = profile?.roles || [];
        // Determine the appropriate home route based on user roles
        if (roles.includes('admin')) {
          return {
            label: 'Home',
            url: '/admin'
          };
        } else if (roles.includes('player')) {
          return {
            label: 'Home',
            url: '/player'
          };
        } else {
          // Fallback to role switcher if no specific role
          return {
            label: 'Home',
            url: '/choose-role'
          };
        }
      })
    );
  }

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Check if we should show the home breadcrumb
  get showHomeBreadcrumb(): boolean {
    if (!this.breadcrumbs || this.breadcrumbs.length === 0) return true;
    
    // Don't show home if the first breadcrumb is Dashboard
    return !this.breadcrumbs.some(item => item.label === 'Dashboard');
  }

  // Convert our breadcrumb items to PrimeNG format
  get primeBreadcrumbItems(): PrimeBreadcrumbItem[] {
    if (!this.breadcrumbs) return [];
    
    return this.breadcrumbs.map(item => ({
      label: item.label,
      url: item.routerLink || item.route,
      icon: item.icon
    }));
  }
}
