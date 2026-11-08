import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class PrepaidPage extends BasePage {
  readonly movilMenu: Locator;
  readonly planesMovilesMenu: Locator;
  readonly planesPrepagoLink: Locator;
  readonly callUsBtn: Locator;
  readonly cookieAcceptBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.cookieAcceptBtn = page.locator('button').filter({ hasText: 'Aceptar todo' });
    this.movilMenu = page.locator('a').filter({ hasText: 'MóvilChevron Down' });
    this.planesMovilesMenu = page.locator('a').filter({ hasText: 'CellularPlanes MóvilesChevron' });
    this.planesPrepagoLink = page.getByRole('link', { name: 'Planes de Prepago' });
    this.callUsBtn = page.getByRole('button', { name: 'Llámanos' }).first();
  }

  async dismissCookieBanner() {
    try {
      if (await this.cookieAcceptBtn.isVisible({ timeout: 4000 })) {
        await this.cookieAcceptBtn.click();
      }
    } catch {
      // Cookie banner already dismissed or not present
    }
  }

  async navigateToPrepaidPlans() {
    await this.navigateTo('/es/');
    await this.dismissCookieBanner();

    await this.movilMenu.click();
    await this.planesMovilesMenu.click();
    await this.planesPrepagoLink.click();
    await this.waitForPageLoaded();
    await this.dismissCookieBanner();
  }

  async startPrepaidCheckout() {
    await this.callUsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await this.callUsBtn.scrollIntoViewIfNeeded();
    await this.callUsBtn.click();
  }
}