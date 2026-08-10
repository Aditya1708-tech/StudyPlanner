import { render, screen, act, waitFor } from '@testing-library/react';
import OfflineBanner from './OfflineBanner';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('OfflineBanner Component Tests', () => {
  it('should not display the offline banner by default (when online)', () => {
    render(<OfflineBanner />);
    const banner = screen.queryByText('Offline Mode Active');
    expect(banner).not.toBeInTheDocument();
  });

  it('should display the offline banner when window offline event is dispatched', async () => {
    render(<OfflineBanner />);

    // Dispatch offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const bannerText = screen.getByText('Offline Mode Active');
    expect(bannerText).toBeInTheDocument();
    
    // Verify detailed copy is displayed
    expect(screen.getByText(/Running locally/)).toBeInTheDocument();
    
    // Verify it has proper accessible landmark role status
    const bannerContainer = bannerText.closest('[role="status"]');
    expect(bannerContainer).not.toBeNull();
    expect(bannerContainer).toHaveAttribute('aria-live', 'polite');

    // Dispatch online event and verify banner hides after exit animation
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Offline Mode Active')).not.toBeInTheDocument();
    });
  });
});
