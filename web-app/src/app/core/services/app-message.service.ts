import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

@Injectable()
export class AppMessageService extends MessageService {
  private readonly recentMessages = new Map<string, number>();
  private readonly duplicateWindowMs = 2500;

  override add(message: Message): void {
    const now = Date.now();
    const key = this.messageKey(message);
    const lastShownAt = this.recentMessages.get(key) ?? 0;

    if (now - lastShownAt < this.duplicateWindowMs) {
      return;
    }

    this.recentMessages.set(key, now);
    this.removeExpiredEntries(now);

    if (typeof globalThis.innerWidth === 'number' && globalThis.innerWidth <= 640) {
      this.clear();
    }

    super.add(message);
  }

  override addAll(messages: Message[]): void {
    messages.forEach((message) => this.add(message));
  }

  private messageKey(message: Message): string {
    return [message.key, message.severity, message.summary, message.detail].join('|');
  }

  private removeExpiredEntries(now: number): void {
    for (const [key, shownAt] of this.recentMessages) {
      if (now - shownAt >= this.duplicateWindowMs) {
        this.recentMessages.delete(key);
      }
    }
  }
}
