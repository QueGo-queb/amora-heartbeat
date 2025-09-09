import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('Temps de chargement pages critiques', async ({ page }) => {
    // Test page d'accueil
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homeLoadTime = Date.now() - startTime;
    
    expect(homeLoadTime).toBeLessThan(3000); // < 3 secondes
    
    // Test dashboard
    const dashboardStart = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const dashboardLoadTime = Date.now() - dashboardStart;
    
    expect(dashboardLoadTime).toBeLessThan(5000); // < 5 secondes
  });

  test('Core Web Vitals', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Mesurer LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // < 2.5s pour bon LCP
  });
});
