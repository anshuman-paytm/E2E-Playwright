import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly checkoutBtn: Locator;
  readonly newNumberOption: Locator;

  constructor(page: Page) {
    super(page);
    this.newNumberOption = page.getByLabel(/new number|nuevo número/i);
    this.checkoutBtn = page.getByRole('button', { name: /continue|checkout|continuar/i });
  }

  async proceedToCheckout() {
    if (await this.newNumberOption.isVisible()) {
      await this.newNumberOption.check();
    }
    await this.checkoutBtn.waitFor({ state: 'visible' });
    await this.checkoutBtn.click();
  }
}