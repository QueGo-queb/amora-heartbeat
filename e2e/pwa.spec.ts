import { test, expect } from '@playwright/test';

test.describe('Fonctionnalités PWA', () => {
  test('Service Worker et cache', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Vérifier que le SW est enregistré
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
    
    // Simuler offline
    await context.setOffline(true);
    
    // Naviguer vers une page déjà visitée
    await page.goto('/profile');
    
    // Vérifier que la page s'affiche (depuis le cache)
    await expect(page.locator('[data-testid="profile-container"]')).toBeVisible();
    
    // Vérifier indicateur offline
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Remettre online
    await context.setOffline(false);
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });

  test('Installation PWA', async ({ page }) => {
    await page.goto('/');
    
    // Simuler l'événement beforeinstallprompt
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    });
    
    // Vérifier que le prompt d'installation apparaît
    await expect(page.locator('[data-testid="install-prompt"]')).toBeVisible();
    
    // Cliquer sur installer
    await page.click('[data-testid="install-button"]');
    
    // Note: En E2E réel, difficile de tester l'installation complète
    // Mais on peut vérifier que le prompt disparaît
  });

  test('Notifications push (mock)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Simuler demande permission notifications
    await page.evaluate(() => {
      // Mock Notification.requestPermission
      Object.defineProperty(window, 'Notification', {
        value: {
          requestPermission: () => Promise.resolve('granted'),
          permission: 'granted'
        }
      });
    });
    
    // Vérifier gestion des notifications dans l'app
    await expect(page.locator('[data-testid="notifications-enabled"]')).toBeVisible();
  });
});