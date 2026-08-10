import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteFocusManager monitors React Router's location changes.
 * When the user transitions to a new view, it scrolls the page to the top
 * and programmatically shifts focus to the main content landmark,
 * improving navigation feedback for screen reader users.
 */
const RouteFocusManager: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0);

    // Focus main content container
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Focus the main element
      mainContent.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
};

export default RouteFocusManager;
