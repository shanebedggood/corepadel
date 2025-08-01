import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PadelRule {
    ruleId?: string;
    title: string;
    rule_description: string[];
    order_number?: number;
}

@Injectable({
    providedIn: 'root'
})
export class QuarkusRulesService {
    private readonly apiUrl = environment.quarkusApiUrl || 'http://localhost:8081/api';

    constructor(private http: HttpClient) { }

    /**
     * Get all padel rules sorted by order_number
     * @returns Observable of PadelRule array sorted by order_number
     */
    getPadelRules(): Observable<PadelRule[]> {
        return this.http.get<PadelRule[]>(`${this.apiUrl}/rules`).pipe(
            map((rules: PadelRule[]) => {
                // Ensure rule_description is always an array
                const transformedRules = rules.map(rule => ({
                    ...rule,
                    rule_description: Array.isArray(rule.rule_description) 
                        ? rule.rule_description 
                        : rule.rule_description ? [rule.rule_description] : []
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
                rule_description: Array.isArray(rule.rule_description) 
                    ? rule.rule_description 
                    : [rule.rule_description]
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
                rule_description: Array.isArray(createdRule.rule_description) 
                    ? createdRule.rule_description 
                    : [createdRule.rule_description]
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
                rule_description: Array.isArray(updatedRule.rule_description) 
                    ? updatedRule.rule_description 
                    : [updatedRule.rule_description]
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
                    rule_description: Array.isArray(rule.rule_description) 
                        ? rule.rule_description 
                        : [rule.rule_description]
                }));
            }),
            catchError(error => {
                console.error('Error searching rules via Quarkus API:', error);
                return of([]);
            })
        );
    }
} 