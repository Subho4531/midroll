// MidRoll ZK Proof Engine & State Manager
// Privacy Payroll, Shielded Expenses & Anonymous Governance for Midnight Blockchain

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salaryMonthly: number;
  shieldedAddress: string;
  taxRateBasisPoints: number;
  status: 'ACTIVE' | 'PAUSED' | 'STREAMING';
  streamVelocitySec: number;
  viewingKey: string;
  lastClaimTimestamp: number;
  totalClaimedUSD: number;
}

export interface ExpenseReceipt {
  id: string;
  merchantName: string;
  category: 'Travel & Lodging' | 'Software & Cloud' | 'Meals & Entertainment' | 'Hardware';
  amountUSD: number;
  date: string;
  employeeShieldedId: string;
  zkProofStatus: 'PENDING_ZK' | 'VERIFIED_SHIELDED' | 'REIMBURSED';
  proofCommitment: string;
  receiptPolicyLimit: number;
}

export interface GovernancePoll {
  id: string;
  title: string;
  category: 'Compensation Equity' | 'Workplace Policy' | 'Treasury Allocation' | 'Security Alert';
  description: string;
  options: { text: string; votesCount: number }[];
  totalVotes: number;
  status: 'ACTIVE' | 'CLOSED';
  deadline: string;
  userVotedOption?: number;
}

export interface WhistleblowerReport {
  id: string;
  timestamp: string;
  category: 'Financial Irregularity' | 'Security Breach' | 'HR Harassment' | 'Compliance Violation';
  encryptedContent: string;
  zkPayrollProofHash: string;
  nullifierHash: string;
  investigationStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED_ACTIONED';
}

// Initial Mock Data
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_zk_9821',
    name: 'Elena Rostova (You)',
    role: 'Lead Cryptographer',
    department: 'Core Protocol',
    salaryMonthly: 14500,
    shieldedAddress: '0xmid_shield_9f82a1...bc7',
    taxRateBasisPoints: 2400,
    status: 'STREAMING',
    streamVelocitySec: 14500 / (30 * 24 * 3600),
    viewingKey: 'vk_night_8871ab9f029c...33a',
    lastClaimTimestamp: Date.now() - 3600 * 48,
    totalClaimedUSD: 28400,
  },
  {
    id: 'emp_zk_4410',
    name: 'Marcus Vance',
    role: 'Senior Rust Engineer',
    department: 'Zero-Knowledge R&D',
    salaryMonthly: 12000,
    shieldedAddress: '0xmid_shield_3c41e8...d90',
    taxRateBasisPoints: 2200,
    status: 'STREAMING',
    streamVelocitySec: 12000 / (30 * 24 * 3600),
    viewingKey: 'vk_night_1120ff78...90e',
    lastClaimTimestamp: Date.now() - 3600 * 24,
    totalClaimedUSD: 36000,
  },
];

export const INITIAL_RECEIPTS: ExpenseReceipt[] = [
  {
    id: 'rec_881',
    merchantName: 'AWS Cloud Compute',
    category: 'Software & Cloud',
    amountUSD: 1420.50,
    date: '2026-07-22',
    employeeShieldedId: 'emp_zk_9821',
    zkProofStatus: 'REIMBURSED',
    proofCommitment: '0xproof_zk_aws_9912003881a',
    receiptPolicyLimit: 2500,
  },
  {
    id: 'rec_882',
    merchantName: 'Grand Hyatt Conference',
    category: 'Travel & Lodging',
    amountUSD: 890.00,
    date: '2026-07-23',
    employeeShieldedId: 'emp_zk_9821',
    zkProofStatus: 'VERIFIED_SHIELDED',
    proofCommitment: '0xproof_zk_hyatt_441890aa',
    receiptPolicyLimit: 1500,
  },
];

export const INITIAL_POLLS: GovernancePoll[] = [
  {
    id: 'poll_101',
    title: 'Q3 Salary Equity & Compensation Transparency Policy',
    category: 'Compensation Equity',
    description: 'Should MidRoll mandate zero-knowledge band transparency for all engineering roles?',
    options: [
      { text: 'Yes, adopt ZK-Band Transparency', votesCount: 28 },
      { text: 'Keep existing confidential model', votesCount: 6 },
      { text: 'Abstain', votesCount: 2 },
    ],
    totalVotes: 36,
    status: 'ACTIVE',
    deadline: '2026-08-01',
  },
  {
    id: 'poll_102',
    title: 'Remote Work Hardware Stipend Allocation',
    category: 'Workplace Policy',
    description: 'Reallocate 5% of unspent treasury into annual $2,000 ergonomic equipment stipend.',
    options: [
      { text: 'Approve $2,000 Equipment Stipend', votesCount: 31 },
      { text: 'Reject Proposal', votesCount: 3 },
    ],
    totalVotes: 34,
    status: 'ACTIVE',
    deadline: '2026-08-05',
  },
];

export const INITIAL_WHISTLEBLOWER_REPORTS: WhistleblowerReport[] = [
  {
    id: 'wb_701',
    timestamp: '2026-07-20 14:22',
    category: 'Security Breach',
    encryptedContent: 'ENCRYPTED_PGP_ALERT: Potential un-sanitized endpoint in staging environment.',
    zkPayrollProofHash: '0xzk_proof_emp_valid_9981a',
    nullifierHash: '0xnullifier_wb_1120a',
    investigationStatus: 'VERIFIED_ACTIONED',
  },
];

export function formatUSD(val: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function generateZKHash(prefix: string = '0xzk'): string {
  const chars = '0123456789abcdef';
  let res = prefix + '_';
  for (let i = 0; i < 32; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}
