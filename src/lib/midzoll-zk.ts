// MidZoll ZK Proof Engine & State Manager

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salaryMonthly: number; // in USD
  shieldedAddress: string;
  taxRateBasisPoints: number; // e.g. 2200 = 22%
  status: 'ACTIVE' | 'PAUSED' | 'STREAMING';
  streamVelocitySec: number; // $ earned per second
  viewingKey: string;
  lastClaimTimestamp: number;
  totalClaimedUSD: number;
}

export interface ZKProofCredential {
  proofId: string;
  timestamp: string;
  type: 'INCOME_THRESHOLD' | 'EMPLOYMENT_VERIFICATION' | 'TAX_COMPLIANCE' | 'MILESTONE_BONUS';
  thresholdUSD?: number;
  subjectName: string; // Shielded or public
  auditorRecipient: string; // e.g. Chase Bank / Apex Landlord
  proofHash: string;
  nullifierHash: string;
  verifiableStatement: string;
  status: 'SYNTHESIZING' | 'VALID' | 'REVOKED';
  zkCircuitMetadata: {
    protocol: 'Groth16 over BLS12-381' | 'Plonk zk-SNARK';
    constraintsCount: number;
    provingTimeMs: number;
    publicInputs: string[];
  };
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
    taxRateBasisPoints: 2400, // 24%
    status: 'STREAMING',
    streamVelocitySec: 14500 / (30 * 24 * 3600), // ~$0.00559/sec
    viewingKey: 'vk_night_8871ab9f029c...33a',
    lastClaimTimestamp: Date.now() - 3600 * 48, // 2 days ago
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
  {
    id: 'emp_zk_7712',
    name: 'Aisha Patel',
    role: 'Zero-Knowledge Auditor',
    department: 'Security & Compliance',
    salaryMonthly: 13200,
    shieldedAddress: '0xmid_shield_7a10dd...44e',
    taxRateBasisPoints: 2500,
    status: 'STREAMING',
    streamVelocitySec: 13200 / (30 * 24 * 3600),
    viewingKey: 'vk_night_9921bb03...12f',
    lastClaimTimestamp: Date.now() - 3600 * 12,
    totalClaimedUSD: 19800,
  },
  {
    id: 'emp_zk_3309',
    name: 'Devon Takahashi',
    role: 'DeFi Protocol Architect',
    department: 'Smart Contracts',
    salaryMonthly: 15000,
    shieldedAddress: '0xmid_shield_6612ee...881',
    taxRateBasisPoints: 2600,
    status: 'STREAMING',
    streamVelocitySec: 15000 / (30 * 24 * 3600),
    viewingKey: 'vk_night_4490aa11...55c',
    lastClaimTimestamp: Date.now() - 3600 * 72,
    totalClaimedUSD: 45000,
  }
];

export const INITIAL_RECEIPTS: ExpenseReceipt[] = [
  {
    id: 'rec_881',
    merchantName: 'AWS Cloud Services',
    category: 'Software & Cloud',
    amountUSD: 1420.50,
    date: '2026-07-22',
    employeeShieldedId: 'emp_zk_9821',
    zkProofStatus: 'REIMBURSED',
    proofCommitment: '0xproof_zk_aws_9912003881a'
  },
  {
    id: 'rec_882',
    merchantName: 'Grand Hyatt San Francisco',
    category: 'Travel & Lodging',
    amountUSD: 890.00,
    date: '2026-07-23',
    employeeShieldedId: 'emp_zk_9821',
    zkProofStatus: 'VERIFIED_SHIELDED',
    proofCommitment: '0xproof_zk_hyatt_441890aa'
  }
];

// Helper to format currency
export function formatUSD(val: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

// Generate realistic dummy ZK Hash
export function generateZKHash(prefix: string = '0xzk'): string {
  const chars = '0123456789abcdef';
  let res = prefix + '_';
  for (let i = 0; i < 32; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}
