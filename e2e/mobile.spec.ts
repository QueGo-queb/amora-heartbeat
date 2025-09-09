import { test, expect } from '@playwright/test';

test.describe('Expérience mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Navigation mobile', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier menu hamburger mobile
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Ouvrir menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Navigation vers une page
    await page.click('[data-testid="mobile-nav-matching"]');
    await expect(page).toHaveURL('/matching');
  });

  test('Swipe gestures sur mobile', async ({ page }) => {
    await page.goto('/matching');
    
    const profileCard = page.locator('[data-testid="profile-card"]');
    await expect(profileCard).toBeVisible();
    
    // Simuler swipe right (toucher)
    await profileCard.hover();
    await page.mouse.down();
    await page.mouse.move(300, 0);
    await page.mouse.up();
    
    // Vérifier transition
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="profile-card"]')).toBeVisible();
  });

  test('Upload photo mobile', async ({ page }) => {
    await page.goto('/profile/edit');
    
    // Simuler upload photo via camera
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });
    
    // Vérifier preview
    await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible();
  });
});
