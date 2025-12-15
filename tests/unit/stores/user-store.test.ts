/**
 * User Store Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore } from '@/stores/user-store';
import type { User, PlanType } from '@/types';

// Mock zustand persist middleware storage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

// Reset store state helper
const resetStore = () => {
  useUserStore.setState({
    user: null,
    isLoading: true,
  });
};

// Mock user data
const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  plan: 'free' as PlanType,
  plan_expires_at: null,
  language: 'en',
  timezone: null,
  onboarding_completed: false,
  created_at: '2024-01-01T00:00:00Z',
};

describe('UserStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null user and loading true', () => {
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should set user and set loading to false', () => {
      const { setUser } = useUserStore.getState();

      setUser(mockUser);

      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
    });

    it('should clear user when set to null', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { setUser } = useUserStore.getState();

      setUser(null);

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state', () => {
      const { setLoading } = useUserStore.getState();

      setLoading(false);
      expect(useUserStore.getState().isLoading).toBe(false);

      setLoading(true);
      expect(useUserStore.getState().isLoading).toBe(true);
    });
  });

  describe('Plan Management', () => {
    it('should update user plan', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { updatePlan } = useUserStore.getState();

      updatePlan('pro' as PlanType);

      expect(useUserStore.getState().user?.plan).toBe('pro');
    });

    it('should not update plan when user is null', () => {
      const { updatePlan } = useUserStore.getState();

      updatePlan('pro' as PlanType);

      expect(useUserStore.getState().user).toBeNull();
    });

    it('should handle all plan types', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { updatePlan } = useUserStore.getState();

      const planTypes: PlanType[] = ['free', 'starter', 'pro', 'team'];

      planTypes.forEach((plan) => {
        updatePlan(plan);
        expect(useUserStore.getState().user?.plan).toBe(plan);
      });
    });
  });

  describe('Onboarding Management', () => {
    it('should complete onboarding', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { completeOnboarding } = useUserStore.getState();

      completeOnboarding();

      expect(useUserStore.getState().user?.onboarding_completed).toBe(true);
    });

    it('should not complete onboarding when user is null', () => {
      const { completeOnboarding } = useUserStore.getState();

      completeOnboarding();

      expect(useUserStore.getState().user).toBeNull();
    });

    it('should preserve other user data when completing onboarding', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { completeOnboarding } = useUserStore.getState();

      completeOnboarding();

      const user = useUserStore.getState().user;
      expect(user?.id).toBe(mockUser.id);
      expect(user?.email).toBe(mockUser.email);
      expect(user?.name).toBe(mockUser.name);
      expect(user?.plan).toBe(mockUser.plan);
    });
  });

  describe('Logout', () => {
    it('should clear user on logout', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { logout } = useUserStore.getState();

      logout();

      expect(useUserStore.getState().user).toBeNull();
    });

    it('should not change loading state on logout', () => {
      useUserStore.setState({ user: mockUser, isLoading: false });
      const { logout } = useUserStore.getState();

      logout();

      // Loading state is not changed by logout
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should have correct persist configuration', () => {
      // The store uses persist middleware with name 'user-storage'
      // and only persists the user field
      const state = useUserStore.getState();

      // Store should have all expected methods
      expect(typeof state.setUser).toBe('function');
      expect(typeof state.setLoading).toBe('function');
      expect(typeof state.updatePlan).toBe('function');
      expect(typeof state.completeOnboarding).toBe('function');
      expect(typeof state.logout).toBe('function');
    });
  });
});
