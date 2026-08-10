import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../../context/ToastContext';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// A mock tester component to invoke the toast hook
const ToastTriggerTester: React.FC = () => {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast('Success Notification Test', 'success')}>Trigger Success</button>
      <button onClick={() => showToast('Critical Error Test', 'error')}>Trigger Error</button>
      <button onClick={() => showToast('Attention Warning Test', 'warning')}>Trigger Warning</button>
      <button onClick={() => showToast('General Info Test', 'info')}>Trigger Info</button>
    </div>
  );
};

describe('Toast Notification System Component Tests', () => {
  beforeAll(() => {
    // Add matchMedia mock just in case
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

  it('should render toast notifications with correct accessibility parameters', async () => {
    render(
      <ToastProvider>
        <ToastTriggerTester />
      </ToastProvider>
    );

    // 1. Success Toast Trigger
    const successBtn = screen.getByText('Trigger Success');
    fireEvent.click(successBtn);

    const successToast = await screen.findByText('Success Notification Test');
    expect(successToast).toBeInTheDocument();
    
    // WCAG Check: success toast should have role="status" and aria-live="polite"
    const successContainer = successToast.closest('[role="status"]');
    expect(successContainer).not.toBeNull();
    expect(successContainer).toHaveAttribute('aria-live', 'polite');

    // 2. Error Toast Trigger
    const errorBtn = screen.getByText('Trigger Error');
    fireEvent.click(errorBtn);

    const errorToast = await screen.findByText('Critical Error Test');
    expect(errorToast).toBeInTheDocument();
    
    // WCAG Check: error toast should have role="alert" and aria-live="assertive"
    const errorContainer = errorToast.closest('[role="alert"]');
    expect(errorContainer).not.toBeNull();
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');

    // 3. Warning Toast Trigger
    const warningBtn = screen.getByText('Trigger Warning');
    fireEvent.click(warningBtn);

    const warningToast = await screen.findByText('Attention Warning Test');
    expect(warningToast).toBeInTheDocument();
    
    // WCAG Check: warning toast should have role="status" (since not error)
    const warningContainer = warningToast.closest('[role="status"]');
    expect(warningContainer).not.toBeNull();

    // 4. Info Toast Trigger
    const infoBtn = screen.getByText('Trigger Info');
    fireEvent.click(infoBtn);

    const infoToast = await screen.findByText('General Info Test');
    expect(infoToast).toBeInTheDocument();
    
    // WCAG Check: info toast should have role="status" and aria-live="polite"
    const infoContainer = infoToast.closest('[role="status"]');
    expect(infoContainer).not.toBeNull();
    expect(infoContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('should allow dismissing a toast notification', async () => {
    render(
      <ToastProvider>
        <ToastTriggerTester />
      </ToastProvider>
    );

    const successBtn = screen.getByText('Trigger Success');
    fireEvent.click(successBtn);

    const toastText = await screen.findByText('Success Notification Test');
    expect(toastText).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close notification');
    fireEvent.click(closeBtn);

    // Wait for the Framer Motion unmount transition to finish
    await waitFor(() => {
      expect(screen.queryByText('Success Notification Test')).not.toBeInTheDocument();
    });
  });
});
