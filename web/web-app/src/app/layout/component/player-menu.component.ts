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
            label: 'Padel Clubs',
            icon: 'pi pi-fw pi-warehouse',
            routerLink: ['/player/clubs']
          },
          {
            label: 'Padel Rules',
            icon: 'pi pi-fw pi-book',
            routerLink: ['/player/rules']
          }
        ]
      },
      {
        label: 'My Running',
        items: [
          {
            label: '5AM Run Booking',
            icon: 'pi pi-fw pi-clock',
            routerLink: ['/player/run-booking']
          }
        ]
      }
      // {
      //   label: 'My Running',
      //   items: [
      //     {
      //       label: 'My Runs',
      //       icon: 'directions_run',
      //       iconClass: 'material-icons',
      //       routerLink: ['/player/rules']
      //     }
      //   ]
      // }
    ];
  }
}
