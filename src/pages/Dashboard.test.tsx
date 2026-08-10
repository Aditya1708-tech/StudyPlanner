import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudyProvider } from '../context/StudyContext';
import { ToastProvider } from '../context/ToastContext';
import Dashboard from './Dashboard';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('Dashboard Component and Widget Tests', () => {
  beforeAll(() => {
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

  it('should render dashboard greetings and dynamic stats widgets', () => {
    localStorage.clear();

    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    // Verify greetings
    expect(screen.getByText(/Aditya!/)).toBeInTheDocument();

    // Verify widgets exist
    expect(screen.getByText("Today's Tasks")).toBeInTheDocument();
    expect(screen.getByText('Study Time Today')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('Next Exam')).toBeInTheDocument();

    // Verify default stats values
    expect(screen.getByText('0 Days')).toBeInTheDocument(); // Streak default
    expect(screen.getByText('None')).toBeInTheDocument(); // Next exam default
  });

  it('should manage keyboard focus when toggling the add exam form', async () => {
    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    // Toggle button
    const openBtn = screen.getByLabelText('Toggle add exam form');
    expect(openBtn).toBeInTheDocument();

    // Click to open
    fireEvent.click(openBtn);

    // The first input field should receive focus
    const nameInput = screen.getByLabelText('Exam Name');
    expect(nameInput).toBeInTheDocument();
    
    await screen.findByRole('textbox', { name: 'Exam Name' });
    // Verify it is focused
    await waitFor(() => {
      expect(document.activeElement).toBe(nameInput);
    });
  });
});
