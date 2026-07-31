# 🛡️ MidRoll: Privacy-First Corporate Expenses & Employee Governance on Midnight

MidRoll is a next-generation corporate payroll and compliance protocol built on the Midnight blockchain, leveraging Zero-Knowledge (ZK) proofs and Compact smart contracts to ensure corporate ledger privacy while maintaining high-fidelity auditable compliance.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=netlify)](https://midroll.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-black?style=for-the-badge&logo=github)](https://github.com/Subho4531/midroll)
[![Video Demo](https://img.shields.io/badge/Video-Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/6HA7Y5ENZaU)
![Midnight](https://img.shields.io/badge/Midnight-Compact-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)

---

## 📑 Table of Contents

- [📖 Project Description](#-project-description)
- [🎥 Video Demo](#-video-demo)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [📜 Smartcontract Details](#-smartcontract-details)
- [🛡️ Privacy & ZK Model](#-privacy--zk-model)
- [🚀 Run Locally & Getting Started](#-run-locally--getting-started)
- [🖼️ UI Screenshots](#️-ui-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🤖 CI/CD Pipeline](#-cicd-pipeline)
- [📝 Product Proposal](#-product-proposal)

---

## 📖 Project Description

MidRoll redefines how organizations manage employee finances and compliance. By integrating **Zero-Knowledge Proofs (ZKPs)** via Midnight's **Compact contract engine**, MidRoll allows employees to prove receipt compliance for expense reimbursements and check salary rosters for governance voting without disclosing sensitive raw data (like itemized purchases, merchant detail tags, salary sizes, or voter identities) on the public ledger.

---

## 🎥 Video Demo

Experience MidRoll in action:

[![MidRoll Video Demo](https://img.youtube.com/vi/6HA7Y5ENZaU/0.jpg)](https://youtu.be/6HA7Y5ENZaU)

*Watch the full walkthrough of the Privacy-First Corporate Expenses and Employee Governance on Midnight.*

---

## ✨ Key Features

- **🔐 Privacy via ZK Proofs**: Receipt compliance verification checks (receipt amount <= category threshold) run locally. Treasury reimburses to stealth addresses without publishing itemized merchant receipts or personal cards on-chain.
- **💎 Dynamic Shielded Token Selection**: Integrates `getShieldedBalances` to query available shielded tokens in the Lace wallet dynamically, defaulting to custom USDC (`9e3544c9fc085f2be9625c3be78ce82a3cb3c5a946bbbf7553a21781ae4628dc`).
- **🔒 Company Multi-Tenant Isolation**: Roaster contacts, corporate teams, and on-chain logs are partitioned by the company connected `walletAddress` to enforce complete data privacy from other corporate tenants.
- **🛡️ Pending Transaction Recovery**: Handles indexer lag. Approved transactions are saved with a `PENDING` state and automatically synced/resolved chronologically against the connected wallet history on subsequent visits.
- **⚡ Auto-Connect & Redirect**: Connection persistence remembers your wallet connectivity; automatically connects on mount and redirects you directly to the `/dashboard`.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (Next.js)"]
        UI["MidRoll Terminal"]
        PM["Payment Dispatcher (ZK Routing)"]
        AM["Lace Wallet Connector"]
    end

    subgraph Backend ["Server (Next.js API)"]
        API["REST API (/api/contacts, /api/transactions)"]
        DB[("Postgres DB (Prisma)")]
    end

    subgraph Blockchain ["Midnight Network"]
        Wallet["Lace Wallet (DApp API)"]
        SC["Compact Smart Contract"]
        Explorer["1AM Block Explorer"]
    end

    %% Interactions
    UI --> PM
    UI --> AM
    AM -- "1. Auto Connect / Restore" --> Wallet
    PM -- "2. Check Shielded Balances" --> Wallet
    PM -- "3. Dispatch ZK Circuit" --> Wallet
    Wallet -- "4. Submit Tx" --> SC
    SC -- "5. Emit Event & Hash" --> Explorer
    PM -- "6. Post Transaction" --> API
    API --> DB
    UI -- "7. Fetch Isolated Tenant Data" --> API
```

---

## 📜 Smartcontract Details

MidRoll's core logic is governed by a Compact smart contract deployed on the Midnight Preview Testnet.

- **Contract Address**: `d38ae623e782c47f2da8a2b1b29dc12e8a33082713caf42d09ab89afc3ec023f`
- **Network**: Midnight Preview Testnet
- **Explorer URL**: [https://explorer.1am.xyz/tx/d38ae623e782c47f2da8a2b1b29dc12e8a33082713caf42d09ab89afc3ec023f](https://explorer.1am.xyz/tx/d38ae623e782c47f2da8a2b1b29dc12e8a33082713caf42d09ab89afc3ec023f)

---

## 🛡️ Privacy & ZK Model

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

### - Privacy Claim:
What an on-chain observer sees vs cannot see.
An on-chain observer can only see that a valid ZK transaction was executed, that the contract state commitment has updated, and that a proof has been successfully verified. An observer **cannot** see the worker's wallet address, the itemized receipt contents, the merchant's credit card information, the voter's identity, or the whistleblower's personal details.

---

## 🚀 Run Locally & Getting Started

### Prerequisites
- Lace Wallet browser extension installed (configured for Midnight Network)
- Node.js v22
- Docker (for local dev proof-server container)

### Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Subho4531/midroll.git
   cd midroll
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local Devnet Proof Server & Node**:
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

5. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests
We have three test suites verifying the full lifecycle of MidRoll:
- **Contract ZK Tests:** Validates smart contract zero-knowledge logic, employee payroll active-status checks, double-claim nullifiers, and verifies that private witness variables are not leaked to public ledger states.
- **Frontend Helpers Tests:** Validates custom React frontend logic, address truncation readability helper, and the chronological matcher for pending transaction sync recovery.
- **Backend/On-chain Tests:** Validates company tenant isolation parameters and database schema transaction status transitions.

```bash
npm test
```

---

## 🖼️ UI Screenshots

#### 💎 Main Landing Page
![MidRoll Landing Page](./screenshots/landingpage.png)

#### 🚀 Corporate Dashboard
![MidRoll Dashboard](./screenshots/dashboard.png)

#### 👥 Contacts Management
![Contacts Page](./screenshots/contacts.png)

#### 📊 Transaction Streams & Ledgers
![Transactions Page](./screenshots/transactions.png)

#### 📱 Responsive Design (Mobile Ready)
![Mobile View](./screenshots/mobile%20view.png)

#### 🛠️ Soroban/Soroban-equivalent Compact Compiling
![Contract Compile](./screenshots/contract_compile.png)

#### ⛓️ Contract On-Chain Deployment
![Contract Deploy](./screenshots/contract_deploy.png)

#### 🔍 1AM Block Explorer Verification
![Contract Preview Verification](./screenshots/contract_preview.png)

---

## 🛠️ Tech Stack
MidRoll is built using a modern, high-performance stack optimized for security and scale.

- **Frontend**: Next.js, Tailwind CSS, Framer Motion, Lenis Scroll
- **Blockchain**: Midnight Network, Compact ZK Smart Contracts, Midnight.js SDK, Lace Wallet
- **Backend**: Node.js, Next.js API Routes, Prisma
- **Database**: PostgreSQL (Aiven Cloud Instance)
- **Testing**: Vitest

---

## 📂 Project Structure

```text
├── .github/workflows/ # GitHub Actions CI/CD workflows
├── contracts/         # Compact Smart Contracts & managed compiled output
├── screenshots/       # Visual tour images & assets
├── scripts/           # Deployment & configuration maintenance CLI scripts
├── src/               # Next.js Source Code
│   ├── app/           # App Router (Pages, UI shells, & REST API routes)
│   ├── components/    # Reusable React UI layouts & dashboard tables
│   ├── hooks/         # Custom hooks (Midnight DApp connector integration)
│   └── lib/           # Context providers (Lace connection) & DB Client
└── tests/             # Contract, Frontend, and Backend Vitest suites
```

---

## 🤖 CI/CD Pipeline

The CI/CD pipeline is configured via GitHub Actions in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml).
- **Triggers:** On every push or pull request to the `master` and `main` branches.
- **Pipeline Structure:**
  1. **contracts (Build and Test Contracts):** Checks out code, sets up Node.js v22, downloads the official Midnight compact compiler CLI, runs `compact update` to set the default compiler, runs the contract ZK circuit verification tests, compiles the Compact smart contracts, and uploads the compilation files as a workflow artifact (`contract-artifacts`).
  2. **frontend (Build and Test APP):** Runs concurrently with database service integration. Pulls down `postgres:15` container services, downloads `contract-artifacts`, generates the Prisma client, deploys migrations, runs both the Frontend and Backend tests, and builds the Next.js production bundle.
  3. **deploy (Deploy Gate):** Triggers only on merges to master/main, outputting authorization once all tests pass.

---

## 📝 Product Proposal
See [PROPOSAL.md](file:///C:/Users/subho/OneDrive/Documents/midnight-t1/PROPOSAL.md)

---
<p align="center">Made with ❤️ for the Midnight Ecosystem</p>
