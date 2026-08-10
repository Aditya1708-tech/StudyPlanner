import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudyProvider } from '../context/StudyContext';
import { ToastProvider } from '../context/ToastContext';
import Assistant from './Assistant';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import '@testing-library/jest-dom';

describe('AIStudyAssistant Component Tests', () => {
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

    // Mock HTML element scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('should render AI Study Assistant header and quick prompts', () => {
    localStorage.clear();

    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Assistant />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    // Verify header title
    expect(screen.getByText('AI Study Assistant')).toBeInTheDocument();
    // Verify standard text
    expect(screen.getByText('Ask queries, explain concepts, or auto-schedule study plans.')).toBeInTheDocument();
    expect(screen.getByText('Quick Prompts')).toBeInTheDocument();
    expect(screen.getByText('Chemistry Schedule')).toBeInTheDocument();
  });

  it('should allow user to type and send messages and get AI responses', async () => {
    localStorage.clear();

    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Assistant />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    const input = screen.getByPlaceholderText(/Ask study tips, explain 'molecular orbitals'/i);
    const sendButton = screen.getByRole('button', { name: /Send message/i });

    // Send a message
    fireEvent.change(input, { target: { value: 'Create study plan for Chemistry' } });
    fireEvent.click(sendButton);

    // User message should appear immediately
    expect(screen.getByText('Create study plan for Chemistry')).toBeInTheDocument();

    // AI response should appear after 1 second
    await waitFor(() => {
      expect(screen.getByText(/I've structured a study plan/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // AI response should include suggested tasks
    expect(screen.getByText('Calculus Exam Review (Functions & Integrals)')).toBeInTheDocument();
  });

  it('should generate deterministic AI responses that match for same queries', async () => {
    localStorage.clear();

    const { unmount } = render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Assistant />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    const input = screen.getByPlaceholderText(/Ask study tips, explain 'molecular orbitals'/i);
    const sendButton = screen.getByRole('button', { name: /Send message/i });

    // Send query
    fireEvent.change(input, { target: { value: 'Chemistry review' } });
    fireEvent.click(sendButton);

    let text1 = "";
    await waitFor(() => {
      const messages = screen.getAllByText(/Chapter 4/i);
      expect(messages.length).toBeGreaterThan(0);
      text1 = messages[0].textContent || "";
    }, { timeout: 3000 });

    unmount();

    // Rerender to start fresh
    render(
      <ToastProvider>
        <StudyProvider>
          <MemoryRouter>
            <Assistant />
          </MemoryRouter>
        </StudyProvider>
      </ToastProvider>
    );

    const input2 = screen.getByPlaceholderText(/Ask study tips, explain 'molecular orbitals'/i);
    const sendButton2 = screen.getByRole('button', { name: /Send message/i });

    // Send same query
    fireEvent.change(input2, { target: { value: 'Chemistry review' } });
    fireEvent.click(sendButton2);

    let text2 = "";
    await waitFor(() => {
      const messages = screen.getAllByText(/Chapter 4/i);
      expect(messages.length).toBeGreaterThan(0);
      text2 = messages[0].textContent || "";
    }, { timeout: 3000 });

    // The text should be identical
    expect(text1).toBe(text2);
  });
});
