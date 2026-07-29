# MidRoll Protocol
> privacy-first corporate protocol on the Midnight blockchain delivering Shielded Corporate Expense Reimbursements and Anonymous Employee Governance & Whistleblower Protections.

## Live Demo
[https://midroll.vercel.app/](https://midroll.vercel.app/)

## Contract Address
| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `85dd06179800830b2d181f3238ecf3b94a0ae820bcc62953e50c0f9d26743a7d`   |

*(Contract compiled with Midnight Compact DSL v0.23)*

## What This Does
MidRoll enables decentralized organizations and companies to execute confidential employee workflows without exposing sensitive financial records on-chain:
- **Shielded Corporate Expense Reimbursements**: Employees submit zero-knowledge merchant receipt proofs attesting that expenses fall within category limits. Treasury disburses reimbursements directly to disposable stealth addresses without exposing itemized receipts, personal card numbers, or vendor details.
- **Anonymous Employee Governance & Whistleblower Protocol**: Employees verify payroll status via ZK witnesses to vote on company polls and submit encrypted internal compliance alerts without fear of employer retaliation or identity de-anonymization.

## Privacy Model
- **What is PUBLIC**:
  - `treasury_commitment`: Hash commitment of corporate payroll treasury pool.
  - `nullifier_root`: Set of spent nullifiers preventing double-claiming expenses & double-voting.
  - `active_proposals_count`: Total active DAO governance polls.
  - `aggregate_expense_disbursed`: Cumulative verified reimbursement payout.
- **What is PRIVATE**:
  - `salary_amount_cents`: Employee's raw monthly compensation rate.
  - `employee_secret_key`: Secret key used for signing client-side ZK proofs.
  - `receipt_itemized_details`: Raw itemized purchase items and merchant credit card data.
  - `whistleblower_identity`: Employee name, IP address, and wallet address.
- **What the user PROVES without revealing**:
  - Proves receipt total <= category policy limit.
  - Proves active payroll membership to cast anonymous governance votes.
  - Proves nullifier has not been spent previously.

## Privacy Claim
An on-chain observer can only see that a valid ZK transaction was executed, that the contract state commitment has updated, and that a proof has been successfully verified. An observer **cannot** see the worker's wallet address, the itemized receipt contents, the merchant's credit card information, the voter's identity, or the whistleblower's personal details.

## Tech Stack
Midnight network, Compact DSL, Midnight.js SDK, Next.js / React, Lace wallet

## Prerequisites
- Lace wallet installed
- Node.js v22

## Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Subho4531/midroll.git
   cd midroll
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local Proof Server & Midnight Node (Devnet)**:
   ```bash
   npm run proof-server:start
   ```

4. **Deploy the Smart Contract**:
   To deploy to the local Devnet:
   ```bash
   npm run deploy
   ```
   To deploy to the public Preprod network:
   ```bash
   npm run deploy --network preprod
   ```

5. **Run the local Web Frontend**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Video
[PLACEHOLDER — I will add the link after recording]
