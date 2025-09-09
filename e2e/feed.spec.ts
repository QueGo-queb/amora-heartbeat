import { test, expect } from '@playwright/test';

test.describe('Feed et interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="feed-container"]')).toBeVisible();
  });

  test('Affichage du feed principal', async ({ page }) => {
    // Vérifier que les posts s'affichent
    await expect(page.locator('[data-testid="post-card"]').first()).toBeVisible();
    
    // Vérifier informations post
    const firstPost = page.locator('[data-testid="post-card"]').first();
    await expect(firstPost.locator('[data-testid="post-author"]')).toBeVisible();
    await expect(firstPost.locator('[data-testid="post-content"]')).toBeVisible();
    await expect(firstPost.locator('[data-testid="post-timestamp"]')).toBeVisible();
  });

  test('Création d\'un nouveau post', async ({ page }) => {
    // Ouvrir modal création post
    await page.click('[data-testid="create-post-button"]');
    await expect(page.locator('[data-testid="post-modal"]')).toBeVisible();
    
    // Remplir le contenu
    await page.fill('[data-testid="post-content"]', 'Mon premier post sur AMORA ! 🎉');
    
    // Ajouter des tags
    await page.click('[data-testid="tag-voyage"]');
    await page.click('[data-testid="tag-lifestyle"]');
    
    // Publier
    await page.click('[data-testid="publish-post"]');
    
    // Vérifier que le post apparaît dans le feed
    await expect(page.locator('text=Mon premier post sur AMORA ! 🎉')).toBeVisible();
  });

  test('Interactions avec les posts (like, comment)', async ({ page }) => {
    const firstPost = page.locator('[data-testid="post-card"]').first();
    
    // Test like
    const likeButton = firstPost.locator('[data-testid="like-button"]');
    const initialLikes = await firstPost.locator('[data-testid="likes-count"]').textContent();
    
    await likeButton.click();
    
    // Vérifier que le compteur augmente
    await expect(firstPost.locator('[data-testid="likes-count"]')).not.toContainText(initialLikes || '0');
    await expect(likeButton).toHaveClass(/liked/);
    
    // Test comment
    await firstPost.locator('[data-testid="comment-button"]').click();
    await page.fill('[data-testid="comment-input"]', 'Super post ! 👍');
    await page.click('[data-testid="submit-comment"]');
    
    // Vérifier que le commentaire apparaît
    await expect(page.locator('text=Super post ! 👍')).toBeVisible();
  });

  test('Filtrage du feed', async ({ page }) => {
    // Ouvrir filtres
    await page.click('[data-testid="filters-button"]');
    
    // Appliquer filtre par type de média
    await page.selectOption('[data-testid="media-filter"]', 'image');
    await page.click('[data-testid="apply-filters"]');
    
    // Vérifier que le feed se met à jour
    await page.waitForLoadState('networkidle');
    
    // Vérifier que seuls les posts avec images s'affichent
    const posts = page.locator('[data-testid="post-card"]');
    const postCount = await posts.count();
    
    for (let i = 0; i < postCount; i++) {
      await expect(posts.nth(i).locator('[data-testid="post-image"]')).toBeVisible();
    }
  });

  test('Infinite scroll', async ({ page }) => {
    // Compter les posts initiaux
    const initialPosts = await page.locator('[data-testid="post-card"]').count();
    
    // Scroll vers le bas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Attendre le chargement
    await page.waitForTimeout(2000);
    
    // Vérifier que de nouveaux posts sont chargés
    const newPosts = await page.locator('[data-testid="post-card"]').count();
    expect(newPosts).toBeGreaterThan(initialPosts);
  });
});
