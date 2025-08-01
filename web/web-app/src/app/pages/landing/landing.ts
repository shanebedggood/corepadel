import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeroWidgetComponent } from './components/herowidget';
import { FooterWidget } from './components/footerwidget';
import { ClubsWidgetComponent } from './components/clubswidget';
import { PlayersWidgetComponent } from './components/playerswidget';
import { SponsorsWidgetComponent } from './components/sponsorswidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        RouterModule,
        HeroWidgetComponent,
        ClubsWidgetComponent,
        PlayersWidgetComponent,
        SponsorsWidgetComponent,
        FooterWidget,
    ],
    templateUrl: './landing.component.html',
    styles: []
})
export class Landing {
}
