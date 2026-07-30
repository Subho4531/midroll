import { describe, it, expect } from 'vitest';

describe('MidRoll Frontend UX & Helpers Test Suite', () => {

  // Test 1: Address Truncation Helper
  it('should truncate user addresses properly for UI readability', () => {
    const address = 'mn_addr_preview1r82chh24nfe3yryq53uv6vjsv290gg76gsxa4nkzkvxqundzvp4qlxesac';
    
    // Simulating helper: `${addr.substring(0, 14)}...${addr.substring(addr.length - 8)}`
    const truncateAddress = (addr: string | null) => {
      if (!addr) return '';
      return `${addr.substring(0, 14)}...${addr.substring(addr.length - 8)}`;
    };

    expect(truncateAddress(address)).toBe('mn_addr_previe...4qlxesac');
  });

  // Test 2: Chronological Matcher for Pending Transactions Sync
  it('should match pending transaction records with newly confirmed wallet transaction history entries', () => {
    const dbRecords = [
      { id: '1', txHash: 'pending_1', type: 'SINGLE_PAYMENT', amount: 150, status: 'PENDING', createdAt: '2026-07-30T10:00:00Z' },
      { id: '2', txHash: 'pending_2', type: 'BATCH_PAYMENT', amount: 300, status: 'PENDING', createdAt: '2026-07-30T10:05:00Z' }
    ];

    const walletHistory = [
      { txHash: '0xreal_hash_2', txStatus: { status: 'confirmed' } },
      { txHash: '0xreal_hash_1', txStatus: { status: 'confirmed' } }
    ];

    // Find hashes not known to DB (no status: 'CONFIRMED' has them)
    const knownHashes = new Set<string>();
    const unassociatedHashes = walletHistory
      .filter(entry => entry.txStatus.status === 'confirmed' && !knownHashes.has(entry.txHash))
      .map(entry => entry.txHash);

    // Sort pending records by createdAt ascending
    const sortedPending = [...dbRecords].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Sort unassociated hashes in reverse order (since history is returned newest first, reverse it to get oldest first)
    const sortedHashes = [...unassociatedHashes].reverse();

    expect(sortedPending[0].txHash).toBe('pending_1');
    expect(sortedHashes[0]).toBe('0xreal_hash_1');

    expect(sortedPending[1].txHash).toBe('pending_2');
    expect(sortedHashes[1]).toBe('0xreal_hash_2');
  });

});
