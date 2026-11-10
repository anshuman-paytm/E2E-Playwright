# LCPR Prepaid Journey Automation Strategy & Test Scope

**Environment:** UAT2 `https://fluat2.libertypr.lla.digital/es/`)  

**Target Flow:** Prepaid Mobile Online Purchasing & Checkout Journey  

**Framework:** Playwright + TypeScript (Page Object Model)  

---

## 1. Test Priority Matrix

| Test Case ID | Scope | Priority | Description | Key Validations |

| :--- | :--- | :--- | :--- | :--- |

| **TC-P0-01** | E2E Purchase | **P0** | Happy Path: Prepaid **eSIM** purchase with valid test payment | Catalog nav, eSIM option, dynamic OTP capture, Braintree iframes, order confirmation |

| **TC-P0-02** | E2E Purchase | **P0** | Happy Path: Prepaid **Physical SIM** purchase with valid test payment | Physical SIM selection, shipping address handling, dynamic OTP, Braintree iframes, confirmation |

| **TC-P0-03** | E2E Purchase | **P0** | Happy Path: Prepaid bundle with **Device + Port-In** | Device selection, port-in fields (current MDN, previous carrier, account #, transfer PIN), OTP, payment |

| **TC-P0-04** | E2E Purchase | **P0** | Happy Path: Prepaid bundle with **Device + New Line / Port-Out** | Device selection, new number line configuration, dynamic OTP, payment completion |

| **TC-P1-01** | Validation | **P1** | Customer lead form validation & error boundaries | Invalid email regex, incomplete phone number, age/DOB validation, blocked submission |

| **TC-P1-02** | Security / Auth | **P1** | Invalid OTP handling | Incorrect 5-digit OTP, verification failure, error class highlight `--error`), dialog persistence |

| **TC-P1-03** | Payment Gateway | **P1** | Payment failure & declined card handling | Expired/declined test card numbers, gateway rejection message, payment retry |

---

## 2. End-to-End Journey Steps (Detailed)

### Step 1: Catalog Navigation

* Navigate to base URL: `/es/`

* Handle & dismiss initial cookie consent banner `Aceptar todo`).

* Open mobile menu: `Móvil` -> `CellularPlanes Móviles` -> `Planes de Prepago`.

* Click `Llámanos` on the desired prepaid plan to open customer registration.

### Step 2: Customer Lead Capture & Product Configuration

* **Common Details:** First Name `Nombre`), Last Name `Apellido`), DOB `mm/dd/aaaa`), Email, Contact Phone `(787)xxx-xxxx`).

* **Line & Fulfillment Variations:**

  * **TC-P0-01:** Select `eSIM` radio option.

  * **TC-P0-02:** Select `SIM Física` radio option (+ physical delivery address if prompted).

  * **TC-P0-03:** Select `Port-in / Transferir mi número` -> Supply previous carrier, current phone number, account number, transfer PIN.

  * **TC-P0-04:** Select `Nuevo número` -> Select new number assignment option.

* Click `Continuar` (handling Angular background loader intercepts: `lla-loader-container`).

### Step 3: Dynamic OTP Interception & Verification

* Modal `#mat-mdc-dialog-0` or `[role="dialog"]` opens.

* Playwright network response listener intercepts the OTP generation endpoint.

* Parse JSON payload in real-time to extract `responseBody.otp` (5 digits).

* Use `pressSequentially()` with keystroke delays into digit fields `#input-code-0-input-0` through `4`) to fire Angular change detection.

* Click `Validar` once enabled.

### Step 4: Secure Payment Gateway (Braintree Hosted Fields)

* Automated transition to `/checkout/mobile/payment-tnc`.

* Target Braintree nested `<iframe>` structures:

  * `iframe[name="braintree-hosted-field-cardholderName"]` -> Cardholder Name

  * `iframe[name="braintree-hosted-field-number"]` -> Credit Card Number (e.g. `4111 1111 1111 1111`)

  * `iframe[name="braintree-hosted-field-expirationDate"]` -> Expiration Date (e.g. `12/28`)

  * `iframe[name="braintree-hosted-field-cvv"]` -> CVV (e.g. `123`)

* Click `Pagar $...`.

### Step 5: Order Confirmation

* Navigate to `/checkout/mobile/order-confirmation`.

* Assert order confirmation header, order reference ID, or success status.

---

## 3. Automation Architecture & Design Rules

* **Page Object Model (POM):**

  * `BasePage.ts`: Shared utilities, cookie handler, network/loader waits.

  * `PrepaidPage.ts`: Catalog menu navigation and plan selection.

  * `CheckoutPage.ts`: Lead form, dynamic OTP interception, and Braintree iframes.

  * `ConfirmationPage.ts`: URL and confirmation container assertions.

* **Resilience Guidelines:**

  * Use multi-attribute selectors `.or()`) across Spanish/English placeholders.

  * Bypass Angular overlay pointer intercepts using `{ force: true }` or waiting on `<lla-loader-container>`.

  * Type codes using `pressSequentially()` instead of static `.fill()` to trigger reactive Angular form validation.

  

