import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudyProvider } from '../context/StudyContext';
import { ToastProvider } from '../context/ToastContext';
import AIPlanner from './AIPlanner';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import '@testing-library/jest-dom';

describe('AIPlanner Component Tests', () => {
  beforeAll(() => {
    // Define global window.matchMedia mock for jsdom environment (StudyProvider requirement)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should render planner parameters and show empty states correctly', () => {
    localStorage.clear();

    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <AIPlanner />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    // Verify header title
    expect(screen.getByText('AI Personalized Planner')).toBeInTheDocument();

    // Verify empty state description is shown
    expect(screen.getByText('AI Study Schedule Generator')).toBeInTheDocument();
    expect(screen.getByText(/Transform course content and exam dates/)).toBeInTheDocument();

    // Verify params form exists
    expect(screen.getByLabelText(/Add Course Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Exam Deadline Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Daily Study Availability/i)).toBeInTheDocument();
  });

  it('should allow configuring a subject and exam date', async () => {
    localStorage.clear();

    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <AIPlanner />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    const subjectInput = screen.getByLabelText(/Add Course Subject/i);
    const dateInput = screen.getByLabelText(/Exam Deadline Date/i);
    const addBtn = screen.getByRole('button', { name: /Add Subject/i });

    // Fill subject info
    fireEvent.change(subjectInput, { target: { value: 'Biology 101' } });
    fireEvent.change(dateInput, { target: { value: '2026-09-01' } });
    
    // Add subject
    fireEvent.click(addBtn);

    // Subject should be listed in the chip list
    expect(screen.getByText('Biology 101')).toBeInTheDocument();
    expect(screen.getByText(/Exam: 2026-09-01/)).toBeInTheDocument();
  });

  it('should trigger staged progress loading card on sample generate plan click', async () => {
    localStorage.clear();

    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <AIPlanner />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    const sampleBtn = screen.getByRole('button', { name: /Load Sample & Generate Plan/i });
    fireEvent.click(sampleBtn);

    // Stage 1 loader should appear instantly
    expect(await screen.findByText('Formulating Revision Schedule...')).toBeInTheDocument();
    expect(screen.getByText('Analyzing syllabus')).toBeInTheDocument();
    
    // ProgressBar info
    expect(screen.getByText('Scheduler Pipeline Status')).toBeInTheDocument();

    // Wait for stages to progress and resolve (simulates at least 4s total stage progression)
    await waitFor(() => {
      expect(screen.queryByText('Formulating Revision Schedule...')).not.toBeInTheDocument();
    }, { timeout: 6000 });

    // Once complete, schedule tracker and progress widget should render
    expect(screen.getByText('Plan Progress Tracker')).toBeInTheDocument();
  });
});
