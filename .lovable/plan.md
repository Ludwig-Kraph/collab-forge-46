# Subscription Plans & Token System Implementation

## 1. Recommended Subscription Plans

Based on the M-Leja PRD and MPESA payment ecosystem, here are the suggested subscription tiers to be created via the Control Panel:


| Plan              | Price (KES)                  | Period         | Users     | STK Pushes | Target                                      |
| ----------------- | ---------------------------- | -------------- | --------- | ---------- | ------------------------------------------- |
| Get Started Free  | 0                            | -              | 1         | 3 (trial)  | New users testing the platform              |
| Raia Pochi        | 50/day, 1,200/mo             | Daily/Monthly  | 1         | 1000/mo    | Individual Till number users                |
| Raia Till         | 80/day, 2,000/mo             | Daily/Monthly  | 3         | 5000/mo    | Small shops with Business till numbers      |
| Business Till     | 150/day, 3,500/mo, 35,000/yr | All            | 15        | 12,000/mo  | Growing businesses (SMEs)                   |
| Business Paybill  | 200/day, 5,000/mo, 50,000/yr | All            | 10        | 20,000/mo  | Paybill-based businesses                    |
| Corporate Till    | Custom                       | Monthly/Annual | 1000      | Unlimited  | Large retail chains                         |
| Corporate Paybill | Custom                       | Monthly/Annual | 10000     | Unlimited  | Large service companies                     |
| Government        | 150,000/yr                   | Annual only    | Unlimited | Unlimited  | Government agencies (never on landing page) |


These will be added as enhanced templates in the SubscriptionTemplates component.

## 2. Token System (M-Leja Credits)

A token/credit system that lets users purchase STK push credits beyond their subscription limits or as a pay-as-you-go alternative.

### How It Works

- Users buy token packages (bundles of STK push credits)
- Tokens are consumed when STK pushes are triggered
- Tokens supplement subscription limits -- when subscription pushes are exhausted, tokens are used
- Tokens never expire (or have a long expiry like 1 year)
- Super Admin configures token packages and pricing from Control Panel

### Token Packages (Suggested)


| Package         | Tokens  | Price (KES) | Per-Token Cost |
| --------------- | ------- | ----------- | -------------- |
| Starter Pack    | 100     | 100         | 1.00           |
| Value Pack      | 200     | 200         | 1.00           |
| Business Pack   | 2,000   | 1,000       | 0.50           |
| Premium Pack    | 10,000  | 2,500       | 0.25           |
| Enterprise Pack | 200,000 | 20,000      | 0.10           |


### Technical Implementation

#### A. Database Changes

1. `**token_packages` table** -- stores configurable token bundles
  - id, name, description, token_count, price, currency, is_active, created_at, updated_at
  - RLS: anyone can view active packages; super_admin can manage
2. `**token_balances` table** -- tracks each user's token balance
  - id, user_id, balance, total_purchased, total_used, updated_at
  - RLS: users view own; super_admin views all
3. `**token_transactions` table** -- audit trail for token purchases and usage
  - id, user_id, type (purchase/usage/refund/bonus), amount, balance_after, reference_id, description, created_at
  - RLS: users view own; no deletes/updates
4. **Database function** `consume_token(user_id, count)` -- atomically decrements balance and logs usage; called after subscription STK pushes are exhausted

#### B. Frontend Changes

1. **Update `SubscriptionTemplates.tsx**` -- Replace current templates with the 8 PRD-aligned tiers above
2. **New `src/pages/TokenStore.tsx**` -- User-facing page to browse and purchase token packages, view token balance, and see token transaction history
3. **New `src/pages/control-panel/TokenManagement.tsx**` -- Super Admin page to create/edit/deactivate token packages and view platform-wide token analytics
4. **Update `ControlPanelSidebar.tsx**` -- Add "Token Management" nav item under the Control Panel
5. **Update `AppSidebar.tsx` and `BottomNavigation.tsx**` -- Add token balance indicator or link to token store
6. **Update `src/hooks/useMpesaPayment.ts**` -- After subscription STK pushes are exhausted, check and consume tokens before blocking the payment
7. **Update `src/pages/Subscription.tsx**` -- Show token balance alongside subscription usage; add "Buy Tokens" CTA when STK pushes are running low
8. **Add route `/tokens**` in `App.tsx` for the token store page, and `/control-panel/tokens` for admin management

#### C. Payment Flow for Token Purchase

- User selects a token package
- System triggers MPESA STK push to the user's phone for the package price
- On successful payment callback, tokens are credited to the user's balance
- Transaction is logged in `token_transactions`

#### D. Token Consumption Flow

1. User triggers STK push payment
2. System checks subscription `free_stk_pushes_remaining` and `max_stk_pushes`
3. If subscription pushes available -- use subscription (existing behavior)
4. If subscription exhausted -- check `token_balances`
5. If tokens available -- consume 1 token, proceed with STK push
6. If no tokens -- show "Purchase tokens or upgrade subscription" prompt