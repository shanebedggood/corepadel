import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarWidget } from '../../pages/landing/components/topbarwidget';
import { FooterWidget } from '../../pages/landing/components/footerwidget';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'public-layout',
  standalone: true,
  imports: [CommonModule, TopbarWidget, FooterWidget, ConfirmDialogModule],
  templateUrl: './public.layout.component.html',
  styles: []
})
export class PublicLayout {
}
