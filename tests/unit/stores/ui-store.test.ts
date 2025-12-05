/**
 * UI Store Unit Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUIStore } from '@/stores/ui-store';

// Mock document for theme tests
const mockSetAttribute = vi.fn();
const originalDocument = global.document;

beforeEach(() => {
  // Reset store state
  useUIStore.setState({
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: 'dark',
    notifications: [],
    isCommandPaletteOpen: false,
  });

  // Mock document.documentElement
  global.document = {
    ...originalDocument,
    documentElement: {
      ...originalDocument?.documentElement,
      setAttribute: mockSetAttribute,
    },
  } as unknown as Document;

  vi.useFakeTimers();
});

afterEach(() => {
  global.document = originalDocument;
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('UIStore', () => {
  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.theme).toBe('dark');
      expect(state.notifications).toEqual([]);
      expect(state.isCommandPaletteOpen).toBe(false);
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should toggle sidebar collapsed state', () => {
      const { toggleSidebarCollapsed } = useUIStore.getState();

      toggleSidebarCollapsed();
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);

      toggleSidebarCollapsed();
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('Theme Management', () => {
    it('should set theme', () => {
      const { setTheme } = useUIStore.getState();

      setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should toggle theme from dark to light', () => {
      const { toggleTheme } = useUIStore.getState();

      toggleTheme();
      expect(useUIStore.getState().theme).toBe('light');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should toggle theme from light to dark', () => {
      useUIStore.setState({ theme: 'light' });
      const { toggleTheme } = useUIStore.getState();

      toggleTheme();
      expect(useUIStore.getState().theme).toBe('dark');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('Notification Management', () => {
    it('should add notification with generated id', () => {
      const { addNotification } = useUIStore.getState();

      addNotification({
        type: 'success',
        title: 'Test notification',
        message: 'Test message',
      });

      const notifications = useUIStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].title).toBe('Test notification');
      expect(notifications[0].id).toBeDefined();
    });

    it('should add multiple notifications', () => {
      const { addNotification } = useUIStore.getState();

      addNotification({ type: 'success', title: 'First' });
      addNotification({ type: 'error', title: 'Second' });
      addNotification({ type: 'info', title: 'Third' });

      const notifications = useUIStore.getState().notifications;
      expect(notifications).toHaveLength(3);
    });

    it('should auto-remove notification after default duration', () => {
      const { addNotification } = useUIStore.getState();

      addNotification({ type: 'success', title: 'Test' });
      expect(useUIStore.getState().notifications).toHaveLength(1);

      vi.advanceTimersByTime(5000);
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should auto-remove notification after custom duration', () => {
      const { addNotification } = useUIStore.getState();

      addNotification({ type: 'success', title: 'Test', duration: 2000 });
      expect(useUIStore.getState().notifications).toHaveLength(1);

      vi.advanceTimersByTime(2000);
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should not auto-remove notification when duration is 0', () => {
      const { addNotification } = useUIStore.getState();

      addNotification({ type: 'success', title: 'Test', duration: 0 });
      expect(useUIStore.getState().notifications).toHaveLength(1);

      vi.advanceTimersByTime(10000);
      expect(useUIStore.getState().notifications).toHaveLength(1);
    });

    it('should remove notification by id', () => {
      const { addNotification, removeNotification } = useUIStore.getState();

      addNotification({ type: 'success', title: 'Test', duration: 0 });
      const notificationId = useUIStore.getState().notifications[0].id;

      removeNotification(notificationId);
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { addNotification, clearNotifications } = useUIStore.getState();

      addNotification({ type: 'success', title: 'First', duration: 0 });
      addNotification({ type: 'error', title: 'Second', duration: 0 });
      addNotification({ type: 'info', title: 'Third', duration: 0 });

      clearNotifications();
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('Command Palette Management', () => {
    it('should open command palette', () => {
      const { setCommandPaletteOpen } = useUIStore.getState();

      setCommandPaletteOpen(true);
      expect(useUIStore.getState().isCommandPaletteOpen).toBe(true);
    });

    it('should close command palette', () => {
      useUIStore.setState({ isCommandPaletteOpen: true });
      const { setCommandPaletteOpen } = useUIStore.getState();

      setCommandPaletteOpen(false);
      expect(useUIStore.getState().isCommandPaletteOpen).toBe(false);
    });
  });
});
