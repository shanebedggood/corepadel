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
            <div *ngFor="let message of messages" class="persistent-message mb-3" [@messageAnimation]>
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
                            <button 
                                pButton 
                                type="button" 
                                icon="pi pi-times" 
                                class="p-button-sm p-button-text p-button-rounded" 
                                (click)="removeMessage(message.id)" 
                                pTooltip="Dismiss" 
                                styleClass="ml-2">
                            </button>
                        </div>
                    </ng-template>
                </p-message>
            </div>
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
