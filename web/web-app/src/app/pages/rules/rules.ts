import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { QuarkusRulesService, PadelRule } from '../../services/quarkus-rules.service';
import { PageHeaderComponent, BreadcrumbItem } from '../../layout/component/page-header.component';

interface RuleSection {
    title: string;
    content: string;
    icon: string;
    color: string;
}

@Component({
    selector: 'rules-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        DividerModule,
        AccordionModule,
        BadgeModule,
        PageHeaderComponent
    ],
    templateUrl: './rules.component.html',
    styles: [`
        .prose {
            line-height: 1.6;
        }
        .prose p {
            margin-bottom: 1rem;
        }
        .prose ul {
            list-style-type: disc;
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }
        .prose li {
            margin-bottom: 0.5rem;
        }
    `]
})
export class Rules implements OnInit {
    padelRules: PadelRule[] = [];
    selectedRuleIndex: number | null = null;

    // Page header configuration
    breadcrumbs: BreadcrumbItem[] = [
        { label: 'Rules', icon: 'pi pi-book' }
    ];

    constructor(private padelRulesService: QuarkusRulesService) { }

    ngOnInit() {
        this.loadPadelRules();
    }

    loadPadelRules() {
        this.padelRulesService.getPadelRules().subscribe({
            next: (rules) => {
                this.padelRules = rules;
                

            },
            error: (error) => {
                // Remove all console.error statements
            }
        });
    }

    openRuleModal(index: number) {
        this.selectedRuleIndex = index;
    }

    closeRuleModal() {
        this.selectedRuleIndex = null;
    }


}
