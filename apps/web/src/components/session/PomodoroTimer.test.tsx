// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PomodoroTimer } from './PomodoroTimer';
import { useSession } from '@/hooks/useSession';
import { SessionMode } from '@mindfulprep/shared';

// Mock the useSession hook
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

describe('PomodoroTimer Component', () => {
  const mockUseSession = {
    sessionId: 'session-123',
    mode: SessionMode.STANDARD,
    workDuration: 25,
    breakDuration: 5,
    elapsed: 0,
    isRunning: true,
    isBreak: false,
    completedPomodoros: 0,
    pauseSession: vi.fn(),
    resumeSession: vi.fn(),
    endSession: vi.fn(),
    endBreak: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSession as any).mockReturnValue(mockUseSession);
  });

  it('renders correctly with initial state', () => {
    render(<PomodoroTimer />);
    
    // Check mode badge
    expect(screen.getByText('Standard Mode')).toBeTruthy();
    
    // Check formatted time (25:00)
    expect(screen.getByText('25:00')).toBeTruthy();
    
    // Check state text
    expect(screen.getAllByText('Focus time')).toBeTruthy();
  });

  it('calls pauseSession when pause button is clicked', () => {
    render(<PomodoroTimer />);
    
    const pauseButton = screen.getByLabelText('Pause session');
    fireEvent.click(pauseButton);
    
    expect(mockUseSession.pauseSession).toHaveBeenCalledTimes(1);
  });

  it('renders resume button when paused and calls resumeSession on click', () => {
    (useSession as any).mockReturnValue({
      ...mockUseSession,
      isRunning: false,
    });
    
    render(<PomodoroTimer />);
    
    const resumeButton = screen.getByLabelText('Resume session');
    fireEvent.click(resumeButton);
    
    expect(mockUseSession.resumeSession).toHaveBeenCalledTimes(1);
  });

  it('shows end confirm modal when stop button is clicked', () => {
    render(<PomodoroTimer />);
    
    const endButton = screen.getByLabelText('End session');
    fireEvent.click(endButton);
    
    // Verify modal is shown
    expect(screen.getByText('End session?')).toBeTruthy();
    expect(screen.getByText(/Are you sure you want to end/)).toBeTruthy();
  });

  it('shows break modal when isBreak is true', () => {
    (useSession as any).mockReturnValue({
      ...mockUseSession,
      isBreak: true,
    });
    
    render(<PomodoroTimer />);
    
    expect(screen.getByText('Break time!')).toBeTruthy();
    expect(screen.getByText(/Take a 5-minute break/)).toBeTruthy();
  });
});
