# AI Expense Tracker Pro — Comprehensive Bubble.io App Builder Prompt

> **Purpose:** This document is a complete, step-by-step prompt for building the AI Expense Tracker Pro application in [Bubble.io](https://bubble.io). It covers every data type, page, workflow, API integration, plugin, and style setting required to produce a production-ready, fully functional application.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Data Types](#2-data-types)
3. [Privacy Rules](#3-privacy-rules)
4. [Page Map](#4-page-map)
5. [Authentication & Onboarding Pages](#5-authentication--onboarding-pages)
6. [Dashboard Page](#6-dashboard-page)
7. [Transactions Page](#7-transactions-page)
8. [Budgets Page](#8-budgets-page)
9. [Investments Page](#9-investments-page)
10. [Receipt Scanner Page](#10-receipt-scanner-page)
11. [AI Insights Page](#11-ai-insights-page)
12. [Settings Page](#12-settings-page)
13. [Admin Panel Page](#13-admin-panel-page)
14. [Reusable Elements & Components](#14-reusable-elements--components)
15. [API Connector Configuration](#15-api-connector-configuration)
16. [Plugin List](#16-plugin-list)
17. [Workflows — Global & Backend](#17-workflows--global--backend)
18. [Styles & Design System](#18-styles--design-system)
19. [Responsive Breakpoints](#19-responsive-breakpoints)
20. [Performance Settings](#20-performance-settings)
21. [Security Settings](#21-security-settings)
22. [SEO & Metadata](#22-seo--metadata)
23. [Deployment Checklist](#23-deployment-checklist)

---

## 1. App Overview

### 1.1 Application Name
**AI Expense Tracker Pro**

### 1.2 Purpose
A multi-user, AI-powered personal and business finance management platform that enables users to:
- Track income and expenses across multiple categories and currencies
- Scan receipts using OCR to automatically extract transaction data
- Receive AI-generated spending insights and budget recommendations
- Track investments and projected returns
- Export financial reports in multiple formats
- Manage multiple team workspaces (multi-tenancy)

### 1.3 Target Users
| User Role | Description |
|---|---|
| Individual | Personal finance tracking |
| Business Owner | Business expense and revenue tracking |
| Accountant | Reviewing and exporting reports for clients |
| Admin | Platform-level user and subscription management |

### 1.4 Bubble.io Plan Required
**Production** plan or higher (required for custom domains, API connections, background workflows, file storage >2 GB, and enhanced server capacity).

---

## 2. Data Types

Create each data type exactly as described. Field names are case-sensitive.

---

### 2.1 User *(extends Bubble's built-in User type)*

Add the following custom fields to the built-in `User` type:

| Field Name | Type | Notes |
|---|---|---|
| `display_name` | text | User's full display name |
| `avatar_url` | image | Profile picture |
| `phone_number` | text | E.164 format (e.g. +14155552671) |
| `currency_preference` | text | ISO 4217 code, default `USD` |
| `timezone` | text | IANA timezone string, default `UTC` |
| `subscription_plan` | text | `free` / `pro` / `business` |
| `subscription_status` | text | `active` / `cancelled` / `past_due` |
| `stripe_customer_id` | text | Private — Stripe customer ID |
| `stripe_subscription_id` | text | Private |
| `two_factor_enabled` | yes/no | Default `no` |
| `two_factor_secret` | text | Private — TOTP secret (store encrypted) |
| `is_email_verified` | yes/no | Default `no` |
| `email_verification_token` | text | Private |
| `email_verification_expires` | date | Private |
| `reset_password_token` | text | Private |
| `reset_password_expires` | date | Private |
| `failed_login_attempts` | number | Default 0 |
| `locked_until` | date | Account lockout expiry |
| `last_login_at` | date | |
| `role` | text | `user` / `accountant` / `admin` |
| `current_workspace` | Workspace | Pointer to active workspace |
| `onboarding_complete` | yes/no | Default `no` |
| `notification_preferences` | text | JSON blob |
| `language` | text | BCP-47 code, default `en` |
| `created_at` | date | Auto-populated |

---

### 2.2 Workspace

| Field Name | Type | Notes |
|---|---|---|
| `name` | text | Workspace/company name |
| `owner` | User | Workspace creator |
| `members` | list of User | All members including owner |
| `member_roles` | list of text | Parallel list: role per member |
| `plan` | text | `free` / `pro` / `business` |
| `logo_url` | image | |
| `currency` | text | Default workspace currency |
| `fiscal_year_start` | number | Month number (1–12) |
| `created_at` | date | |

---

### 2.3 Category

| Field Name | Type | Notes |
|---|---|---|
| `name` | text | e.g. "Groceries" |
| `icon` | text | Emoji or icon class name |
| `color` | text | Hex color code |
| `type` | text | `income` / `expense` |
| `is_system` | yes/no | System-defined vs user-defined |
| `owner` | User | `empty` for system categories |
| `workspace` | Workspace | Workspace scope |
| `parent_category` | Category | Optional — for subcategories |
| `created_at` | date | |

---

### 2.4 Transaction

| Field Name | Type | Notes |
|---|---|---|
| `title` | text | Short description |
| `amount` | number | Stored in smallest currency unit (cents) |
| `currency` | text | ISO 4217 |
| `amount_usd` | number | Converted amount in USD for aggregations |
| `type` | text | `income` / `expense` / `transfer` |
| `category` | Category | |
| `tags` | list of text | User-defined tags |
| `date` | date | Transaction date |
| `notes` | text | Optional free-text notes |
| `receipt_image` | image | Uploaded receipt image |
| `receipt_url` | text | Trusted-domain URL for receipt |
| `merchant_name` | text | Extracted from OCR or entered manually |
| `is_recurring` | yes/no | Default `no` |
| `recurrence_rule` | text | iCal RRULE string |
| `payment_method` | text | `cash` / `card` / `bank_transfer` / `other` |
| `account` | Account | Optional linked financial account |
| `is_split` | yes/no | Split transaction flag |
| `split_group` | text | UUID linking split siblings |
| `attachments` | list of file | Supporting documents |
| `created_by` | User | |
| `workspace` | Workspace | |
| `ai_category_suggestion` | text | AI engine suggestion |
| `ai_confidence` | number | 0–1 confidence score |
| `created_at` | date | |
| `updated_at` | date | |

---

### 2.5 Account *(Financial Account)*

| Field Name | Type | Notes |
|---|---|---|
| `name` | text | e.g. "Chase Checking" |
| `type` | text | `checking` / `savings` / `credit_card` / `investment` / `cash` / `other` |
| `institution_name` | text | Bank or institution |
| `currency` | text | ISO 4217 |
| `current_balance` | number | In smallest currency unit |
| `opening_balance` | number | |
| `color` | text | Hex for UI display |
| `icon` | text | |
| `is_default` | yes/no | |
| `owner` | User | |
| `workspace` | Workspace | |
| `created_at` | date | |

---

### 2.6 Budget

| Field Name | Type | Notes |
|---|---|---|
| `name` | text | e.g. "Monthly Groceries" |
| `category` | Category | |
| `amount_limit` | number | Monthly limit in user's currency |
| `currency` | text | |
| `period` | text | `monthly` / `weekly` / `yearly` |
| `year` | number | e.g. 2026 |
| `month` | number | 1–12 (for monthly budgets) |
| `week_number` | number | ISO week number (for weekly budgets) |
| `alert_threshold` | number | 0–100 — percentage at which to alert |
| `alert_sent` | yes/no | Prevent duplicate alerts |
| `owner` | User | |
| `workspace` | Workspace | |
| `created_at` | date | |

---

### 2.7 Investment

| Field Name | Type | Notes |
|---|---|---|
| `name` | text | e.g. "Apple Inc." |
| `symbol` | text | Ticker symbol e.g. `AAPL` |
| `type` | text | `stock` / `etf` / `bond` / `crypto` / `real_estate` / `other` |
| `quantity` | number | Number of units held |
| `purchase_price` | number | Per-unit purchase price |
| `current_price` | number | Latest fetched price |
| `currency` | text | |
| `purchase_date` | date | |
| `notes` | text | |
| `owner` | User | |
| `workspace` | Workspace | |
| `last_price_update` | date | |
| `created_at` | date | |

---

### 2.8 Insight *(AI-Generated)*

| Field Name | Type | Notes |
|---|---|---|
| `title` | text | Short insight title |
| `body` | text | Full insight text |
| `type` | text | `saving_tip` / `overspend_alert` / `forecast` / `anomaly` |
| `severity` | text | `info` / `warning` / `critical` |
| `related_category` | Category | Optional |
| `related_budget` | Budget | Optional |
| `is_read` | yes/no | Default `no` |
| `action_url` | text | Deep link within the app |
| `owner` | User | |
| `workspace` | Workspace | |
| `generated_at` | date | |
| `expires_at` | date | |

---

### 2.9 RecurringTransaction

| Field Name | Type | Notes |
|---|---|---|
| `template` | Transaction | Source transaction template |
| `rule` | text | iCal RRULE string |
| `next_occurrence` | date | |
| `last_executed` | date | |
| `is_active` | yes/no | Default `yes` |
| `owner` | User | |
| `workspace` | Workspace | |

---

### 2.10 ExportJob

| Field Name | Type | Notes |
|---|---|---|
| `format` | text | `csv` / `pdf` / `excel` / `json` |
| `status` | text | `pending` / `processing` / `complete` / `failed` |
| `date_from` | date | Filter start |
| `date_to` | date | Filter end |
| `file_url` | text | Download URL |
| `requested_by` | User | |
| `workspace` | Workspace | |
| `requested_at` | date | |
| `completed_at` | date | |

---

### 2.11 Notification

| Field Name | Type | Notes |
|---|---|---|
| `title` | text | |
| `body` | text | |
| `type` | text | `budget_alert` / `insight` / `system` / `payment` |
| `is_read` | yes/no | Default `no` |
| `action_url` | text | |
| `recipient` | User | |
| `created_at` | date | |

---

### 2.12 AuditLog

| Field Name | Type | Notes |
|---|---|---|
| `action` | text | e.g. `transaction.created` |
| `entity_type` | text | e.g. `Transaction` |
| `entity_id` | text | Bubble unique ID of the affected record |
| `performed_by` | User | |
| `workspace` | Workspace | |
| `ip_address` | text | |
| `metadata` | text | JSON blob with before/after values |
| `created_at` | date | |

---

## 3. Privacy Rules

Configure privacy rules in **Data > Privacy**. These rules are enforced server-side on every API and database call.

### 3.1 User

| Rule | Condition | Allowed Fields |
|---|---|---|
| Own record | `This User is Current User` | All fields except `two_factor_secret`, `stripe_customer_id`, `stripe_subscription_id`, `reset_password_token`, `email_verification_token` |
| Admin view | `Current User's role = "admin"` | All fields except `two_factor_secret` |
| Other users | — | `display_name`, `avatar_url` only |

### 3.2 Transaction, Budget, Account, Investment, Insight

| Rule | Condition | Access |
|---|---|---|
| Workspace member | `Current User is in This Transaction's workspace's members` | Full read/write |
| Non-member | — | No access |

### 3.3 Workspace

| Rule | Condition | Access |
|---|---|---|
| Owner | `This Workspace's owner is Current User` | Full |
| Member | `Current User is in This Workspace's members` | Read name, plan, currency; no sensitive fields |

### 3.4 AuditLog

| Rule | Condition | Access |
|---|---|---|
| Admin only | `Current User's role = "admin"` | Read only |
| Owner in workspace | `This AuditLog's workspace's owner is Current User` | Read only |

---

## 4. Page Map

| Page Slug | Description | Auth Required |
|---|---|---|
| `/` | Landing / marketing page | No |
| `/login` | Sign-in page | No (redirect if logged in) |
| `/signup` | Registration page | No (redirect if logged in) |
| `/verify-email` | Email verification landing | No |
| `/forgot-password` | Password reset request | No |
| `/reset-password` | Password reset form | No |
| `/onboarding` | First-run setup wizard | Yes |
| `/dashboard` | Main dashboard | Yes |
| `/transactions` | Transaction list & filters | Yes |
| `/transactions/new` | Add transaction | Yes |
| `/transactions/:id` | Transaction detail/edit | Yes |
| `/budgets` | Budget management | Yes |
| `/investments` | Investment portfolio | Yes |
| `/scanner` | Receipt OCR scanner | Yes |
| `/insights` | AI insights feed | Yes |
| `/reports` | Financial reports & exports | Yes |
| `/settings` | User & workspace settings | Yes |
| `/admin` | Admin panel | Yes + `role = admin` |
| `/404` | Not found | No |

---

## 5. Authentication & Onboarding Pages

### 5.1 `/signup` — Registration Page

**Layout:** Centered card on a gradient background (#1a1a2e → #16213e).

**Elements:**
- App logo (image, centered, 80×80 px)
- Heading: "Create your account" (H1, white)
- Input: Email address (type `email`, placeholder "you@example.com")
- Input: Full name (type `text`)
- Input: Password (type `password`, minimum 8 chars, 1 uppercase, 1 number, 1 symbol — enforce via conditional formatting on submit)
- Input: Confirm password (type `password`)
- Dropdown: Select your currency (list of ISO 4217 currency codes, default `USD`)
- Checkbox: "I agree to the Terms of Service and Privacy Policy" (must be checked to proceed)
- Button: "Create Account" (primary blue, full-width)
- Divider: "or continue with"
- Button: "Sign up with Google" (OAuth)
- Link: "Already have an account? Sign in"

**Workflow — "Create Account" button click:**
1. Validate all inputs (show inline errors if invalid)
2. Check password matches confirm password (show error if not)
3. Check checkbox is ticked (show error if not)
4. Call Bubble Sign the user up (email, password, display_name, currency_preference)
5. Generate a random 64-char token → set `email_verification_token`
6. Set `email_verification_expires` = Current date/time + 24 hours
7. Set `is_email_verified = no`
8. Set `role = "user"`, `subscription_plan = "free"`, `subscription_status = "active"`
9. Set `failed_login_attempts = 0`
10. Send email "Verify your email" using SendGrid (see API section) with the verification link: `https://[your-domain]/verify-email?token=[token]&email=[email]`
11. Create a default Workspace: name = user's display_name + "'s Workspace", owner = current user, members = [current user], currency = user's currency_preference
12. Set user's `current_workspace` = new workspace
13. Create default system Categories for the new workspace (call a backend workflow: `CreateSystemCategories`)
14. Navigate to `/onboarding`

**Workflow — "Sign up with Google":**
1. Use Bubble's built-in Google OAuth plugin
2. On success, if user is new: run same workspace and category creation steps above
3. Set `is_email_verified = yes` (Google accounts are pre-verified)
4. Navigate to `/onboarding` if onboarding_complete = no, else `/dashboard`

---

### 5.2 `/login` — Sign-in Page

**Layout:** Same centered card as signup.

**Elements:**
- App logo
- Heading: "Welcome back" (H1)
- Input: Email address
- Input: Password
- Link: "Forgot password?"
- Button: "Sign In" (primary, full-width)
- Divider: "or"
- Button: "Sign in with Google"
- Link: "Don't have an account? Sign up"

**Workflow — "Sign In" button click:**
1. Check if user with this email has `locked_until` > Current date/time → show error "Account locked. Try again after [locked_until]"
2. Call Bubble Log the user in (email, password)
3. On failure:
   - Increment `failed_login_attempts` by 1
   - If `failed_login_attempts` ≥ 5: set `locked_until` = Current date/time + 15 minutes; show lockout message
   - Else: show "Invalid email or password"
4. On success:
   - Reset `failed_login_attempts = 0`, clear `locked_until`
   - Set `last_login_at` = Current date/time
   - Create AuditLog: action = `user.login`, entity_type = `User`
   - If `two_factor_enabled = yes`: navigate to `/2fa-verify` (inline popup or separate page)
   - Else if `is_email_verified = no`: show banner "Please verify your email"
   - Else if `onboarding_complete = no`: navigate to `/onboarding`
   - Else: navigate to `/dashboard`

---

### 5.3 `/verify-email` — Email Verification

**Workflow on page load:**
1. Read URL parameter `token` and `email`
2. Search for User where `email = param_email` AND `email_verification_token = param_token` AND `email_verification_expires > Current date/time`
3. If found: set `is_email_verified = yes`, clear `email_verification_token` and `email_verification_expires`; show success message; navigate to `/dashboard` after 3 seconds
4. If not found or expired: show error with a "Resend verification email" button

---

### 5.4 `/forgot-password` & `/reset-password`

**Forgot Password Workflow:**
1. User enters email
2. Search for User with that email
3. If found: generate 64-char token, set `reset_password_token`, set `reset_password_expires` = now + 1 hour
4. Send reset email via SendGrid with link: `https://[domain]/reset-password?token=[token]`
5. Always show "If an account exists, a reset email has been sent" (prevent email enumeration)

**Reset Password Workflow:**
1. On page load: validate token from URL parameter
2. Show form: new password + confirm password
3. On submit: validate token still valid, update password, clear `reset_password_token` and `reset_password_expires`
4. Log all previous sessions out (if using session management)
5. Show success; navigate to `/login`

---

### 5.5 `/onboarding` — First-Run Wizard

**Multi-step wizard (4 steps):**

**Step 1 — Profile Setup**
- Upload avatar (image uploader)
- Confirm display name
- Phone number (optional)
- Timezone (dropdown of IANA timezones)
- Language (dropdown: English, Spanish, French, German, Arabic, Portuguese)

**Step 2 — Financial Setup**
- Preferred currency (dropdown)
- Fiscal year start month (dropdown 1–12)
- Create first Account (name, type, opening balance) — optional, with "Skip" button
- Create first 3 categories if desired (pre-populated suggestions available)

**Step 3 — Subscription**
- Show plan comparison table: Free / Pro / Business
- Free plan: up to 50 transactions/month, 1 workspace, basic insights
- Pro plan ($9.99/month): unlimited transactions, 3 workspaces, AI insights, receipt scanning
- Business plan ($29.99/month): unlimited everything, multi-user workspaces, exports, priority support
- "Choose Free" / "Choose Pro" / "Choose Business" buttons
- On Pro/Business selection: Stripe checkout popup (use Stripe plugin)

**Step 4 — Notifications**
- Email notifications (toggle): budget alerts, weekly summary, AI insights
- In-app notifications (toggle): all types
- "Finish Setup" button

**Finish Workflow:**
1. Save all preferences to User record
2. Set `onboarding_complete = yes`
3. Navigate to `/dashboard`

---

## 6. Dashboard Page

### 6.1 Layout

Top navigation bar + left sidebar (desktop) / bottom tab bar (mobile).

### 6.2 Header / Navigation Bar

- App logo + workspace name (clickable dropdown to switch workspaces)
- Global search (⌘K shortcut opens modal)
- Notifications bell (red badge with unread count)
- User avatar (dropdown: Profile, Settings, Sign out)
- Dark/light mode toggle

### 6.3 Left Sidebar (desktop only)

Navigation links with icons:
- Dashboard (home icon)
- Transactions
- Budgets
- Investments
- Receipt Scanner
- AI Insights
- Reports
- Settings
- Admin (visible only if `role = "admin"`)

### 6.4 Main Dashboard Content

**Row 1 — Summary Cards (4 cards in a row)**

| Card | Data Source |
|---|---|
| Total Income (this month) | Sum of Transactions where type=income, date within current month, workspace = current |
| Total Expenses (this month) | Sum of Transactions where type=expense, date within current month |
| Net Balance | Income − Expenses |
| Savings Rate | (Net / Income) × 100% |

Each card shows: large number in user's currency, percentage change vs previous month (green if positive, red if negative), sparkline mini-chart.

**Row 2 — Charts**

Left chart (60% width): **Monthly Cash Flow** — grouped bar chart (income vs expense) for the last 6 months. Use Bubble's Chart.js plugin.

Right chart (40% width): **Spending by Category** — doughnut chart. Top 6 categories by amount, "Other" bucket for remainder. Use Chart.js plugin.

**Row 3 — Recent Transactions + Budget Health**

Left (60%): Recent Transactions list — show last 10 transactions. Each row:
- Category icon + color dot
- Transaction title + merchant name
- Date (relative: "2 hours ago")
- Amount (red for expense, green for income)
- Click navigates to `/transactions/:id`
- "View all" link → `/transactions`

Right (40%): Budget Health — list of all active budgets for current month. Each row:
- Budget name + category icon
- Progress bar (used/limit, color: green < 70%, yellow 70–90%, red > 90%)
- Amount spent / Amount limit
- Alert icon if over budget

**Row 4 — AI Insights Preview**

Horizontal scrollable card row. Show latest 3 unread Insights. Each card:
- Insight type icon (lightbulb / warning / trend / star)
- Severity badge
- Title + first 100 chars of body (truncated)
- "Read more" → navigates to `/insights`
- Mark as read button (✓)

**Row 5 — Investments Summary**

- Total portfolio value (sum of `quantity * current_price` for all investments)
- Total gain/loss (sum of `(current_price - purchase_price) * quantity`)
- Gain/loss percentage
- Mini portfolio allocation bar chart
- "View portfolio" link → `/investments`

---

### 6.5 Dashboard Workflows

**On Page Load:**
1. Redirect to `/login` if user is not logged in
2. Redirect to `/onboarding` if `onboarding_complete = no`
3. Load dashboard data (all summary queries are done via Bubble's built-in database queries — no external API needed for aggregations)
4. Call backend workflow `RefreshInvestmentPrices` if `last_price_update` > 1 hour ago (debounced)
5. Call backend workflow `GenerateInsights` if no insights created in last 24 hours
6. Mark notifications with `type = "system"` that are > 30 days old as read (cleanup)

**Real-time updates:**
Use Bubble's built-in real-time data binding — all repeating groups and summary cards automatically update when underlying data changes (no manual Socket.io needed in Bubble).

---

## 7. Transactions Page

### 7.1 Filter Bar

- Date range picker (from/to) with presets: Today, This Week, This Month, Last Month, This Quarter, This Year, Custom
- Category multi-select dropdown
- Type toggle: All / Income / Expense / Transfer
- Account dropdown (All accounts or specific)
- Amount range slider (min/max)
- Search box (searches title, merchant_name, notes, tags)
- Sort: Date (newest first default) / Amount / Category / Merchant
- "Add Transaction" button (primary, top right)
- "Export" button (secondary) → triggers ExportJob creation

### 7.2 Transactions Table / List

**Desktop:** Sortable table with columns:
- Checkbox (bulk select)
- Date
- Title + Merchant
- Category (icon + name)
- Account
- Tags (chips)
- Payment Method icon
- Amount (formatted in user's currency, color-coded)
- Actions: Edit (pencil) / Delete (trash) / Duplicate

**Mobile:** Card list view with swipe-left-to-delete, swipe-right-to-duplicate gestures.

**Bulk Actions toolbar** (appears when items are selected):
- Delete selected
- Recategorize selected (choose new category)
- Export selected
- Add tag to selected

**Pagination:** 20 per page, with "Load more" button and total count shown.

### 7.3 Add/Edit Transaction Modal

Slide-in panel from the right (not a separate page).

**Fields:**
- Type toggle: Income / Expense / Transfer (changes form slightly)
- Amount input (number, formatted) + Currency selector
- Category (searchable dropdown, grouped by type)
- Title (text, max 100 chars)
- Date (date picker, default today)
- Account (dropdown of user's accounts)
- Merchant Name (text)
- Payment Method (dropdown)
- Notes (textarea)
- Tags (tag input — type and press Enter)
- Recurring? (toggle) → if yes, show frequency selector: daily/weekly/monthly/yearly + end date
- Receipt Image (file upload or camera capture) → on upload, auto-trigger OCR scanner workflow
- Attachments (multi-file upload)
- Split Transaction (toggle) → if yes, show split amount inputs

**Save Workflow:**
1. Validate required fields
2. If currency ≠ user's base currency: call Currency Conversion API to set `amount_usd`
3. Create/update Transaction record
4. If recurring: create/update RecurringTransaction record
5. Update Account's `current_balance` (+/- based on type)
6. Check all active Budgets for matching category → if spending > alert_threshold AND alert_sent = no: create Notification, send push notification, set alert_sent = yes
7. Create AuditLog entry
8. Close panel and refresh transactions list

### 7.4 Transaction Detail View (`/transactions/:id`)

Full-page view showing all transaction fields, receipt image preview, AI category suggestion, related budget impact, and edit/delete actions.

---

## 8. Budgets Page

### 8.1 Page Layout

**Top section — Current month overview:**
- Month/year selector (default current month)
- Total budgeted amount vs total spent
- Overall progress bar

**Main section — Budget cards grid:**

Each card shows:
- Category name + icon
- Budget period badge
- Amount spent / Amount limit (bold numbers)
- Progress bar (green/yellow/red based on threshold)
- Days remaining in period
- Projected overspend warning (if current daily rate × remaining days > remaining budget)
- Edit (pencil) / Delete (trash) button

**"+ Add Budget" button** (top right) → opens Add Budget modal.

### 8.2 Add/Edit Budget Modal

Fields:
- Category (searchable dropdown — expense categories only)
- Budget name (auto-populated from category name, editable)
- Amount limit (number + currency)
- Period: Monthly / Weekly / Yearly
- Alert at (slider: 50%, 70%, 80%, 90%, 100%)
- For monthly: auto-apply to future months (toggle)

### 8.3 Budget Workflows

**On page load:**
- Load all budgets for current user/workspace for selected month
- For each budget, calculate spent amount (sum of transactions in that category within the period)
- Show "No budgets yet" empty state with illustration if none exist

**Budget alert backend workflow (scheduled, runs hourly):**
1. For each active Budget where `alert_sent = no`
2. Calculate current spending for category in period
3. If (spent / limit) × 100 ≥ `alert_threshold`: create Notification, send email if user has budget alerts enabled, set `alert_sent = yes`

---

## 9. Investments Page

### 9.1 Portfolio Summary Header

- Total portfolio value (sum of current value across all holdings)
- Total invested (sum of purchase_price × quantity)
- Total return: value − invested ($ and %)
- Day's change (requires live price data)
- Allocation chart (doughnut by investment type)

### 9.2 Holdings Table

Sortable table columns:
- Symbol + Name
- Type badge
- Quantity
- Purchase Price
- Current Price (auto-refreshed)
- Current Value
- Gain/Loss ($)
- Gain/Loss (%)
- Day Change %
- Actions: Edit / Delete / View history

### 9.3 Add/Edit Investment Modal

Fields:
- Investment type (Stock / ETF / Bond / Crypto / Real Estate / Other)
- Symbol / Ticker (for stocks/ETFs/crypto — used for price lookup)
- Name (auto-populated via API for known symbols)
- Quantity
- Purchase price per unit
- Purchase date
- Currency
- Notes

On save, call the Market Data API to fetch `current_price`.

### 9.4 Price Refresh Workflow

**Backend scheduled workflow (runs every 15 minutes during market hours, daily for crypto):**
1. Fetch all distinct Investment symbols from Investments in the database
2. For each symbol: call Market Data API → update `current_price` and `last_price_update`
3. Calculate unrealized gain/loss for each investment

---

## 10. Receipt Scanner Page

### 10.1 Upload Interface

**Layout:**
- Large dashed upload zone (drag-and-drop or click to browse)
- Camera capture button (uses device camera via file input `capture="environment"`)
- Supported formats: JPEG, PNG, HEIC (max 10 MB)
- Processing status indicator (spinner while OCR runs)

### 10.2 OCR Processing Workflow

1. User uploads image
2. Validate file type (JPEG/PNG/HEIC only — reject others with error message) and size (< 10 MB)
3. Upload file to Bubble file storage → get file URL
4. Call API Connector: `POST /extract-receipt` with the file URL in request body
5. Show loading state: "Analyzing your receipt…"
6. On API success: populate the "New Transaction" form with extracted data:
   - `amount` ← extracted total
   - `merchant_name` ← extracted merchant
   - `date` ← extracted date
   - `category` ← AI-suggested category
   - `title` ← auto-generated: "[Merchant] receipt"
7. Show the pre-filled Add Transaction form for user review and confirmation
8. On API failure: show error and allow manual entry

### 10.3 Batch Scanning

Allow uploading up to 10 receipts at once. Show a queue UI with status per file. Create a transaction for each successfully processed receipt.

---

## 11. AI Insights Page

### 11.1 Layout

**Filter tabs:** All / Saving Tips / Overspend Alerts / Forecasts / Anomalies

**Insights feed** (newest first):

Each card:
- Severity badge (Info / Warning / Critical) with color
- Insight type icon
- Generated date (relative)
- Title (H3)
- Full body text
- Related category or budget chip (clickable → navigates to relevant page)
- Action button if `action_url` is set
- Mark as read / Dismiss button

**Empty state:** "Your AI insights will appear here once you have more transaction data. Add at least 10 transactions to get started."

### 11.2 AI Insights Generation Workflow

**Backend scheduled workflow (runs daily at midnight UTC):**

1. For each active User/Workspace:
   a. Fetch last 30 days of transactions
   b. Calculate category spending totals and compare to previous 30 days
   c. For each budget: calculate usage and days remaining → compute projected overspend
   d. Detect anomalies (transaction amounts > 3× category average)
   e. Build a structured data payload
   f. Call API Connector: `POST /generate-insights` with the payload
   g. For each insight in response: create an Insight record in the database
   h. Create Notifications for critical/warning severity insights
   i. Delete Insight records older than 90 days that are marked as read

---

## 12. Settings Page

### 12.1 Tab Navigation

Settings is organized into tabs:
1. Profile
2. Security
3. Notifications
4. Workspace
5. Billing
6. Connected Accounts
7. Data & Privacy

---

### 12.2 Profile Tab

- Avatar upload (square crop, circular preview)
- Display name
- Email (show "Verified" / "Unverified" badge; "Resend verification" link if unverified)
- Phone number
- Timezone
- Language
- Currency preference
- "Save changes" button

---

### 12.3 Security Tab

**Change Password section:**
- Current password
- New password (with strength meter)
- Confirm new password
- "Update Password" button

**Two-Factor Authentication section:**
- Toggle: Enable 2FA
- On enable: show QR code (from Bubble backend workflow that generates TOTP secret via the AI engine's `/generate-2fa` endpoint or a dedicated backend workflow)
- Input: Enter 6-digit code to verify setup
- Show backup codes (generate and display 10 one-time backup codes)
- "Disable 2FA" button (requires current password confirmation)

**Active Sessions section:**
- List of active sessions (device, IP, last active)
- "Revoke" button per session
- "Sign out all other devices" button

---

### 12.4 Notifications Tab

Toggle groups:
- **Email notifications:** Budget alerts / Weekly summary / AI insights / Transaction confirmations / Security alerts
- **In-app notifications:** All types (individual toggles)
- **Push notifications** (if enabled): All types

---

### 12.5 Workspace Tab

- Workspace name (editable by owner)
- Workspace logo upload
- Currency
- Fiscal year start month
- **Members section:**
  - List members with role badges (Owner / Member / Accountant)
  - Invite member: email input + role selector + "Send invitation" button
  - Remove member button (owner only)
  - Change role dropdown (owner only)
- **Danger Zone:**
  - "Delete Workspace" button (owner only, requires confirmation + type workspace name)
  - "Transfer Ownership" button

---

### 12.6 Billing Tab

- Current plan display with features list
- Usage stats (transactions this month, workspaces used)
- "Upgrade Plan" / "Manage Subscription" → Stripe Customer Portal link
- Payment method summary
- Billing history (table of past invoices, each with PDF download link)

---

### 12.7 Data & Privacy Tab

- "Export my data" button → creates an ExportJob for all user data (JSON format)
- "Delete my account" button → opens confirmation dialog:
  - Type "DELETE" to confirm
  - Select what to do with workspace data: transfer to another member or delete
  - On confirm: schedule account deletion workflow (30-day soft delete window)
- Privacy policy and terms links
- Cookie preferences

---

## 13. Admin Panel Page

> **Access:** Visible only to users with `role = "admin"`. Redirect all other users to `/dashboard`.

### 13.1 Overview Cards

- Total registered users
- Active users (logged in last 30 days)
- Total workspaces
- Total transactions in platform
- MRR (monthly recurring revenue — from Stripe data)
- New signups this week (sparkline)

### 13.2 User Management Table

Searchable, filterable table of all users:
- Email, display name, plan, status, created date, last login
- Actions: View profile, Reset password (send email), Change role, Suspend/Activate, Delete

### 13.3 System Health Section

- Database record counts per type
- Failed background workflows (last 24 hours)
- API error rate (from AuditLog)
- Storage usage

### 13.4 Audit Log Viewer

Searchable, filterable table of AuditLog records:
- Action, entity type, performed by, workspace, IP, timestamp
- "Export audit log" button (CSV)

---

## 14. Reusable Elements & Components

Create the following as Bubble reusable elements:

### 14.1 `re_navbar` — Top Navigation Bar
Used on all authenticated pages. Contains logo, global search trigger, notifications bell, and user menu.

### 14.2 `re_sidebar` — Left Sidebar
Used on all authenticated pages (desktop). Auto-collapses on medium breakpoint.

### 14.3 `re_transaction_card` — Transaction List Item
Used on dashboard and transactions page. Exposes a `transaction` input field.

### 14.4 `re_budget_progress_card` — Budget Progress Widget
Exposes `budget` input. Self-calculating — internally computes spent amount.

### 14.5 `re_insight_card` — AI Insight Card
Exposes `insight` input. Handles mark-as-read workflow internally.

### 14.6 `re_notification_dropdown` — Notifications Panel
Popup panel showing latest 20 notifications. Mark all as read button. Triggered from `re_navbar`.

### 14.7 `re_currency_input` — Amount + Currency Selector
Composite element: number input + currency dropdown. Exposes `amount` and `currency` state.

### 14.8 `re_file_uploader` — Enhanced File Upload
Handles file type validation, size validation, progress bar, and preview. Exposes `file_url` state on success.

### 14.9 `re_confirmation_dialog` — Confirm/Cancel Modal
Generic confirmation dialog. Exposes `title`, `body`, `confirm_label` inputs and `confirmed` event.

### 14.10 `re_empty_state` — Empty State Placeholder
Generic empty state with illustration, title, body text, and optional CTA button. Inputs: `illustration` (image), `title`, `body`, `cta_label`, `cta_action`.

---

## 15. API Connector Configuration

Configure all external APIs under **Plugins > API Connector**.

---

### 15.1 AI Engine API

**Base URL:** `https://[your-ai-engine-domain]/api/v1`

**Authentication:** Shared secret header  
`X-API-Key: [AI_ENGINE_API_KEY]`

**Endpoints:**

#### `POST /extract-receipt`
- **Name:** `AI - Extract Receipt`
- **Body (JSON):**
  ```json
  {
    "image_url": "<file_url>",
    "output_currency": "<user_currency>"
  }
  ```
- **Response fields to capture:** `merchant_name` (text), `amount` (number), `date` (text), `category_suggestion` (text), `confidence` (number), `line_items` (list)

#### `POST /generate-insights`
- **Name:** `AI - Generate Insights`
- **Body (JSON):**
  ```json
  {
    "user_id": "<user_unique_id>",
    "transactions": "<transactions_json>",
    "budgets": "<budgets_json>",
    "period_days": 30
  }
  ```
- **Response fields:** `insights` (list of objects with `title`, `body`, `type`, `severity`)

#### `POST /categorize-transaction`
- **Name:** `AI - Categorize Transaction`
- **Body:** `{ "title": "<text>", "merchant": "<text>", "amount": <number> }`
- **Response fields:** `category` (text), `confidence` (number)

---

### 15.2 Currency Exchange API

**Provider:** [Open Exchange Rates](https://openexchangerates.org) or [Fixer.io](https://fixer.io)

**Base URL:** `https://openexchangerates.org/api`

**Authentication:** `?app_id=[OPEN_EXCHANGE_RATES_APP_ID]`

#### `GET /latest.json`
- **Name:** `FX - Get Latest Rates`
- **Response:** `rates` (object with currency codes as keys)

**Note:** Cache the rates in a Bubble Option Set or a single-record "SystemConfig" data type with `fx_rates_json` and `fx_rates_updated_at` fields. Refresh daily via a scheduled backend workflow.

---

### 15.3 Market Data API *(for Investments)*

**Provider:** [Alpha Vantage](https://www.alphavantage.co) (free tier: 25 requests/day) or [Yahoo Finance via RapidAPI](https://rapidapi.com/apidojo/api/yahoo-finance1)

**Base URL:** `https://www.alphavantage.co/query`

**Authentication:** `?apikey=[ALPHA_VANTAGE_KEY]`

#### `GET /query?function=GLOBAL_QUOTE&symbol=[symbol]`
- **Name:** `Market - Get Quote`
- **Response fields:** `Global Quote.05. price` (number), `Global Quote.10. change percent` (text)

---

### 15.4 Stripe API

Use the **Bubble Stripe Plugin** (install from plugin store) rather than raw API connector for checkout and subscription management. Configure:

- **Publishable key:** `pk_live_[...]` (environment variable)
- **Secret key:** stored as Bubble App Setting (never in front-end)
- **Webhook endpoint:** `https://[your-domain]/api/1.1/wf/stripe-webhook` (create a Bubble API endpoint)
- **Webhook events to handle:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

**Stripe Products/Prices to create in Stripe Dashboard:**
- Pro Monthly: $9.99/month
- Pro Yearly: $95.88/year ($7.99/month equivalent)
- Business Monthly: $29.99/month
- Business Yearly: $287.88/year ($23.99/month equivalent)

---

### 15.5 SendGrid Email API

**Base URL:** `https://api.sendgrid.com/v3`

**Authentication:** `Authorization: Bearer [SENDGRID_API_KEY]`

**Endpoints to configure:**

#### `POST /mail/send`
- **Name:** `Email - Send Transactional`
- **Body:** SendGrid v3 mail send schema with `template_id`

**Email Templates to create in SendGrid:**

| Template Name | Template ID Variable | Used For |
|---|---|---|
| Email Verification | `SENDGRID_VERIFY_TEMPLATE_ID` | New user signup |
| Password Reset | `SENDGRID_RESET_TEMPLATE_ID` | Password reset flow |
| Budget Alert | `SENDGRID_BUDGET_ALERT_TEMPLATE_ID` | Budget threshold reached |
| Weekly Summary | `SENDGRID_WEEKLY_SUMMARY_TEMPLATE_ID` | Scheduled weekly digest |
| Welcome Email | `SENDGRID_WELCOME_TEMPLATE_ID` | Onboarding complete |
| Team Invitation | `SENDGRID_INVITE_TEMPLATE_ID` | Workspace member invite |

---

## 16. Plugin List

Install the following plugins from the Bubble Plugin Store:

| Plugin | Purpose |
|---|---|
| **Stripe** (official Bubble plugin) | Payment processing and subscription management |
| **Chart.js** or **ApexCharts** | Dashboard charts and graphs |
| **Google OAuth** | Social sign-in |
| **Google Maps / Places API** | Merchant name autocomplete (optional) |
| **Rich Text Editor** | Notes/comments with formatting |
| **Lottie Animations** | Micro-animations for empty states and loading |
| **Intercom** (or Crisp) | Customer support chat widget |
| **Segment** or **Mixpanel** | Product analytics |
| **Sentry** | Front-end error monitoring |
| **FilePond** | Enhanced file upload with progress |
| **Moment.js** | Date formatting and manipulation |
| **Confetti** | Celebration animation for milestones |

---

## 17. Workflows — Global & Backend

### 17.1 Backend Workflows (Recurring)

Configure in **Backend Workflows > Recurring events**.

#### `daily_refresh_investments` (Daily, 2:00 AM UTC)
1. Search for all distinct Investment symbols
2. For each symbol (batched): call `Market - Get Quote` API
3. Update matching Investment records with new `current_price` and `last_price_update`

#### `daily_generate_insights` (Daily, 3:00 AM UTC)
1. For each User where `subscription_plan ≠ "free"` AND `onboarding_complete = yes`:
   a. Search Transactions for this user, last 30 days
   b. Build insights payload
   c. Call `AI - Generate Insights` API
   d. Create Insight records for each returned insight
   e. Create Notifications for high-severity insights
   f. Send email if user has AI insights email enabled

#### `weekly_summary_email` (Every Monday, 8:00 AM UTC)
1. For each User where email notifications for weekly summary = enabled:
   a. Calculate last week's: total income, total expenses, net, top 3 spending categories
   b. Compare to the week before
   c. Send `Email - Send Transactional` using weekly summary template

#### `monthly_budget_reset` (1st of every month, 0:00 AM UTC)
1. For all Budgets where `period = "monthly"` and auto-apply-to-future is enabled:
   a. Create a new Budget record for the new month with the same settings
   b. Reset `alert_sent = no` on existing budgets for the new month

#### `daily_recurring_transactions` (Daily, 1:00 AM UTC)
1. Search all RecurringTransactions where `is_active = yes` AND `next_occurrence ≤ today`
2. For each: create a new Transaction based on the template
3. Update `last_executed` and calculate next `next_occurrence` based on the rule

#### `hourly_fx_rates_refresh` (Every hour)
1. Call `FX - Get Latest Rates` API
2. Update system config record with new rates JSON and timestamp

### 17.2 Backend Workflows (API Endpoints)

Create these as API endpoints (exposed as Bubble API):

#### `POST stripe-webhook`
1. Read Stripe webhook event from request body
2. Validate Stripe-Signature header (use Stripe plugin's webhook verification)
3. Switch on event type:
   - `checkout.session.completed`: Find user by `stripe_customer_id`, update `subscription_plan` and `subscription_status = "active"`
   - `customer.subscription.updated`: Update plan and status accordingly
   - `customer.subscription.deleted`: Set `subscription_status = "cancelled"`, downgrade to `free` plan
   - `invoice.payment_failed`: Set `subscription_status = "past_due"`, send payment failed email

#### `POST create-export`
1. Authenticate request (current user from token)
2. Create ExportJob record with status `pending`
3. Schedule a background workflow: `process_export_job`
4. Return the ExportJob ID

#### `POST process-export-job`
1. Find ExportJob by ID, set status to `processing`
2. Fetch all Transactions matching the export filters
3. Format as requested format (CSV: use Bubble's CSV download; PDF/Excel: call an external formatting API if needed)
4. Upload file to Bubble file storage
5. Set `file_url` and `status = "complete"`
6. Create Notification for user: "Your export is ready"

---

## 18. Styles & Design System

### 18.1 Color Palette

Configure in **Styles > Colors**:

| Token | Hex | Usage |
|---|---|---|
| `primary-500` | `#4F46E5` | Primary buttons, active nav items, links |
| `primary-600` | `#4338CA` | Button hover state |
| `primary-50` | `#EEF2FF` | Primary tints, selected state backgrounds |
| `success-500` | `#10B981` | Income amounts, success states, positive gains |
| `success-100` | `#D1FAE5` | Success backgrounds |
| `danger-500` | `#EF4444` | Expense amounts, errors, over-budget alerts |
| `danger-100` | `#FEE2E2` | Error backgrounds |
| `warning-500` | `#F59E0B` | Warning states, near-budget alerts |
| `warning-100` | `#FEF3C7` | Warning backgrounds |
| `neutral-900` | `#111827` | Primary text |
| `neutral-700` | `#374151` | Secondary text |
| `neutral-500` | `#6B7280` | Placeholder text, disabled states |
| `neutral-200` | `#E5E7EB` | Borders, dividers |
| `neutral-100` | `#F3F4F6` | Subtle backgrounds |
| `neutral-50` | `#F9FAFB` | Page background |
| `white` | `#FFFFFF` | Card backgrounds |
| `surface-dark` | `#1E1E2E` | Dark mode card background |
| `bg-dark` | `#12121F` | Dark mode page background |

### 18.2 Typography

| Style Name | Font | Size | Weight | Usage |
|---|---|---|---|---|
| `heading-1` | Inter | 32px | 700 | Page titles |
| `heading-2` | Inter | 24px | 600 | Section headings |
| `heading-3` | Inter | 20px | 600 | Card titles |
| `body-lg` | Inter | 16px | 400 | Default body text |
| `body-md` | Inter | 14px | 400 | Secondary text |
| `body-sm` | Inter | 12px | 400 | Labels, captions |
| `mono` | JetBrains Mono | 14px | 400 | Amounts, codes |
| `button` | Inter | 14px | 600 | Button labels |

**Font import:** Add to app's `<head>`: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap`

### 18.3 Spacing Scale

Use multiples of 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px.

### 18.4 Border Radius Scale

- Small: 4px (badges, inputs)
- Medium: 8px (cards, buttons)
- Large: 12px (modals, large cards)
- XL: 16px (feature cards)
- Full: 9999px (pills, avatars)

### 18.5 Shadow Scale

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle card lift |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, floating elements |

### 18.6 Dark Mode

Bubble does not natively support CSS variables for dark mode. Implement using:
1. A custom state `app_theme` on the index page (values: `light` / `dark`)
2. Conditional formatting rules on all elements: when `app_theme = "dark"`, change background/text/border colors to dark-mode tokens
3. Store user preference in `User.notification_preferences` JSON (key: `"theme"`)
4. Apply preference on page load via a page-load workflow

---

## 19. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile | < 768 px | Single-column; bottom tab bar replaces sidebar; tables become card lists; reduced chart size |
| Tablet | 768–1023 px | Two-column grid; sidebar collapses to icon-only; chart grid adjusts |
| Desktop | ≥ 1024 px | Full layout with expanded sidebar |

Configure in Bubble's **Responsive Editor**:
- All pages: set to **Fluid (stretch to page width)**
- Dashboard cards row: set to `4 columns → 2 columns (tablet) → 1 column (mobile)`
- Charts row: set to `60/40 split → 100% each (tablet) → stacked (mobile)`
- Sidebar: visible on desktop only (hide on mobile ≤ 767px)
- Bottom tab bar reusable element: visible on mobile only (show on ≤ 767px)

---

## 20. Performance Settings

### 20.1 Bubble App Settings

Under **Settings > General:**
- Enable **Server-side rendering (SSR)** for the landing, login, and signup pages
- Enable **Lazy loading** for images throughout the app
- Enable **Browser caching** for static elements

### 20.2 Database Query Optimisation

Follow these rules for every Repeating Group and data expression:

1. **Always add constraints** to every search — never load all records without filtering
2. **Use Bubble's "Do a search for" with Count** for aggregations instead of loading full lists
3. **Paginate** all lists: max 20 items per page
4. **Use "Ignore empty constraints"** for optional filter fields
5. **Cache frequently-read data** using Bubble option sets for static data (currency list, timezone list, country list)

### 20.3 Image Optimisation

- Store receipt images at max 1920px width
- Use Bubble's built-in image resizer: append `?width=400` for thumbnail previews
- Lazy-load all images in repeating groups (set **Load images lazily** = yes)

### 20.4 API Call Optimisation

- Cache the FX rates in a database record (hourly refresh) — never call the FX API on each transaction
- Batch investment price lookups in the scheduled workflow rather than fetching per investment
- Use Bubble's **Custom event** system to avoid redundant API calls when the same data is needed multiple times on one page

---

## 21. Security Settings

### 21.1 Bubble App Settings — Security

Under **Settings > General > Security:**
- ✅ Enable **Prevent pages from being loaded in iFrames** (clickjacking protection)
- ✅ Set **Content Security Policy** to the strictest policy that still allows your CDN and API domains
- ✅ Enable **HTTPS Only** — force all traffic over HTTPS
- ✅ Set **Secure** and **HttpOnly** flags on session cookies (Bubble handles this automatically on production)

### 21.2 Privacy Rules (Recap)

- All data types must have explicit privacy rules (see Section 3)
- **Never expose** `two_factor_secret`, `stripe_customer_id`, `reset_password_token`, or `email_verification_token` to any front-end data expression
- Test all privacy rules by accessing the app while signed out and verifying no data is returned

### 21.3 API Endpoint Security

For all Backend Workflow API endpoints:
- Check **Ignore privacy rules when triggered via API** = **OFF** (default — do not override)
- For Stripe webhook endpoint only: enable "This endpoint can be triggered without authentication" but validate the Stripe-Signature header in the workflow
- For all other endpoints: require a valid user session or API key

### 21.4 File Upload Security

In the `re_file_uploader` reusable element:
1. Validate file extension client-side: only allow `.jpg`, `.jpeg`, `.png`, `.heic`
2. Validate MIME type via a backend workflow before processing
3. Set max file size to 10 MB in the FilePond plugin settings
4. Store files in Bubble's file storage (not accessible without a direct URL)
5. Do not allow users to supply external image URLs for receipt processing (upload only)

### 21.5 Rate Limiting

Bubble does not have built-in rate limiting on form submissions. Implement using:
1. A **Login attempt counter** per user (already described in auth workflow)
2. For signup: use a Cloudflare Turnstile CAPTCHA (free) or hCaptcha plugin on the signup form
3. For password reset: enforce the "If account exists, email sent" pattern to prevent enumeration

---

## 22. SEO & Metadata

### 22.1 Landing Page (`/`) Metadata

In **Page Settings** for the landing page:
- **Title:** `AI Expense Tracker Pro — Smart Money Management`
- **Meta description:** `Track expenses, scan receipts, and get AI-powered financial insights. The all-in-one personal and business finance platform.`
- **OG Image:** 1200×630 px branded image
- **OG Type:** `website`
- **Twitter Card:** `summary_large_image`
- **Canonical URL:** `https://[your-domain]/`

### 22.2 Authenticated Pages

For authenticated pages set:
- `<meta name="robots" content="noindex, nofollow">` — prevent indexing of user data pages
- Unique `<title>` per page: `[Page Name] | AI Expense Tracker Pro`

### 22.3 Sitemap

Create a static sitemap at `/sitemap.xml` containing only public pages: `/`, `/login`, `/signup`, `/forgot-password`, and any marketing/legal pages.

---

## 23. Deployment Checklist

Complete all items before launching to production.

### App Configuration
- [ ] All **App Settings** filled in: app name, app domain, contact email
- [ ] **Custom domain** configured and SSL certificate active
- [ ] Production environment keys set for all API integrations (not test/sandbox keys)
- [ ] Stripe switched from test mode to live mode
- [ ] SendGrid sender domain authenticated and verified
- [ ] All **privacy rules** tested with a non-admin user account

### Data
- [ ] System Categories seeded via `CreateSystemCategories` backend workflow
- [ ] Default Option Sets created: currencies, timezones, languages, countries
- [ ] FX rates initial load completed

### Performance
- [ ] Page load time < 3 seconds on simulated 4G connection (test with Bubble's Performance tab)
- [ ] All Repeating Groups have constraints and pagination
- [ ] No unconstrained "Do a search for" expressions on high-traffic pages
- [ ] Images compressed and lazy-loaded

### Security
- [ ] Privacy rules tested for each data type
- [ ] 2FA flow tested end-to-end
- [ ] Email verification flow tested
- [ ] Password reset flow tested
- [ ] File upload validates type and size
- [ ] No secrets committed to the Bubble editor (all API keys in App Settings / Environment Variables)
- [ ] Stripe webhook signature validation in place
- [ ] iFrame embedding disabled

### Workflows
- [ ] All recurring backend workflows scheduled and enabled
- [ ] Stripe webhook endpoint active and tested with Stripe CLI
- [ ] Export job workflow tested for all formats
- [ ] All email templates active in SendGrid and tested

### Testing
- [ ] Full user journey tested: Signup → Onboarding → Add transaction → Create budget → Scan receipt → View insights → Export → Subscribe
- [ ] Mobile layout tested on iOS Safari and Android Chrome
- [ ] Admin panel tested with admin-role user
- [ ] Workspace member invitation tested
- [ ] Data deletion (account and workspace) tested

### Legal
- [ ] Privacy Policy page created and linked
- [ ] Terms of Service page created and linked
- [ ] Cookie consent banner configured (required for GDPR compliance)
- [ ] GDPR data export (Section 12.7) verified functional

---

*This prompt was last updated: March 2026. Refer to the [Bubble documentation](https://manual.bubble.io) for the latest UI and workflow configuration steps.*
