/**
 * Communication Service Module
 */

import { logger } from '../../utils/logger';
const log = logger.module('CommunicationService');

export interface MessageDto {
  id: number;
  from: number;
  to: number;
  content: string;
  read: boolean;
  createdAt: Date;
}

export class CommunicationService {
  async sendMessage(from: number, to: number, content: string): Promise<MessageDto> {
    log.info({ from, to }, 'Message sent');
    return { id: 1, from, to, content, read: false, createdAt: new Date() };
  }

  async getMessages(userId: number): Promise<MessageDto[]> {
    return [];
  }

  async markAsRead(messageId: number, userId: number): Promise<boolean> {
    log.info({ messageId, userId }, 'Message marked as read');
    return true;
  }
}

export const communicationService = new CommunicationService();
