import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ConfirmationPage extends BasePage {
  readonly confirmationContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationContainer = page.locator('main, section, div').filter({ hasText: /order|orden|confirm/i }).first();
  }

  async verifyOrderPlaced() {
    await this.page.waitForURL(/.*order-confirmation.*/i, { timeout: 35000 });
    await this.waitForPageLoaded();
  }
}