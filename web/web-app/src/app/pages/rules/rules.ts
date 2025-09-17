import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { QuarkusRulesService, PadelRule, RuleSection } from '../../services/quarkus-rules.service';
// Removed breadcrumbs


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
        BadgeModule
    ],
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.scss', '../../shared/styles/container.styles.scss']
})
export class Rules implements OnInit {
    padelRules: PadelRule[] = [];
    selectedRuleIndex: number | null = null;
    loading = true;
    error = false;
    

    constructor(private padelRulesService: QuarkusRulesService) { }

    ngOnInit() {
        this.loadPadelRules();
    }

    loadPadelRules() {
        this.loading = true;
        this.error = false;
        
        this.padelRulesService.getPadelRules().subscribe({
            next: (rules) => {
                this.padelRules = rules || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading padel rules:', error);
                console.error('Error details:', error.status, error.message);
                this.error = true;
                this.loading = false;
                this.padelRules = [];
            }
        });
    }

    openRuleModal(index: number) {
        if (index >= 0 && index < this.padelRules.length) {
            this.selectedRuleIndex = index;
        } else {
            this.selectedRuleIndex = null;
        }
    }

    closeRuleModal() {
        this.selectedRuleIndex = null;
    }

    getRulePreview(sections: RuleSection[]): string {
        if (!sections || sections.length === 0) {
            return 'No description available';
        }
        
        // Get the first section content and clean it up for preview
        let firstSection = sections[0];
        
        if (!firstSection || !firstSection.content) {
            return 'No content available';
        }
        
        let content = firstSection.content;
        
        // Remove any extra whitespace and newlines
        content = content.replace(/\s+/g, ' ').trim();
        
        if (content.length <= 120) {
            return content;
        }
        
        return content.substring(0, 120) + '...';
    }

    trackByRule(index: number, rule: PadelRule): string {
        return rule.ruleId || rule.title || index.toString();
    }

    /**
     * Check if a section should display a number/title
     * @param section The rule section to check
     * @returns true if the section has a meaningful title that should be displayed
     */
    shouldDisplaySectionNumber(section: RuleSection): boolean {
        return section.sectionTitle !== null && 
               section.sectionTitle !== undefined && 
               section.sectionTitle.trim() !== '';
    }

    getSelectedRuleSections(): RuleSection[] {
        if (this.selectedRuleIndex === null || this.selectedRuleIndex < 0 || this.selectedRuleIndex >= this.padelRules.length) {
            return [];
        }
        return this.padelRules[this.selectedRuleIndex].sections;
    }

    getSelectedRuleOrderNumber(): number {
        if (this.selectedRuleIndex === null || this.selectedRuleIndex < 0 || this.selectedRuleIndex >= this.padelRules.length) {
            return this.selectedRuleIndex !== null ? this.selectedRuleIndex + 1 : 1;
        }
        return this.padelRules[this.selectedRuleIndex].order_number || (this.selectedRuleIndex + 1);
    }

    getSelectedRuleTitle(): string {
        if (this.selectedRuleIndex === null || this.selectedRuleIndex < 0 || this.selectedRuleIndex >= this.padelRules.length) {
            return 'Untitled Rule';
        }
        return this.padelRules[this.selectedRuleIndex].title || 'Untitled Rule';
    }
}
