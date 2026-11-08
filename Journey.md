# LCPR Prepaid Journey & Automation Architecture

## 1. Journey Breakdown (LCPR Prepaid Checkout)
Target URL: https://fluat2.libertypr.lla.digital/

The automated prepaid checkout flow comprises the following end-to-end stages:
1. **Catalog & Plan Selection:** Navigate to the Prepaid section, view available prepaid plans/SIM options, and add an active tier to the shopping cart.
2. **Cart & Line Assignment:** Access the cart, verify line item pricing, and select either "New Number" or "Port-in".
3. **Customer Details:** Fill out customer identification (Name, Email, Phone) and Puerto Rico service/billing address.
4. **Checkout & Payment:** Select payment method, enter billing/credit card details, and submit order.
5. **Confirmation:** Validate order placement and reference order number generation.

---

## 2. Test Identification & Scope (P0 / P1)

### P0 (Critical Path / Smoke)
- **TC-P0-01:** End-to-end happy path prepaid SIM purchase with valid test payment.
- **TC-P0-02:** Cart price, regulatory fees, and tax validation prior to payment.

### P1 (Functional Edge Scenarios)
- **TC-P1-01:** Address validation failure on non-PR or invalid ZIP code.
- **TC-P1-02:** Payment failure / declined card handling on checkout.
- **TC-P1-03:** Step navigation and state preservation when clicking back.

---

## 3. Automation Architecture Design
- **Runtime Isolation:** Isolated inside monorepo under `/e2e`, with independent `package.json` and `tsconfig.json`.
- **Design Pattern:** Page Object Model (POM) separating UI locators and user actions from test specifications.
- **Reporting:** Built-in Playwright HTML reporter capturing screenshots, DOM snapshots, and traces on failure.