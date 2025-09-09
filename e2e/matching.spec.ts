import { test, expect } from '@playwright/test';

test.describe('Système de matching', () => {
  test.beforeEach(async ({ page }) => {
    // S'assurer d'être connecté avant chaque test
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('Navigation vers matching', async ({ page }) => {
    await page.click('[data-testid="matching-nav"]');
    
    await expect(page).toHaveURL('/matching');
    await expect(page.locator('[data-testid="profile-card"]')).toBeVisible();
  });

  test('Swipe et interactions profils', async ({ page }) => {
    await page.goto('/matching');
    
    const profileCard = page.locator('[data-testid="profile-card"]').first();
    await expect(profileCard).toBeVisible();
    
    // Vérifier informations profil
    await expect(profileCard.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(profileCard.locator('[data-testid="profile-age"]')).toBeVisible();
    await expect(profileCard.locator('[data-testid="profile-location"]')).toBeVisible();
    
    // Test like (swipe right)
    await page.click('[data-testid="like-profile-button"]');
    
    // Vérifier animation/transition
    await page.waitForTimeout(500);
    
    // Vérifier qu'un nouveau profil apparaît
    await expect(page.locator('[data-testid="profile-card"]')).toBeVisible();
  });

  test('Affichage détails profil', async ({ page }) => {
    await page.goto('/matching');
    
    // Cliquer pour voir profil détaillé
    await page.click('[data-testid="profile-details-button"]');
    
    // Vérifier modal profil détaillé
    await expect(page.locator('[data-testid="profile-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-interests"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-photos"]')).toBeVisible();
  });

  test('Gestion absence de profils', async ({ page }) => {
    await page.goto('/matching');
    
    // Attendre le chargement
    await page.waitForLoadState('networkidle');
    
    // Si plus de profils disponibles (dépend du state de la DB test)
    const noProfilesMessage = page.locator('[data-testid="no-profiles-message"]');
    const profileCard = page.locator('[data-testid="profile-card"]');
    
    // Test conditionnel selon l'état
    const hasProfiles = await profileCard.count() > 0;
    
    if (!hasProfiles) {
      await expect(noProfilesMessage).toBeVisible();
      await expect(page.locator('text=Aucun nouveau profil')).toBeVisible();
      
      // Bouton pour élargir critères
      await expect(page.locator('[data-testid="expand-criteria-button"]')).toBeVisible();
    } else {
      await expect(profileCard).toBeVisible();
    }
  });
});
