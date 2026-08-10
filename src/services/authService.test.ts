import { describe, it, expect, beforeEach } from 'vitest';
import { getAuthService, AuthService } from './authService';

describe('AuthService Suite', () => {
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    // Re-instantiate the factory provider
    authService = getAuthService();
  });

  it('should initialize with default user in test environments', async () => {
    let currentUser: any = null;
    const unsub = authService.onAuthStateChanged((u) => {
      currentUser = u;
    });

    expect(currentUser).not.toBeNull();
    expect(currentUser?.email).toBe('aditya@studyai.com');
    expect(currentUser?.displayName).toBe('Aditya');
    expect(currentUser?.onboardingCompleted).toBe(true);
    unsub();
  });

  it('should register a new mock user and fire listeners', async () => {
    // Explicitly logout test user first
    await authService.logout();
    
    let activeUser: any = null;
    const unsub = authService.onAuthStateChanged((u) => {
      activeUser = u;
    });

    expect(activeUser).toBeNull();

    const registered = await authService.register('student@study.edu', 'password123');
    expect(registered.email).toBe('student@study.edu');
    expect(registered.displayName).toBe('student');
    expect(registered.onboardingCompleted).toBe(false);

    expect(activeUser).not.toBeNull();
    expect(activeUser.email).toBe('student@study.edu');
    
    unsub();
  });

  it('should login mock users after registration', async () => {
    await authService.logout();
    await authService.register('login@study.edu', 'secretWord');
    await authService.logout();

    const loggedIn = await authService.login('login@study.edu', 'secretWord');
    expect(loggedIn.email).toBe('login@study.edu');
    expect(loggedIn.onboardingCompleted).toBe(false);
  });

  it('should throw an error on invalid logins', async () => {
    await authService.logout();
    await expect(authService.login('nonexistent@study.edu', 'wrong')).rejects.toThrow();
  });

  it('should toggle onboardingCompleted statuses', async () => {
    await authService.logout();
    const registered = await authService.register('onboard@study.edu', 'secretWord');
    expect(registered.onboardingCompleted).toBe(false);

    await authService.setOnboardingCompleted(true);
    let updated: any = null;
    const unsub = authService.onAuthStateChanged((u) => {
      updated = u;
    });

    expect(updated.onboardingCompleted).toBe(true);
    unsub();
  });
});
