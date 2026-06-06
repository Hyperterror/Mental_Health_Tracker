import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logMoodAndProvideWellness } from './wellness.service';
import { prisma } from '../lib/prisma';
import { GamificationService } from './gamification.service';
import { PatternDetectionJob } from '../jobs/pattern-detection.job';

vi.mock('../lib/prisma', () => ({
  prisma: {
    moodLog: { create: vi.fn() },
    wellnessSuggestion: { create: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('./gamification.service', () => ({
  GamificationService: {
    awardPoints: vi.fn(),
  },
}));

vi.mock('../jobs/pattern-detection.job', () => ({
  PatternDetectionJob: {
    detectBurnout: vi.fn(),
  },
}));

describe('Wellness Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully log mood and return a fallback suggestion when AI is disabled', async () => {
    const mockLog = { id: 'log-1', moodScore: 3, stressLevel: 8 };
    vi.mocked(prisma.moodLog.create).mockResolvedValue(mockLog as any);
    vi.mocked(GamificationService.awardPoints).mockResolvedValue();
    vi.mocked(PatternDetectionJob.detectBurnout).mockResolvedValue(false);

    const result = await logMoodAndProvideWellness('user-1', 3, 8, 'Feeling tired', []);

    expect(result.success).toBe(true);
    expect(result.data?.moodLog.id).toBe('log-1');
    expect(result.data?.suggestion).toBeDefined();
    expect(prisma.moodLog.create).toHaveBeenCalled();
    expect(GamificationService.awardPoints).toHaveBeenCalledWith('user-1', 5, 'Logged daily mood');
  });
});
