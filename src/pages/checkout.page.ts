import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly continueBtn: Locator;
  readonly cookieAcceptBtn: Locator;

  // Dialog & Verification
  readonly firstDigitInput: Locator;
  readonly validateOtpBtn: Locator;

  // Braintree Payment Iframes & Elements
  readonly cardholderNameFrame: FrameLocator;
  readonly cardNumberFrame: FrameLocator;
  readonly expDateFrame: FrameLocator;
  readonly cvvFrame: FrameLocator;
  readonly payButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByRole('textbox', { name: 'Nombre' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Apellido' });
    this.dobInput = page.getByRole('textbox', { name: 'mm/dd/aaaa' });
    this.emailInput = page.getByRole('textbox', { name: /example\.com/i });
    this.phoneInput = page.getByRole('textbox', { name: /example: \(787\)/i });
    this.continueBtn = page.getByRole('button', { name: 'Continuar' });
    this.cookieAcceptBtn = page.locator('button').filter({ hasText: 'Aceptar todo' });

    // OTP Modal elements
    this.firstDigitInput = page.locator('#input-code-0-input-0, input[id*="input-code-0"]').first();
    this.validateOtpBtn = page.getByRole('button', { name: 'Validar' });

    // Braintree Hosted Field Iframes
    this.cardholderNameFrame = page.frameLocator('iframe[name="braintree-hosted-field-cardholderName"]');
    this.cardNumberFrame = page.frameLocator('iframe[name="braintree-hosted-field-number"]');
    this.expDateFrame = page.frameLocator('iframe[name="braintree-hosted-field-expirationDate"]');
    this.cvvFrame = page.frameLocator('iframe[name="braintree-hosted-field-cvv"]');
    this.payButton = page.getByRole('button', { name: /Pagar \$/i });
  }

  async fillCustomerDetails(details: {
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    phone: string;
  }) {
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 20000 });
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.dobInput.fill(details.dob);
    await this.emailInput.fill(details.email);
    await this.phoneInput.fill(details.phone);
  }

  async submitFormAndEnterDynamicOtp(): Promise<string> {
    let capturedOtp = '';

    const responseHandler = async (response: any) => {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const body = await response.json();
          if (body && body.otp) {
            capturedOtp = String(body.otp);
            console.log(`[Captured Dynamic OTP]: ${capturedOtp}`);
          }
        }
      } catch {}
    };

    this.page.on('response', responseHandler);

    // 1. Click Continuar to fire the OTP API
    await this.continueBtn.scrollIntoViewIfNeeded();
    await this.continueBtn.click({ force: true });

    // 2. Cookie banner check
    try {
      if (await this.cookieAcceptBtn.isVisible({ timeout: 2000 })) {
        await this.cookieAcceptBtn.click();
      }
    } catch {}

    // 3. Wait for OTP modal input
    await this.firstDigitInput.waitFor({ state: 'visible', timeout: 25000 });

    // 4. Poll for the captured OTP
    const startTime = Date.now();
    while (!capturedOtp && Date.now() - startTime < 15000) {
      await this.page.waitForTimeout(200);
    }
    this.page.off('response', responseHandler);

    if (!capturedOtp) {
      throw new Error('Failed to intercept OTP from network response payload.');
    }

    // 5. Fill OTP digits
    const digits = capturedOtp.split('');
    for (let i = 0; i < digits.length; i++) {
      const input = this.page.locator(`#input-code-0-input-${i}`);
      if (await input.isVisible()) {
        await input.click();
        await input.pressSequentially(digits[i], { delay: 100 });
      }
    }

    // 6. Submit OTP verification
    await this.validateOtpBtn.waitFor({ state: 'visible' });
    await expect(this.validateOtpBtn).toBeEnabled({ timeout: 10000 });
    await this.validateOtpBtn.click();

    return capturedOtp;
  }

  async fillPaymentDetailsAndPay(payment: {
    cardholderName: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  }) {
    // Wait for the navigation to the payment screen
    await this.page.waitForURL(/.*payment-tnc.*/i, { timeout: 35000 });

    // 1. Cardholder Name
    const nameInput = this.cardholderNameFrame.getByRole('textbox', { name: 'Cardholder Name' });
    await nameInput.waitFor({ state: 'visible', timeout: 20000 });
    await nameInput.click();
    await nameInput.fill(payment.cardholderName);

    // 2. Credit Card Number
    const numberInput = this.cardNumberFrame.getByRole('textbox', { name: 'Credit Card Number' });
    await numberInput.click();
    await numberInput.fill(payment.cardNumber);

    // 3. Expiration Date
    const expInput = this.expDateFrame.getByRole('textbox', { name: 'Expiration Date' });
    await expInput.click();
    await expInput.fill(payment.expirationDate);

    // 4. CVV
    const cvvInput = this.cvvFrame.getByRole('textbox', { name: 'CVV' });
    await cvvInput.click();
    await cvvInput.fill(payment.cvv);

    // 5. Pay button
    await this.payButton.scrollIntoViewIfNeeded();
    await expect(this.payButton).toBeEnabled({ timeout: 10000 });
    await this.payButton.click();
  }
}
  
  // TODO: Add confirmation page assertions