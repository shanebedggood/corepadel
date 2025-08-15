import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-player-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (item of model; track item; let i = $index) {
        @if (!item.separator) {
          <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
        }
        @if (item.separator) {
          <li class="menu-separator"></li>
        }
      }
    </ul>
  `
})
export class PlayerMenu implements OnInit {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = this.buildMenuItems();
  }

  private buildMenuItems(): MenuItem[] {
    return [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/player']
          }
        ]
      },
      {
        label: 'My Padel',
        items: [
          {
            label: 'My Tournaments',
            icon: 'pi pi-fw pi-trophy',
            routerLink: ['/player/tournaments']
          },
          {
            label: 'My Matches',
            icon: 'pi pi-fw pi-calendar',
            routerLink: ['/player/matches']
          },
          {
            label: 'My Teams',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/player/teams']
          },
          {
            label: 'My Profile',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/player/profile']
          }
        ]
      },
      {
        label: 'Learn Padel',
        items: [
          {
            label: 'Rules',
            icon: 'pi pi-fw pi-book',
            routerLink: ['/player/rules']
          }
        ]
      },
      {
        label: 'Destinations',
        items: [
          {
            label: 'South Africa',
            icon: 'pi pi-fw pi-map',
            routerLink: ['/player/destinations'],
            items: [
              {
                label: 'Clubs / Courts',
                icon: 'pi pi-fw pi-list',
                routerLink: ['/player/destinations/clubs']
              },
              {
                label: 'Events',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                  {
                    label: 'Kids Parties',
                    icon: 'pi pi-fw pi-sparkles',
                    routerLink: ['/player/destinations/events/kids']
                  },
                  {
                    label: 'Social',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/player/destinations/events/social']
                  },
                  {
                    label: 'Corporate',
                    icon: 'pi pi-fw pi-briefcase',
                    routerLink: ['/player/destinations/events/corporate']
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}
