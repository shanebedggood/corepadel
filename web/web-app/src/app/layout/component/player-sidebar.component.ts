import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerMenu } from './player-menu.component';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-player-sidebar',
  standalone: true,
  imports: [CommonModule, PlayerMenu],
  template: `
    <div class="layout-sidebar player-sidebar" [ngClass]="sidebarClass">
      <app-player-menu></app-player-menu>
    </div>
  `,
  styles: [`
    .layout-sidebar.player-sidebar {
      position: fixed;
      height: calc(100vh - 4rem);
      z-index: 999;
      overflow-y: auto;
      user-select: none;
      top: 4rem;
      left: 0;
      transition: transform 0.3s ease;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-right: 1px solid #86efac;
      width: 16rem;
      padding: 0.5rem 1.5rem;
      box-sizing: border-box;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar-track {
      background: #dcfce7;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar-thumb {
      background: #86efac;
      border-radius: 3px;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar-thumb:hover {
      background: #4ade80;
    }

    /* Static layout behavior */
    .layout-wrapper.layout-static .layout-sidebar.player-sidebar {
      transform: translateX(0);
    }

    .layout-wrapper.layout-static.layout-static-inactive .layout-sidebar.player-sidebar {
      transform: translateX(-100%);
    }

    @media screen and (max-width: 991px) {
      .layout-sidebar.player-sidebar {
        position: fixed;
        transform: translateX(-100%);
        width: 100%;
        top: 0;
        height: 100vh;
      }

      .layout-sidebar.player-sidebar.layout-sidebar-active {
        transform: translateX(0);
      }
    }
  `]
})
export class PlayerSidebar {
  constructor(public el: ElementRef, public layoutService: LayoutService) {}

  get sidebarClass() {
    return {
      'layout-sidebar-active': this.isStaticActive(),
      'layout-sidebar-inactive': !this.isStaticActive()
    };
  }

  isStaticActive() {
    return !this.layoutService.layoutState().staticMenuDesktopInactive;
  }
}
