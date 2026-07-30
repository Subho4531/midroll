# MidRoll Protocol
![CI](https://github.com/Subho4531/midroll/actions/workflows/ci.yml/badge.svg)

> A privacy-first corporate protocol on the Midnight blockchain delivering Shielded Corporate Expense Reimbursements and Anonymous Employee Governance & Whistleblower Protections.

## Live Demo
[https://midroll.vercel.app/](https://midroll.vercel.app/)

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

## Privacy Model

### - PUBLIC:
- `treasury_commitment`: Hash commitment of corporate payroll treasury pool.
- `nullifier_root`: Set of spent nullifiers preventing double-claiming expenses & double-voting.
- `active_proposals_count`: Total active DAO governance polls.
- `aggregate_expense_disbursed`: Cumulative verified reimbursement payout.

### - PRIVATE:
- `salary_amount_cents`: Employee's raw monthly compensation rate.
- `employee_secret_key`: Secret key used for signing client-side ZK proofs.
- `receipt_itemized_details`: Raw itemized purchase items and merchant credit card data.
- `whistleblower_identity`: Employee name, IP address, and wallet address.

### - PROVED without revealing:
- Proves receipt total <= category policy limit.
- Proves active payroll membership to cast anonymous governance votes.
- Proves nullifier has not been spent previously.

---

## Privacy Claim
> [!IMPORTANT]
> **What an on-chain observer sees vs. cannot see:**
> - **What they see:** A valid ZK transaction has been verified and executed on-chain, updating the state commitment of the contract.
> - **What they cannot see:** The worker's wallet address, the itemized receipt contents, the merchant's credit card information, the voter's identity, or the whistleblower's personal details.

---

## Tech Stack
- **Network & Cryptography:** Midnight Network, Compact DSL
- **SDK & Libraries:** Midnight.js SDK
- **Frontend Framework:** Next.js / React
- **Web3 Connector:** Lace Wallet / 1AM Connector

---

## Prerequisites
- **Web3 Wallet:** Lace Wallet extension installed (with Midnight support)
- **Node Environment:** Node.js v22
- **Compiler Support:** WSL2 (Windows only) for local Compact compiler execution

---

## Setup & Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Subho4531/midroll.git
cd midroll
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local Devnet Proof Server & Node
```bash
npm run proof-server:start
```

### 4. Deploy the Smart Contract
To deploy to the local Devnet:
```bash
npm run deploy
```
To deploy to the public Preview network:
```bash
npm run deploy --network preview
```

### 5. Run the Web Frontend locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Run Tests
We have two test suites to validate both smart contract rules and frontend helper logic:
- **Contract Test Suite:** Verifies ZK circuit compliance, receipt threshold validations, anonymous voting, and non-exposure of private witnesses.
- **Frontend Test Suite:** Verifies address truncation presentation, and the chronological pending transaction sync matcher.

To execute the test suite, run:
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
  4. **Install Compact Compiler:** Downloads the official Midnight compact compiler CLI and updates it via `compact update` to set the default compiler environment.
  5. **Compile Contracts:** Compiles the Compact ZK smart contracts using `compact compile`.
  6. **Run Test Suite:** Runs both the contract and frontend Vitest test suites.

---

## Product Proposal
See [PROPOSAL.md](file:///C:/Users/subho/OneDrive/Documents/midnight-t1/PROPOSAL.md)
