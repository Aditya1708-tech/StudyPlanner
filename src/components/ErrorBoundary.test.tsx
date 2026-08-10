import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

const ProblemChild: React.FC = () => {
  throw new Error('Test rendering crash exception');
};

describe('ErrorBoundary Component Tests', () => {
  it('should render children normally when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>All Systems Normal</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('All Systems Normal')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should capture errors, prevent full application crashes, and render the custom fallback screen', () => {
    // Suppress console.error logging in test outputs for simulated errors
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Verify fallback title renders
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected application rendering error occurred/)).toBeInTheDocument();
    
    // Verify specific error detail is displayed
    expect(screen.getByText(/Test rendering crash exception/)).toBeInTheDocument();
    
    // Verify retry button renders
    expect(screen.getByRole('button', { name: /Retry and Reload/ })).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
