import { Component, HostBinding, Input, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter, delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../service/layout.service';
import { environment } from '../../../environments/environment';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menuitem]',
  standalone: true,
  imports: [CommonModule, RouterModule, RippleModule],
  template: `
    <ng-container>
      @if (root && item.visible !== false) {
        <div class="layout-menuitem-root-text">
          {{ item.label }}
        </div>
      }
      @if ((!item.routerLink || item.items) && item.visible !== false) {
        <a
          [attr.href]="item.url"
          (click)="itemClick($event)"
          [ngClass]="item.styleClass"
          [attr.target]="item.target"
          tabindex="0"
          pRipple
        >
          @if (isMaterialIcon()) {
            <span class="material-icons layout-menuitem-icon">{{getMaterialIconName()}}</span>
          } @else {
            <i [ngClass]="getIconClasses()" class="layout-menuitem-icon"></i>
          }
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }
      @if (item.routerLink && !item.items && item.visible !== false) {
        <a
          (click)="itemClick($event)"
          [ngClass]="item.styleClass"
          [routerLink]="item.routerLink"
          routerLinkActive="active-route"
          [routerLinkActiveOptions]="item.routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
          [fragment]="item.fragment"
          [queryParamsHandling]="item.queryParamsHandling"
          [preserveFragment]="item.preserveFragment"
          [skipLocationChange]="item.skipLocationChange"
          [replaceUrl]="item.replaceUrl"
          [state]="item.state"
          [queryParams]="item.queryParams"
          [attr.target]="item.target"
          tabindex="0"
          pRipple
        >
          @if (isMaterialIcon()) {
            <span class="material-icons layout-menuitem-icon">{{getMaterialIconName()}}</span>
          } @else {
            <i [ngClass]="getIconClasses()" class="layout-menuitem-icon"></i>
          }
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }
      @if (item.items && item.visible !== false) {
        <ul [@children]="submenuAnimation">
          @for (child of item.items; track $index; let i = $index) {
            <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child['badgeClass']"></li>
          }
        </ul>
      }
    </ng-container>
  `,
  animations: [
    trigger('children', [
      state('collapsed', style({ height: '0' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ],
  providers: [LayoutService]
})
export class AppMenuitem implements OnInit, OnDestroy {
  @Input() item!: MenuItem;
  @Input() index!: number;
  @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;
  @Input() parentKey!: string;

  active = false;
  menuSourceSubscription: Subscription;
  menuResetSubscription: Subscription;
  key: string = '';

  constructor(
    public router: Router,
    private layoutService: LayoutService
  ) {
    this.menuSourceSubscription = this.layoutService.menuSource$.pipe(
      delay(0) // Defer to next tick using RxJS
    ).subscribe((value) => {
      if (value.routeEvent) {
        this.active = value.key === this.key || value.key.startsWith(this.key + '-') ? true : false;
      } else {
        if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
          this.active = false;
        }
      }
    });

    this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => {
      this.active = false;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((params) => {
        if (this.item.routerLink) {
          this.updateActiveStateFromRoute();
        }
      });
  }

  ngOnInit() {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
    if (this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute() {
    let activeRoute = this.router.isActive(this.item.routerLink[0], {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored'
    });
    if (activeRoute) {
      this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
    }
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
    }

    this.layoutService.onMenuStateChange({ key: this.key });
  }

  get submenuAnimation() {
    return this.root ? 'expanded' : this.active ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active && !this.root;
  }

  /**
   * Check if this menu item should use a Material Icon
   */
  isMaterialIcon(): boolean {
    const itemAny = this.item as any;
    return itemAny.iconClass === 'material-icons';
  }

  /**
   * Get the Material Icon name (the actual icon to display)
   */
  getMaterialIconName(): string {
    return this.item.icon || '';
  }

  /**
   * Get the appropriate icon classes for the menu item
   * Handles both PrimeNG icons and Material Icons
   */
  getIconClasses(): string {
    // Check if this is a Material Icon (using any to bypass TypeScript interface limitation)
    const itemAny = this.item as any;
    
    // Handle Material Icons - check both ways
    if (this.item.icon === 'material-icons' && itemAny.iconClass) {
      // For Material Icons, combine the base class with the specific icon
      const result = `${this.item.icon} ${itemAny.iconClass}`;
      return result;
    }
    
    if (itemAny.iconClass === 'material-icons' && this.item.icon) {
      // For Material Icons, combine the specific icon with the base class
      const result = `${itemAny.iconClass} ${this.item.icon}`;
      return result;
    }
    
    // For PrimeNG icons or other cases, return the icon as-is
    return this.item.icon || '';
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }
    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
