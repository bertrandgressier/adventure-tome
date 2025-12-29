import { describe, it, expect, afterEach, vi } from 'vitest';
import { isIOS, isIOSSafari, isSafari, isStandalone } from './browser-detection';

describe('browser-detection', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  afterEach(() => {
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  describe('isIOS', () => {
    it('should return true for iPhone', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPad', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPod', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isIOS()).toBe(true);
    });

    it('should return false for Android', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36' },
        writable: true
      });
      expect(isIOS()).toBe(false);
    });

    it('should return false for Desktop Chrome', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36' },
        writable: true
      });
      expect(isIOS()).toBe(false);
    });

    it('should return false for MSStream user agents', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14393' },
        writable: true
      });
      Object.defineProperty(global, 'window', {
        value: { MSStream: true },
        writable: true
      });
      expect(isIOS()).toBe(false);
    });

    it('should return false when navigator is undefined', () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true
      });
      expect(isIOS()).toBe(false);
    });
  });

  describe('isIOSSafari', () => {
    it('should return true for iOS Safari', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isIOSSafari()).toBe(true);
    });

    it('should return false for iOS Chrome (CriOS)', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/112.0.5615.109 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isIOSSafari()).toBe(false);
    });

    it('should return false for iOS Firefox (FxiOS)', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/112.0 Mobile/15E148 Safari/605.1.15' },
        writable: true
      });
      expect(isIOSSafari()).toBe(false);
    });

    it('should return false for iOS Opera (OPiOS)', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPiOS/3.6.224555.409 Mobile/15E148 Safari/605.1.15' },
        writable: true
      });
      expect(isIOSSafari()).toBe(false);
    });

    it('should return false for iOS Brave', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Brave/1.56.0 Mobile/15E148 Safari/605.1.15' },
        writable: true
      });
      expect(isIOSSafari()).toBe(false);
    });

    it('should return false for Android Chrome', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36' },
        writable: true
      });
      expect(isIOSSafari()).toBe(false);
    });

    it('should return false for Desktop Safari', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15' },
        writable: true
      });
      expect(isIOSSafari()).toBe(false);
    });
  });

  describe('isSafari', () => {
    it('should return true for iOS Safari', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isSafari()).toBe(true);
    });

    it('should return true for Desktop Safari', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15' },
        writable: true
      });
      expect(isSafari()).toBe(true);
    });

    it('should return false for iOS Chrome (CriOS)', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/112.0.5615.109 Mobile/15E148 Safari/604.1' },
        writable: true
      });
      expect(isSafari()).toBe(false);
    });

    it('should return false for Desktop Chrome', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36' },
        writable: true
      });
      expect(isSafari()).toBe(false);
    });

    it('should return false for Android Chrome', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36' },
        writable: true
      });
      expect(isSafari()).toBe(false);
    });

    it('should return false for iOS Brave', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Brave/1.56.0 Mobile/15E148 Safari/605.1.15' },
        writable: true
      });
      expect(isSafari()).toBe(false);
    });
  });

  describe('isStandalone', () => {
    it('should return true when display-mode is standalone', () => {
      Object.defineProperty(global, 'window', {
        value: {
          matchMedia: vi.fn().mockReturnValue({ matches: true })
        },
        writable: true
      });
      expect(isStandalone()).toBe(true);
    });

    it('should return false when display-mode is not standalone', () => {
      Object.defineProperty(global, 'window', {
        value: {
          matchMedia: vi.fn().mockReturnValue({ matches: false })
        },
        writable: true
      });
      expect(isStandalone()).toBe(false);
    });

    it('should return false when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      expect(isStandalone()).toBe(false);
    });
  });
});
