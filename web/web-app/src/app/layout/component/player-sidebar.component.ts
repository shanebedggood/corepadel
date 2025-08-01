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
      height: 100vh;
      z-index: 999;
      overflow-y: auto;
      user-select: none;
      top: 0;
      left: 0;
      transition: transform 0.3s ease;
      background-color: #1e293b;
      border-right: 1px solid #334155;
      width: 16rem;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar-track {
      background: #1e293b;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 3px;
    }

    .layout-sidebar.player-sidebar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    @media screen and (max-width: 991px) {
      .layout-sidebar.player-sidebar {
        transform: translateX(-100%);
        width: 100%;
      }

      .layout-sidebar.player-sidebar.layout-sidebar-active {
        transform: translateX(0);
      }
    }

    @media screen and (min-width: 992px) {
      .layout-sidebar.player-sidebar {
        transform: translateX(0);
      }

      .layout-sidebar.player-sidebar.layout-sidebar-inactive {
        transform: translateX(-100%);
      }
    }
  `]
})
export class PlayerSidebar {
  constructor(public el: ElementRef, public layoutService: LayoutService) {}

  get sidebarClass() {
    return {
      'layout-sidebar-active': this.isOverlayActive(),
      'layout-sidebar-inactive': !this.isOverlayActive()
    };
  }

  isOverlayActive() {
    return this.layoutService.layoutState().overlayMenuActive;
  }
}
