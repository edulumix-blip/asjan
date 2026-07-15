import { AD_CLIENT } from '../config/ads';

let loadPromise: Promise<boolean> | null = null;
let scheduleStarted = false;

function injectScript(): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false);
  if (!AD_CLIENT) return Promise.resolve(false);

  const existing = document.querySelector('script[data-edulumix-adsense]');
  if (existing) {
    return new Promise((resolve) => {
      if (existing.getAttribute('data-loaded') === '1') {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-edulumix-adsense', '1');
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
    s.onload = () => {
      s.setAttribute('data-loaded', '1');
      resolve(true);
    };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

export function scheduleAdsenseLoad() {
  if (typeof window === 'undefined' || scheduleStarted) return;
  scheduleStarted = true;

  loadPromise = new Promise((resolve) => {
    const runInject = () => {
      injectScript().then(resolve);
    };

    const whenIdle = () => {
      const ric = (window as any).requestIdleCallback;
      if (typeof ric === 'function') {
        ric(runInject, { timeout: 4000 });
      } else {
        setTimeout(runInject, 2500);
      }
    };

    if (document.readyState === 'complete') {
      whenIdle();
    } else {
      window.addEventListener('load', whenIdle, { once: true });
    }
  });
}

export function waitForAdsenseScript(): Promise<boolean> {
  if (!scheduleStarted) scheduleAdsenseLoad();
  return loadPromise || Promise.resolve(false);
}
