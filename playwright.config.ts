import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    // Setup authentification une fois
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Tests de base sur Desktop Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e/auth/user.json'
      },
      dependencies: ['setup'],
    },
    
    // Tests mobiles critiques
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'e2e/auth/user.json'
      },
      dependencies: ['setup'],
    },
    
    // Tests cross-browser
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e/auth/user.json'
      },
      dependencies: ['setup'],
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e/auth/user.json'
      },
      dependencies: ['setup'],
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
