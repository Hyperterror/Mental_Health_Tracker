import { describe, it, expect } from 'vitest';
import { getRuleBasedSuggestion } from './wellness.service.js';
import { SuggestionType } from '@mindfulprep/shared';

describe('Wellness Service - Rule Based', () => {
  it('should suggest breathing exercises for high stress', () => {
    const result = getRuleBasedSuggestion(3, 8, []);
    expect(result.type).toBe(SuggestionType.BREATHING);
    expect(result.isAiGenerated).toBe(false);
  });

  it('should suggest hydration for tired tags', () => {
    const result = getRuleBasedSuggestion(3, 5, ['Tired']);
    expect(result.type).toBe(SuggestionType.HYDRATION);
  });

  it('should suggest cognitive reframing for low mood and overwhelmed', () => {
    const result = getRuleBasedSuggestion(2, 6, ['Overwhelmed']);
    expect(result.type).toBe(SuggestionType.COGNITIVE_REFRAMING);
  });

  it('should suggest mindfulness by default', () => {
    const result = getRuleBasedSuggestion(4, 3, []);
    expect(result.type).toBe(SuggestionType.MINDFULNESS);
  });
});
