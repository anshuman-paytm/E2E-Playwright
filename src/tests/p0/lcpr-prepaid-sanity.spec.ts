import { test, expect } from '@playwright/test';
import { PrepaidPage } from '../../pages/prepaid.page';

test.describe('LCPR Prepaid Journey - Smoke Suite', () => {
  test('TC-P0-01: Access UAT2 Prepaid environment @p0', async ({ page }) => {
    const prepaidPage = new PrepaidPage(page);

    await prepaidPage.openPrepaidLanding();

    // Verify page loads without network failure
    await expect(page).toHaveURL(/.*libertypr.*/i);
  });
});
