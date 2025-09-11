import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PadelRule {
    ruleId?: string;
    title: string;
    sections: RuleSection[];
    order_number?: number;
}

export interface RuleSection {
    sectionId?: string;
    ruleId: string;
    sectionOrder: number;
    sectionTitle?: string;
    content: string;
}

@Injectable({
    providedIn: 'root'
})
export class QuarkusRulesService {
    private readonly apiUrl = environment.quarkusApiUrl || 'http://localhost:8081/api';

    constructor(private http: HttpClient) { }

    /**
     * Parse rule description text into proper paragraphs
     * @param description The raw description text
     * @returns Array of paragraphs
     */
    private parseRuleDescription(description: string | string[]): string[] {
        if (Array.isArray(description)) {
            // If it's already an array, return as is
            return description;
        }
        
        if (!description) {
            return [];
        }
        
        // Split on paragraph breaks (double newlines or multiple spaces)
        // This handles both actual paragraph breaks and comma-separated content better
        let paragraphs = description
            .split(/\n\s*\n|\s*,\s*(?=\S)/) // Split on double newlines or commas followed by non-whitespace
            .map(p => p.trim())
            .filter(p => p.length > 0);
        
        // If we only got one paragraph, try splitting on single commas that might be natural breaks
        if (paragraphs.length === 1 && description.includes(',')) {
            paragraphs = description
                .split(/,\s*/)
                .map(p => p.trim())
                .filter(p => p.length > 0);
        }
        
        // Clean up each paragraph
        paragraphs = paragraphs.map(p => 
            p.replace(/\s+/g, ' ') // Replace multiple spaces with single space
             .replace(/\n/g, ' ')  // Replace newlines with spaces
             .trim()
        ).filter(p => p.length > 0);
        
        return paragraphs;
    }

    /**
     * Get all padel rules sorted by order_number
     * @returns Observable of PadelRule array sorted by order_number
     */
    getPadelRules(): Observable<PadelRule[]> {
        return this.http.get<PadelRule[]>(`${this.apiUrl}/rules`).pipe(
            map((rules: PadelRule[]) => {
                // Use the new parsing function for better rule description handling
                const transformedRules = rules.map(rule => ({
                    ...rule,
                    sections: rule.sections || [] // Ensure sections is an array
                }));
                return transformedRules;
            }),
            catchError(error => {
                console.error('Error fetching rules from Quarkus API:', error);
                // Return empty array as fallback
                return of([]);
            })
        );
    }

    /**
     * Get a single rule by ID
     * @param ruleId The rule ID
     * @returns Observable of PadelRule
     */
    getRuleById(ruleId: string): Observable<PadelRule | null> {
        return this.http.get<PadelRule>(`${this.apiUrl}/rules/${ruleId}`).pipe(
            map(rule => ({
                ...rule,
                sections: rule.sections || [] // Ensure sections is an array
            })),
            catchError(error => {
                console.error('Error fetching rule from Quarkus API:', error);
                return of(null);
            })
        );
    }

    /**
     * Create a new rule (admin only)
     * @param rule The rule to create
     * @returns Observable of the created rule
     */
    createRule(rule: Omit<PadelRule, 'ruleId'>): Observable<PadelRule> {
        return this.http.post<PadelRule>(`${this.apiUrl}/rules`, rule).pipe(
            map(createdRule => ({
                ...createdRule,
                sections: Array.isArray(createdRule.sections) 
                    ? createdRule.sections 
                    : [createdRule.sections]
            })),
            catchError(error => {
                console.error('Error creating rule via Quarkus API:', error);
                throw error;
            })
        );
    }

    /**
     * Update an existing rule (admin only)
     * @param ruleId The rule ID
     * @param rule The updated rule data
     * @returns Observable of the updated rule
     */
    updateRule(ruleId: string, rule: Partial<PadelRule>): Observable<PadelRule> {
        return this.http.put<PadelRule>(`${this.apiUrl}/rules/${ruleId}`, rule).pipe(
            map(updatedRule => ({
                ...updatedRule,
                sections: Array.isArray(updatedRule.sections) 
                    ? updatedRule.sections 
                    : [updatedRule.sections]
            })),
            catchError(error => {
                console.error('Error updating rule via Quarkus API:', error);
                throw error;
            })
        );
    }

    /**
     * Delete a rule (admin only)
     * @param ruleId The rule ID
     * @returns Observable of boolean indicating success
     */
    deleteRule(ruleId: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/rules/${ruleId}`).pipe(
            map(() => true),
            catchError(error => {
                console.error('Error deleting rule via Quarkus API:', error);
                return of(false);
            })
        );
    }

    /**
     * Search rules by title
     * @param title The title to search for
     * @returns Observable of matching rules
     */
    searchRulesByTitle(title: string): Observable<PadelRule[]> {
        return this.http.get<PadelRule[]>(`${this.apiUrl}/rules/search?title=${encodeURIComponent(title)}`).pipe(
            map((rules: PadelRule[]) => {
                return rules.map(rule => ({
                    ...rule,
                    sections: Array.isArray(rule.sections) 
                        ? rule.sections 
                        : [rule.sections]
                }));
            }),
            catchError(error => {
                console.error('Error searching rules via Quarkus API:', error);
                return of([]);
            })
        );
    }
} 