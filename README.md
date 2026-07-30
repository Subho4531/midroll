# MidRoll Protocol
[![CI](https://github.com/Subho4531/midroll/actions/workflows/ci.yml/badge.svg)](https://github.com/Subho4531/midroll/actions/workflows/ci.yml)

> A privacy-first corporate protocol on the Midnight blockchain delivering Shielded Corporate Expense Reimbursements and Anonymous Employee Governance & Whistleblower Protections.

## Live Demo
[https://midroll.netlify.app/](https://midroll.vercel.app/)

## Contract Address
| Network  | Address                                                            |
|----------|--------------------------------------------------------------------|
| Preprod  | `85dd06179800830b2d181f3238ecf3b94a0ae820bcc62953e50c0f9d26743a7d` |
| Preview  | `d38ae623e782c47f2da8a2b1b29dc12e8a33082713caf42d09ab89afc3ec023f` |

*(Contract compiled with Midnight Compact DSL v0.23)*

---

## What This Does
MidRoll enables decentralized organizations and companies to execute confidential employee workflows without exposing sensitive financial records on-chain:
- **Shielded Corporate Expense Reimbursements**: Employees submit zero-knowledge merchant receipt proofs attesting that expenses fall within category limits. Treasury disburses reimbursements directly to disposable stealth addresses without exposing itemized receipts, personal card numbers, or vendor details.
- **Anonymous Employee Governance & Whistleblower Protocol**: Employees verify payroll status via ZK witnesses to vote on company polls and submit encrypted internal compliance alerts without fear of employer retaliation or identity de-anonymization.

---

## Visual Gallery & Screenshots Index

### 🌐 Web Frontend & Dashboards
<p align="center">
  <img src="screenshots/landingpage.png" width="48%" alt="Landing Page" />
  <img src="screenshots/dashboard.png" width="48%" alt="Corporate Dashboard" />
</p>
<p align="center">
  <img src="screenshots/contacts.png" width="48%" alt="Contacts Management" />
  <img src="screenshots/transactions.png" width="48%" alt="Transactions History" />
</p>

### 🛠️ Smart Contract Compilation, Deployment & On-Chain Explorer Verification
<p align="center">
  <img src="screenshots/contract_compile.png" width="31%" alt="Compact Compiler Output" />
  <img src="screenshots/contract_deploy.png" width="31%" alt="Contract Deployment logs" />
  <img src="screenshots/contract_preview.png" width="31%" alt="1AM Block Explorer verification" />
</p>
<p align="center">
  <img src="screenshots/mobile%20view.png" width="35%" alt="Responsive Mobile View" />
</p>

---

## Privacy Model
- PUBLIC:
  - `treasury_commitment`: Hash commitment of corporate payroll treasury pool.
  - `nullifier_root`: Set of spent nullifiers preventing double-claiming expenses & double-voting.
  - `active_proposals_count`: Total active DAO governance polls.
  - `aggregate_expense_disbursed`: Cumulative verified reimbursement payout.
- PRIVATE:
  - `salary_amount_cents`: Employee's raw monthly compensation rate.
  - `employee_secret_key`: Secret key used for signing client-side ZK proofs.
  - `receipt_itemized_details`: Raw itemized purchase items and merchant credit card data.
  - `whistleblower_identity`: Employee name, IP address, and wallet address.
- PROVED without revealing:
  - Proves receipt total <= category policy limit.
  - Proves active payroll membership to cast anonymous governance votes.
  - Proves nullifier has not been spent previously.

---

## Privacy Claim
What an on-chain observer sees vs cannot see.
An on-chain observer can only see that a valid ZK transaction was executed, that the contract state commitment has updated, and that a proof has been successfully verified. An observer **cannot** see the worker's wallet address, the itemized receipt contents, the merchant's credit card information, the voter's identity, or the whistleblower's personal details.

---

## Tech Stack
Midnight network, Compact, Midnight.js SDK, Next.js / React, Lace wallet

---

## Prerequisites
- Lace wallet installed
- Node.js v22

---

## Setup & Run Locally
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
   To deploy to the public Preview network:
   ```bash
   npm run deploy --network preview
   ```

5. **Run the local Web Frontend**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Run Tests
We have three test suites verifying the full lifecycle of MidRoll:
- **Contract ZK Tests:** Validates smart contract zero-knowledge logic, employee payroll active-status checks, double-claim nullifiers, and verifies that private witness variables are not leaked to public ledger states.
- **Frontend Helpers Tests:** Validates custom React frontend logic, address truncation readability helper, and the chronological matcher for pending transaction sync recovery.
- **Backend/On-chain Tests:** Validates company tenant isolation parameters and verifies database schema transaction status transitions.

```bash
npm test
```

---

## CI/CD
The CI/CD pipeline is configured via GitHub Actions in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml).
- **Triggers:** On every push or pull request to the `master` and `main` branches.
- **Pipeline Actions:**
  1. **Checkout Code:** Pulls the latest code from the repository.
  2. **Install Node.js v22:** Sets up the execution runtime environment.
  3. **Install Dependencies:** Installs npm modules.
  4. **Validate Prisma Schema:** Checks database integrity.
  5. **Generate Prisma Client:** Builds database runtime bindings.
  6. **Install Compact Compiler:** Downloads the official Midnight compact compiler CLI and updates it via `compact update` to set the default compiler environment.
  7. **Compile Contracts:** Compiles the Compact ZK smart contracts using `compact compile`.
  8. **Run All Tests:** Executes the three test suites (Contract, Frontend, and Backend) using Vitest.

---

## Product Proposal
See [PROPOSAL.md](file:///C:/Users/subho/OneDrive/Documents/midnight-t1/PROPOSAL.md)
