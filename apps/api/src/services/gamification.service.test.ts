import { describe, it, expect, vi, beforeEach } from 'vitest';
import { awardPoints, computeSessionPoints, updateStreak } from './gamification.service';
import { BadgeCode } from '@mindfulprep/shared';

describe('Gamification Service', () => {
  describe('computeSessionPoints', () => {
    it('should correctly calculate points based on pomodoros and breaks', () => {
      const session = { completedPomodoros: 2, breaksTaken: 1 };
      const points = computeSessionPoints(session);
      expect(points).toBe(25); // 2*10 + 1*5 = 25
    });

    it('should return 0 if no pomodoros or breaks', () => {
      const session = { completedPomodoros: 0, breaksTaken: 0 };
      expect(computeSessionPoints(session)).toBe(0);
    });
  });

  describe('awardPoints', () => {
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        gamificationRecord: {
          update: vi.fn(),
          findUnique: vi.fn(),
        },
      };
    });

    it('should not update if points are <= 0', async () => {
      await awardPoints('user-1', 0, mockPrisma);
      expect(mockPrisma.gamificationRecord.update).not.toHaveBeenCalled();
    });

    it('should award points and not check for FOCUS_100 badge if points < 100', async () => {
      mockPrisma.gamificationRecord.update.mockResolvedValue({
        calmFocusPoints: 50,
        badges: [],
      });

      await awardPoints('user-1', 50, mockPrisma);

      expect(mockPrisma.gamificationRecord.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { calmFocusPoints: { increment: 50 } },
        select: { calmFocusPoints: true, badges: true },
      });
      // Second update for badge shouldn't be called
      expect(mockPrisma.gamificationRecord.update).toHaveBeenCalledTimes(1);
    });

    it('should award FOCUS_100 badge if threshold is reached and badge not present', async () => {
      // First update returns 100 points
      mockPrisma.gamificationRecord.update.mockResolvedValue({
        calmFocusPoints: 100,
        badges: [],
      });
      // findUnique for checkAndAwardBadge
      mockPrisma.gamificationRecord.findUnique.mockResolvedValue({
        badges: [],
      });

      await awardPoints('user-1', 100, mockPrisma);

      // Check if update was called to add badge
      expect(mockPrisma.gamificationRecord.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { badges: { push: BadgeCode.FOCUS_100 } },
      });
    });
  });
});
