import { test, expect } from '@playwright/test';
import { PrepaidPage } from '../../pages/prepaid.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { ConfirmationPage } from '../../pages/confirmation.page';

test.describe('LCPR Prepaid E2E Checkout Flow', () => {
  // End-to-end journey budget: 2 minutes
  test.setTimeout(120000);

  test('TC-P0-01: End-to-end happy path prepaid SIM purchase with valid test payment @p0', async ({ page }) => {
    const prepaidPage = new PrepaidPage(page);
    const checkoutPage = new CheckoutPage(page);
    const confirmationPage = new ConfirmationPage(page);

    // 1. Catalog Navigation: Spanish Menu -> Mobile -> Prepaid Plans
    await prepaidPage.navigateToPrepaidPlans();
    await prepaidPage.startPrepaidCheckout();

    // 2. Customer Lead Capture Form
    await checkoutPage.fillCustomerDetails({
      firstName: 'Janhvi',
      lastName: 'Tester',
      dob: '09/23/2004',
      email: 'janhvi1.dikhit@example.com',
      phone: '(787)878-7878',
    });

    // 3. Dynamic OTP Interception & Verification
    const capturedOtp = await checkoutPage.submitFormAndEnterDynamicOtp();
    expect(capturedOtp).toHaveLength(5);

    // 4. Braintree Payment Processing
    await checkoutPage.fillPaymentDetailsAndPay({
      cardholderName: 'Janhvi Tester',
      cardNumber: '4111111111111111',
      expirationDate: '12/28',
      cvv: '123',
    });

    // 5. Order Confirmation Assertion
    await confirmationPage.verifyOrderPlaced();
    await expect(page).toHaveURL(/.*order-confirmation.*/i);
  });
});