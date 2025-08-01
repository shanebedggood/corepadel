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

@Injectable({
    providedIn: 'root'
})
export class StickyMessageService {
    constructor(private messageService: MessageService) { }

    /**
     * Add a toast message that is sticky by default
     */
    add(message: StickyToastMessage): void {
        // Always make toasts sticky unless explicitly set to false
        const stickyMessage = {
            ...message,
            life: message.life !== undefined ? message.life : 0, // Default to 0 (sticky)
            sticky: message.sticky !== undefined ? message.sticky : true // Default to sticky
        };
        this.messageService.add(stickyMessage);
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
    }

    /**
     * Clear messages by key
     */
    clearByKey(key: string): void {
        this.messageService.clear(key);
    }
}
