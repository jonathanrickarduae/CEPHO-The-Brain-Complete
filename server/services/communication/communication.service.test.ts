/**
 * Communication Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { communicationService } from './communication.service';
import * as communicationRepository from './communication.repository';

vi.mock('./communication.repository');

describe('CommunicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const mockMessage = {
        id: 1,
        from: 1,
        to: 2,
        content: 'Hello',
        createdAt: new Date(),
      };

      vi.spyOn(communicationRepository, 'sendMessage').mockResolvedValue(mockMessage as any);

      const result = await communicationService.sendMessage(1, {
        to: 2,
        content: 'Hello',
      });

      expect(result).toEqual(mockMessage);
    });
  });

  describe('getConversation', () => {
    it('should return conversation messages', async () => {
      const mockMessages = [
        { id: 1, content: 'Hi' },
        { id: 2, content: 'Hello' },
      ];

      vi.spyOn(communicationRepository, 'getConversation').mockResolvedValue(mockMessages as any);

      const result = await communicationService.getConversation(1, 2);

      expect(result).toHaveLength(2);
    });
  });
});
