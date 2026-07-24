# MidRoll
> A privacy-first corporate protocol on the Midnight blockchain delivering Shielded Corporate Expense Reimbursements (Feature 5) and Anonymous Employee Governance & Whistleblower Protections (Feature 6) via Compact ZK smart contracts.

## Contract Address
| Network  | Address                          |
|----------|----------------------------------|
| Devnet (Local) | `57c89664ac66a571f85b2c2fc29d9368478946decf849fa92c310e512a6444c9`   |

*(Contract compiled with Midnight Compact DSL v0.12.1)*

## What This Does
MidRoll enables decentralized organizations and companies to execute confidential employee workflows without exposing sensitive financial records on-chain:
- **Feature 5 (Shielded Corporate Expense Reimbursements)**: Employees submit zero-knowledge merchant receipt proofs attesting that expenses fall within category limits. Treasury disburses reimbursements directly to disposable stealth addresses without exposing itemized receipts, personal card numbers, or vendor details.
- **Feature 6 (Anonymous Employee Governance & Whistleblower Protocol)**: Employees verify payroll status via ZK witnesses to vote on company polls and submit encrypted internal compliance alerts without fear of employer retaliation or identity de-anonymization.

## Privacy Model
- **PUBLIC (on-chain, visible to anyone)**:
  - `treasury_commitment`: Hash commitment of corporate payroll treasury pool.
  - `nullifier_root`: Set of spent nullifiers preventing double-claiming expenses & double-voting.
  - `active_proposals_count`: Total active DAO governance polls.
  - `aggregate_expense_disbursed`: Cumulative verified reimbursement payout.
- **PRIVATE (private witness, never on-chain)**:
  - `salary_amount_cents`: Employee's raw monthly compensation rate.
  - `employee_secret_key`: Secret key used for signing client-side ZK proofs.
  - `receipt_itemized_details`: Raw itemized purchase items and merchant credit card data.
  - `whistleblower_identity`: Employee name, IP address, and wallet address.
- **What the user PROVES without revealing**:
  - Proves receipt total <= category policy limit.
  - Proves active payroll membership to cast anonymous governance votes.
  - Proves nullifier has not been spent previously.

## Tech Stack
- **Blockchain**: Midnight Network (Preview & Preprod)
- **Smart Contract Language**: Compact DSL
- **ZK Proving Engine**: Groth16 over BLS12-381 curve / `midnightnetwork/proof-server`
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Testing**: Vitest unit test suite

## Prerequisites
- Node.js v22+
- Docker Desktop (for `midnightnetwork/proof-server`)
- Git & GitHub CLI (`gh`)

## Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Subho4531/midroll.git
   cd midroll
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Run Tests
Run the Vitest test suite covering ZK circuit constraints, nullifier uniqueness, and private state non-exposure:
```bash
npx vitest run
```

## Initial Idea
The initial idea for **MidRoll** stems from a critical dilemma in Web3 corporate management: how can organizations maintain auditability and employee rights (reimbursements, compensation governance, whistleblower protections) without exposing private salaries, identity data, and vendor spending patterns on a public blockchain?

MidRoll resolves this by leveraging **Midnight's Zero-Knowledge Compact DSL smart contract state**. By utilizing private witness inputs and client-side zk-SNARK proof generation:
1. **Shielded Corporate Expenses (Feature 5)**: Workers generate ZK proofs attesting that expense receipts fall within merchant category policy limits. Reimbursements disburse to stealth addresses automatically without revealing credit card numbers or raw itemized purchase items.
2. **Anonymous Governance & Whistleblower Protocol (Feature 6)**: Workers verify active payroll membership without de-anonymizing themselves, enabling anonymous compensation voting and secure whistleblower alerts protected from employer retaliation.

## Compile Output
```bash
$ wsl ~/.local/bin/compact compile contracts/midroll.compact contracts/managed/midroll
Compiling 2 circuits:
```
*(The contract has been successfully compiled into `contracts/managed/midroll/`)*
