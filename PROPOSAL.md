# Product Proposal

> **Submission status:** Submitted for programme approval.

## What is the product, and who uses it?

**MidRoll** is a privacy-preserving corporate payroll and employee compliance protocol that allows organizations to issue salary commitments, verify corporate membership for anonymous governance voting, and disburse corporate expense reimbursements without exposing sensitive corporate financials, salary figures, employee names, or whistleblower identities to the public ledger.

The product is used by:
* **Decentralized Autonomous Organizations (DAOs):** Who require anonymous voting gates based on proof of active payroll contribution or salary tier.
* **Remote-First Web3 Startups:** Who disburse recurring salary payments globally while keeping payroll sheets private to prevent internal conflicts and protect corporate security.
* **Corporate Treasuries:** Who verify and process expense claims against corporate policy limits without exposing sensitive itemized receipts or payment card data to the public.
* **Internal Compliance and Audit Teams:** Who manage anonymous compliance alert systems (whistleblower gates) that allow employees to securely log compliance issues.

---

## Why Midnight specifically?

Traditional blockchains are completely transparent, meaning all transaction values, wallet balances, and transfer origins/destinations are fully public and visible forever. This makes corporate payouts, payroll distribution, and internal compliance/whistleblowing impossible to run directly on-chain because of competitive risk, commercial confidentiality, and employee privacy regulations (such as GDPR).

Midnight enables selective disclosure, allowing workers to verify their payroll status or satisfy expense policy thresholds through client-side Zero-Knowledge proofs without revealing their actual identity, salary tier, wallet address, or itemized receipt details on-chain.

With Midnight:
* **Salary Confidentiality:** Corporate payroll lists and individual salary figures remain private.
* **Shielded Payout Routing:** Expense reimbursements are paid directly to shielded/stealth addresses, hiding the link between company treasury and the employee's personal wallet.
* **Retaliation-Free whistleblowing:** Compliance alerts and governance votes are verified valid without linking the action to a specific employee identity.
* **Auditable Compliance:** The company proves policy compliance to observers (e.g. cumulative reimbursed expenses) without exposing proprietary commercial information.

---

## Data Model

| Data Point                      | Type                 | Disclosed To        |
| ------------------------------- | -------------------- | ------------------- |
| Verification of payroll status  | Private witness      | No one              |
| Employee private key & salt     | Private witness      | No one              |
| Raw salary size in cents        | Private witness      | No one              |
| Itemized purchase details       | Private witness      | No one              |
| Whistleblower identity          | Private witness      | No one              |
| Treasury commitment pool        | Public ledger        | Everyone            |
| Spent nullifiers root           | Public ledger        | Everyone            |
| Payout success / boolean        | Public ledger        | Everyone            |
| Shielded payout amount          | Public ledger        | Everyone            |
| Destination stealth address     | Public ledger        | Receiver only       |

---

## Mainnet Feasibility

MidRoll is a highly practical corporate dApp that is fully realistic to reach Mainnet deployment.

Corporate compliance, payroll, and private employee governance are immediate real-world business needs. As the Midnight Network matures, MidRoll can expand from local testnets to enterprise mainnets. Future extensions include native integrations with decentralized payroll providers, corporate banking APIs, and Web3 oracle networks for automated payroll stream triggers.
