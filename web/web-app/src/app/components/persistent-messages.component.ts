import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { ErrorHandlerService, ErrorMessage } from '../services/error-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-persistent-messages',
    standalone: true,
    imports: [CommonModule, MessageModule, ButtonModule],
    template: `
        <div class="persistent-messages-container">
            @if (messages.length > 0) {
                <div class="persistent-messages-header">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-600">
                            {{ messages.length }} message{{ messages.length > 1 ? 's' : '' }}
                        </span>
                        <button 
                            pButton 
                            type="button" 
                            icon="pi pi-times" 
                            class="p-button-sm p-button-text p-button-rounded" 
                            (click)="clearAllMessages()" 
                            pTooltip="Clear all messages"
                            [disabled]="messages.length === 0">
                        </button>
                    </div>
                </div>
            }
            
            @for (message of messages; track message.id) {
                <div class="persistent-message mb-3" [@messageAnimation]>
                    <p-message 
                        [severity]="message.severity" 
                        [text]="message.detail" 
                        [closable]="true" 
                        (onClose)="removeMessage(message.id)" 
                        styleClass="w-full">
                        <ng-template pTemplate="messageicon">
                            <div class="flex items-center justify-between w-full">
                                <div class="flex items-center">
                                    <i [class]="getIconClass(message.severity)" class="mr-2"></i>
                                    <span class="font-medium">{{ message.summary }}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-xs text-gray-500 mr-2">
                                        {{ formatTimestamp(message.timestamp) }}
                                    </span>
                                    <button 
                                        pButton 
                                        type="button" 
                                        icon="pi pi-times" 
                                        class="p-button-sm p-button-text p-button-rounded" 
                                        (click)="removeMessage(message.id)" 
                                        pTooltip="Dismiss">
                                    </button>
                                </div>
                            </div>
                        </ng-template>
                    </p-message>
                </div>
            }
        </div>
    `,
    styles: [`
        .persistent-messages-container {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            width: 100%;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
        }
        
        .persistent-messages-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .persistent-message {
            animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 768px) {
            .persistent-messages-container {
                top: 70px;
                right: 10px;
                left: 10px;
                max-width: none;
                max-height: calc(100vh - 80px);
            }
            
            .persistent-messages-header {
                padding: 6px 10px;
            }
        }
        
        @media (max-width: 480px) {
            .persistent-messages-container {
                top: 60px;
                right: 5px;
                left: 5px;
            }
        }
    `]
})
export class PersistentMessagesComponent implements OnInit, OnDestroy {
    messages: ErrorMessage[] = [];
    private subscription: Subscription = new Subscription();

    constructor(private errorHandlerService: ErrorHandlerService) { }

    ngOnInit(): void {
        this.subscription.add(
            this.errorHandlerService.getPersistentMessages().subscribe(messages => {
                this.messages = messages;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    removeMessage(messageId: string): void {
        this.errorHandlerService.removeMessage(messageId);
    }

    clearAllMessages(): void {
        this.errorHandlerService.clearAllMessages();
    }

    formatTimestamp(timestamp: Date): string {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else {
            return timestamp.toLocaleDateString();
        }
    }

    getIconClass(severity: string): string {
        switch (severity) {
            case 'error':
                return 'pi pi-exclamation-triangle text-red-500';
            case 'warn':
                return 'pi pi-exclamation-circle text-yellow-500';
            case 'info':
                return 'pi pi-info-circle text-blue-500';
            case 'success':
                return 'pi pi-check-circle text-green-500';
            default:
                return 'pi pi-info-circle';
        }
    }
}
