import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudyProvider } from '../../context/StudyContext';
import { ToastProvider } from '../../context/ToastContext';
import Sidebar from './Sidebar';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('Sidebar Component Tests', () => {
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

  it('should render navigation links and handle collapse state', () => {
    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    // Verify logo name
    expect(screen.getAllByText(/StudyAI/)).not.toBeNull();

    // Verify main nav links exist
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Planner')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Tasks Planner')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();

    // Verify collapse trigger is present and click it
    const collapseBtn = screen.getByLabelText('Collapse sidebar');
    expect(collapseBtn).toBeInTheDocument();
    
    // Toggle collapse
    fireEvent.click(collapseBtn);
    
    // Trigger should update its label
    expect(collapseBtn).toHaveAttribute('aria-label', 'Expand sidebar');
  });

  it('should toggle theme on button click', () => {
    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    // Click desktop theme toggle
    const themeBtn = screen.getByLabelText('Toggle theme color mode');
    expect(themeBtn).toBeInTheDocument();
    
    // Click toggle
    fireEvent.click(themeBtn);

    // Context theme should toggle (a toast notification message should trigger, validating system integration)
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
