import { describe, it, expect } from 'vitest';
import { recommend, PomodoroInput } from './pomodoro.service.js';
import { SessionMode } from '@mindfulprep/shared';

describe('Pomodoro Service', () => {
  it('should recommend CALM mode for late night sessions', () => {
    const input: PomodoroInput = {
      moodScore: 4,
      stressLevel: 3,
      completedSessionsToday: 1,
      currentHour: 23,
    };
    const result = recommend(input);
    expect(result.mode).toBe(SessionMode.CALM);
    expect(result.workDuration).toBe(15);
    expect(result.breakDuration).toBe(5);
    expect(result.label).toBe('Late Night Calm');
  });

  it('should recommend CALM mode for high stress', () => {
    const input: PomodoroInput = {
      moodScore: 4,
      stressLevel: 9,
      completedSessionsToday: 1,
      currentHour: 15,
    };
    const result = recommend(input);
    expect(result.mode).toBe(SessionMode.CALM);
    expect(result.reasoning).toContain('stress level is high');
  });

  it('should recommend RECOVERY mode for good mood and low stress', () => {
    const input: PomodoroInput = {
      moodScore: 5,
      stressLevel: 2,
      completedSessionsToday: 1,
      currentHour: 14,
    };
    const result = recommend(input);
    expect(result.mode).toBe(SessionMode.RECOVERY);
    expect(result.workDuration).toBe(35);
    expect(result.breakDuration).toBe(10);
  });

  it('should recommend STANDARD mode by default', () => {
    const input: PomodoroInput = {
      moodScore: 3,
      stressLevel: 5,
      completedSessionsToday: 2,
      currentHour: 10,
    };
    const result = recommend(input);
    expect(result.mode).toBe(SessionMode.STANDARD);
    expect(result.workDuration).toBe(25);
    expect(result.breakDuration).toBe(5);
  });
});
