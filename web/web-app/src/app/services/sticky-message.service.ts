import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface StickyToastMessage {
    severity?: 'success' | 'info' | 'warn' | 'error';
    summary?: string;
    detail?: string;
    life?: number;
    key?: string;
    sticky?: boolean;
    closable?: boolean;
    data?: any;
    id?: any;
}

interface ToastRecord {
    key: string;
    timestamp: number;
    count: number;
}

@Injectable({
    providedIn: 'root'
})
export class StickyMessageService {
    private readonly MAX_CONCURRENT_TOASTS = 4;
    private readonly DEDUPE_WINDOW_MS = 5000; // 5 seconds
    private readonly MAX_DUPLICATE_COUNT = 3;
    
    private activeToasts = new Map<string, ToastRecord>();
    private toastQueue: StickyToastMessage[] = [];

    constructor(private messageService: MessageService) { }

    /**
     * Add a toast message with deduplication and flood control
     */
    add(message: StickyToastMessage): void {
        const key = this.generateKey(message);
        const now = Date.now();
        
        // Check for duplicates within the dedupe window
        const existingRecord = this.activeToasts.get(key);
        if (existingRecord && (now - existingRecord.timestamp) < this.DEDUPE_WINDOW_MS) {
            // Increment count and update timestamp
            existingRecord.count++;
            existingRecord.timestamp = now;
            
            // If we've hit the max duplicate count, show a consolidated message
            if (existingRecord.count >= this.MAX_DUPLICATE_COUNT) {
                this.showConsolidatedMessage(message, existingRecord.count);
                return;
            }
            
            // For fewer duplicates, just ignore to prevent spam
            return;
        }
        
        // Check if we're at the max concurrent toasts limit
        if (this.activeToasts.size >= this.MAX_CONCURRENT_TOASTS) {
            // Queue the message for later
            this.toastQueue.push(message);
            return;
        }
        
        // Add the toast
        this.showToast(message, key);
    }

    /**
     * Show a consolidated message for repeated toasts
     */
    private showConsolidatedMessage(message: StickyToastMessage, count: number): void {
        const lifetime = this.getToastLifetime(message.severity, message.life);
        const consolidatedMessage = {
            ...message,
            summary: `${message.summary} (${count} times)`,
            detail: `This message has appeared ${count} times. ${message.detail}`,
            life: lifetime,
            sticky: message.sticky !== undefined ? message.sticky : (lifetime === 0)
        };
        
        this.messageService.add(consolidatedMessage);
        
        // Clear the record to allow new messages
        const key = this.generateKey(message);
        this.activeToasts.delete(key);
    }

    /**
     * Show a toast and track it
     */
    private showToast(message: StickyToastMessage, key: string): void {
        const lifetime = this.getToastLifetime(message.severity, message.life);
        const stickyMessage = {
            ...message,
            life: lifetime,
            sticky: message.sticky !== undefined ? message.sticky : (lifetime === 0)
        };
        
        this.messageService.add(stickyMessage);
        
        // Track the toast
        this.activeToasts.set(key, {
            key,
            timestamp: Date.now(),
            count: 1
        });
        
        // Set up cleanup for non-sticky toasts
        if (lifetime > 0) {
            setTimeout(() => {
                this.activeToasts.delete(key);
                this.processQueue();
            }, lifetime);
        }
    }

    /**
     * Generate a unique key for deduplication
     */
    private generateKey(message: StickyToastMessage): string {
        if (message.key) {
            return message.key;
        }
        
        // Generate key based on content for deduplication
        const content = `${message.severity}-${message.summary}-${message.detail}`;
        return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }

    /**
     * Process queued toasts when space becomes available
     */
    private processQueue(): void {
        if (this.toastQueue.length > 0 && this.activeToasts.size < this.MAX_CONCURRENT_TOASTS) {
            const nextMessage = this.toastQueue.shift();
            if (nextMessage) {
                const key = this.generateKey(nextMessage);
                this.showToast(nextMessage, key);
            }
        }
    }

    /**
     * Get appropriate toast lifetime based on severity
     */
    private getToastLifetime(severity?: string, customLife?: number): number {
        if (customLife !== undefined) {
            return customLife;
        }

        switch (severity) {
            case 'success':
                return 4000; // 4 seconds - quick confirmation
            case 'info':
                return 5000; // 5 seconds - informational
            case 'warn':
                return 8000; // 8 seconds - important but not critical
            case 'error':
                return 0; // Sticky - requires user attention
            default:
                return 5000;
        }
    }

    /**
     * Add a success toast
     */
    addSuccess(summary: string, detail: string): void {
        this.add({ severity: 'success', summary, detail });
    }

    /**
     * Add an error toast
     */
    addError(summary: string, detail: string): void {
        this.add({ severity: 'error', summary, detail });
    }

    /**
     * Add a warning toast
     */
    addWarning(summary: string, detail: string): void {
        this.add({ severity: 'warn', summary, detail });
    }

    /**
     * Add an info toast
     */
    addInfo(summary: string, detail: string): void {
        this.add({ severity: 'info', summary, detail });
    }

    /**
     * Clear all messages
     */
    clear(): void {
        this.messageService.clear();
        this.activeToasts.clear();
        this.toastQueue = [];
    }

    /**
     * Clear messages by key
     */
    clearByKey(key: string): void {
        this.messageService.clear(key);
        this.activeToasts.delete(key);
        // Remove from queue as well
        this.toastQueue = this.toastQueue.filter(msg => this.generateKey(msg) !== key);
    }
}
