import { test, expect } from '@playwright/test'

// End-to-end smoke test for the daily check-in flow, run in demo mode (no Supabase
// needed). Run with: npx playwright install && npx playwright test
test('home shows mission identity and today check-in saves a goal status', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('RECLAIM 122')).toBeVisible()

  await page.getByRole('link', { name: /check in|continue today/i }).click()
  await expect(page).toHaveURL(/\/today/)

  await page.getByRole('button', { name: 'Porn-free', exact: true }).click()
  await page.getByRole('button', { name: 'Workout done' }).click()
  await page.getByRole('button', { name: 'Done', exact: true }).first().click()

  await page.getByRole('button', { name: /save day/i }).click()
  await expect(page.getByText(/saved/i)).toBeVisible()
})
