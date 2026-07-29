import React, { useState, useEffect } from 'react';
import { Send, Users, User, Search, UserPlus, Info, CheckCircle2, RefreshCw, ShieldAlert, Sparkles, ChevronDown, Lock, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

import { useMidnight } from '@/hooks/useMidnight';

interface Contact {
  walletAddress: string;
  name: string;
  purpose: string;
  amount: number;
}

interface Team {
  id: string;
  name: string;
  members?: Contact[];
}

interface PaymentDispatcherProps {
  onRedirectToContacts: () => void;
  onAddLog: (text: string) => void;
}

export const PaymentDispatcher: React.FC<PaymentDispatcherProps> = ({
  onRedirectToContacts,
  onAddLog,
}) => {
  const { callCircuit, isLoading: isMidnightLoading } = useMidnight();

  const [recipientType, setRecipientType] = useState<'user' | 'team'>('user');
  const [paymentRouting, setPaymentRouting] = useState<'shielded' | 'unshielded'>('shielded');
  
  // Team dispersal custom options
  const [teamPayMethod, setTeamPayMethod] = useState<'default' | 'custom'>('default');
  const [teamDispersalMethod, setTeamDispersalMethod] = useState<'batch' | 'sequential'>('batch');

  // Lists fetched from DB
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Selection state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Slide-down / Dropdown state
  const [isSlideDownOpen, setIsSlideDownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payment Form state
  const [amount, setAmount] = useState('150.00');
  const [memo, setMemo] = useState('Monthly distribution');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [txResult, setTxResult] = useState<{ success: boolean; txHash?: string; message?: string } | null>(null);
  const [circuitLogs, setCircuitLogs] = useState<string[]>([]);

  const fetchRosters = async () => {
    setIsLoadingList(true);
    try {
      const [contactsRes, teamsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/teams')
      ]);

      if (contactsRes.ok && teamsRes.ok) {
        setContacts(await contactsRes.json());
        setTeams(await teamsRes.json());
      }
    } catch (error) {
      console.error('Failed to load rosters for payment dispatcher:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRosters();
  }, []);

  const addressToBytes32 = (addr: string): Uint8Array => {
    const bytes = new Uint8Array(32);
    const clean = addr.replace(/[^a-fA-F0-9]/g, '').slice(0, 64);
    for (let i = 0; i < clean.length && i < 64; i += 2) {
      bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16) || 0;
    }
    return bytes;
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientType === 'user' && !selectedContact) return;
    if (recipientType === 'team' && !selectedTeam) return;

    setIsSending(true);
    setSendProgress(5);
    setTxResult(null);
    setCircuitLogs([]);

    try {
      if (recipientType === 'user' && selectedContact) {
        // Single user payment
        const payAmount = Number(amount) || 150;
        onAddLog(`Initiating ${paymentRouting} payment of ${payAmount} DUST to ${selectedContact.name}`);
        
        const recipientBytes = addressToBytes32(selectedContact.walletAddress);
        const result = await callCircuit('dispatch_payment', [recipientBytes, Math.round(payAmount)], { address: selectedContact.walletAddress });
        
        if (result.success) {
          setTxResult({
            success: true,
            txHash: result.txHash || 'tx_dummy_success',
            message: `ZK proof verified. Single payment of ${payAmount} DUST dispatched to ${selectedContact.name}.`
          });
          onAddLog(`✓ Payment of ${payAmount} DUST to ${selectedContact.name} confirmed. Tx: ${result.txHash}`);
          confetti({ particleCount: 50, spread: 60 });
        } else {
          throw new Error(result.error || 'Circuit execution failed');
        }
      } else if (recipientType === 'team' && selectedTeam) {
        // Team payment
        const members = selectedTeam.members || [];
        if (members.length === 0) {
          throw new Error('Roster team has no members.');
        }

        // Determine pay amounts
        const payouts = members.map(m => {
          const amt = teamPayMethod === 'default' ? (m.amount || 150) : (Number(amount) || 150);
          return {
            name: m.name,
            address: m.walletAddress,
            bytes: addressToBytes32(m.walletAddress),
            amount: Math.round(amt)
          };
        });

        const totalPay = payouts.reduce((sum, p) => sum + p.amount, 0);

        if (teamDispersalMethod === 'batch') {
          // Batch payment: One transaction
          onAddLog(`Initiating Batch Payment to team "${selectedTeam.name}" (${payouts.length} members). Total: ${totalPay} DUST`);
          
          // Construct Vectors (length 10)
          const recipientVectors = new Array(10).fill(new Uint8Array(32));
          const amountVectors = new Array(10).fill(0);
          
          payouts.slice(0, 10).forEach((p, idx) => {
            recipientVectors[idx] = p.bytes;
            amountVectors[idx] = p.amount;
          });

          const result = await callCircuit(
            'dispatch_multi_payment',
            [recipientVectors, amountVectors, payouts.length],
            { payouts: payouts.map(p => ({ address: p.address, amount: p.amount })) }
          );

          if (result.success) {
            setTxResult({
              success: true,
              txHash: result.txHash || 'tx_dummy_batch',
              message: `ZK Batch proof verified. Paid ${totalPay} DUST to ${payouts.length} team members in 1 transaction.`
            });
            onAddLog(`✓ Batch payout to team "${selectedTeam.name}" confirmed. Tx: ${result.txHash}`);
            confetti({ particleCount: 80, spread: 80 });
          } else {
            throw new Error(result.error || 'Batch circuit execution failed');
          }
        } else {
          // Sequential payment: Sign each individually
          onAddLog(`Initiating Sequential Sign-Only payout for team "${selectedTeam.name}" (${payouts.length} members).`);
          
          let successCount = 0;
          let lastTxHash = '';

          for (let i = 0; i < payouts.length; i++) {
            const p = payouts[i];
            onAddLog(`[${i+1}/${payouts.length}] Prompting signature for ${p.name} (${p.amount} DUST)...`);
            
            const result = await callCircuit('dispatch_payment', [p.bytes, p.amount], { address: p.address });
            if (result.success) {
              successCount++;
              lastTxHash = result.txHash || '';
              onAddLog(`✓ Signed and sent payout to ${p.name}. Tx: ${lastTxHash}`);
              setSendProgress(Math.round(((i + 1) / payouts.length) * 100));
            } else {
              onAddLog(`❌ Payout to ${p.name} was rejected or failed: ${result.error}`);
            }
          }

          setTxResult({
            success: successCount > 0,
            txHash: lastTxHash || 'tx_dummy_seq',
            message: `Sequential run complete. Successfully dispatched ${successCount}/${payouts.length} member payments.`
          });
          onAddLog(`✓ Team payout run completed. ${successCount} successful signatures.`);
          if (successCount > 0) confetti({ particleCount: 60, spread: 60 });
        }
      }
    } catch (err: any) {
      console.error(err);
      setTxResult({
        success: false,
        message: err.message || err.toString()
      });
      onAddLog(`❌ Payroll Dispatch Failed: ${err.message || err.toString()}`);
    } finally {
      setIsSending(false);
      setSendProgress(100);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card border border-line bg-card shadow-sm hover:border-[#c2ccc4] p-6 rounded-2xl">
      <div className="flex items-center space-x-3 pb-4 border-b border-line mb-4">
        <div className="p-2.5 bg-[#eef4ee] border border-line text-ink rounded-xl">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base text-ink font-bold leading-none">Payment Dispatcher</h2>
          <p className="text-xs text-muted mt-1">
            Configure and verify payroll distributions to contacts or teams
          </p>
        </div>
      </div>

      <div className="pt-2 space-y-4">
        <form onSubmit={handleSendPayment} className="space-y-4">
          
          {/* Recipient Type Select */}
          <div className="space-y-2">
            <label className="block text-[10px] text-muted uppercase font-bold tracking-wider font-mono">Recipient Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRecipientType('user');
                  setSelectedTeam(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${recipientType === 'user' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
              >
                <User className="w-3.5 h-3.5" />
                Individual User
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipientType('team');
                  setSelectedContact(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${recipientType === 'team' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
              >
                <Users className="w-3.5 h-3.5" />
                Team Roster
              </button>
            </div>
          </div>

          {/* Payment Routing Select (Shielded vs Unshielded) */}
          <div className="space-y-2">
            <label className="block text-[10px] text-muted uppercase font-bold tracking-wider font-mono">Privacy Level (Routing)</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentRouting('shielded')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${paymentRouting === 'shielded' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
              >
                <Lock className="w-3.5 h-3.5" />
                Shielded ZK
              </button>
              <button
                type="button"
                onClick={() => setPaymentRouting('unshielded')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${paymentRouting === 'unshielded' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                Unshielded Public
              </button>
            </div>
          </div>

          {/* User selector with search slide-down */}
          {recipientType === 'user' && (
            <div className="space-y-2 relative">
              <label className="block text-[10px] text-muted uppercase font-bold tracking-wider font-mono">Select Contact</label>
              
              <button
                type="button"
                onClick={() => setIsSlideDownOpen(!isSlideDownOpen)}
                className="w-full text-left bg-white border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink flex items-center justify-between hover:border-slate-400 transition cursor-pointer"
              >
                <span className="truncate">
                  {selectedContact ? `${selectedContact.name} (${selectedContact.purpose})` : 'Choose a contact...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isSlideDownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Contacts slide-down block */}
              {isSlideDownOpen && (
                <div className="absolute z-35 left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-2xl p-3 space-y-2 animate-fadeIn max-h-60 overflow-y-auto">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs w-full"
                    />
                  </div>

                  <div className="divide-y divide-line max-h-40 overflow-y-auto">
                    {isLoadingList ? (
                      <p className="text-center py-4 text-xs text-muted">Syncing DB...</p>
                    ) : filteredContacts.length === 0 ? (
                      <div className="py-4 text-center space-y-2">
                        <p className="text-xs text-muted">Contact not found</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSlideDownOpen(false);
                            onRedirectToContacts();
                          }}
                          className="text-xs text-[#546058] font-bold underline flex items-center justify-center gap-1 mx-auto hover:text-ink transition cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Add Contact Profile
                        </button>
                      </div>
                    ) : (
                      filteredContacts.map(c => (
                        <button
                          key={c.walletAddress}
                          type="button"
                          onClick={() => {
                            setSelectedContact(c);
                            setIsSlideDownOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left py-2 px-1 hover:bg-slate-50 transition text-xs block cursor-pointer"
                        >
                          <div className="font-bold text-ink">{c.name}</div>
                          <div className="text-[10px] text-muted truncate">{c.walletAddress}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Wallet ID display */}
              {selectedContact && (
                <div className="p-3 bg-[#fbfcfa] border border-line rounded-xl space-y-1">
                  <div className="text-[9px] text-muted uppercase font-mono tracking-wider font-semibold">Wallet ID / Address</div>
                  <div className="font-mono text-xs text-ink break-all select-all font-semibold">
                    {selectedContact.walletAddress}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team selector */}
          {recipientType === 'team' && (
            <div className="space-y-2">
              <label className="block text-[10px] text-muted uppercase font-bold tracking-wider font-mono">Select Team</label>
              <select
                onChange={(e) => {
                  const team = teams.find(t => t.id === e.target.value);
                  setSelectedTeam(team || null);
                }}
                className="w-full bg-white border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Choose a team roster...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {selectedTeam && (
                <div className="p-3 bg-[#fbfcfa] border border-line rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-muted uppercase font-mono tracking-wider font-semibold">
                    <span>Team Roster Members</span>
                    <Badge variant="emerald" className="text-[9px] bg-slate-100">{selectedTeam.members?.length || 0} People</Badge>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {selectedTeam.members?.map(m => (
                      <div key={m.walletAddress} className="flex justify-between items-center text-xs py-1.5 border-b border-line/40 last:border-b-0">
                        <div>
                          <span className="font-bold text-ink text-[11px]">{m.name}</span>
                          <span className="font-mono text-muted text-[10px] block">{m.walletAddress.substring(0, 10)}...</span>
                        </div>
                        <span className="font-mono font-bold text-[#31834b]">
                          ${m.amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Team pay parameters */}
                  <div className="pt-2 border-t border-line/60 space-y-2">
                    <label className="block text-[9px] text-muted uppercase font-bold tracking-wider font-mono">Team Pay Method</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTeamPayMethod('default')}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition ${teamPayMethod === 'default' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
                      >
                        Use Stored Amounts
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeamPayMethod('custom')}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition ${teamPayMethod === 'custom' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
                      >
                        Uniform Fixed Amount
                      </button>
                    </div>
                  </div>

                  {/* Team dispersal method */}
                  <div className="pt-1 space-y-2">
                    <label className="block text-[9px] text-muted uppercase font-bold tracking-wider font-mono">Dispersal Strategy</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTeamDispersalMethod('batch')}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition ${teamDispersalMethod === 'batch' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
                      >
                        Pay in 1 Txn (Batch)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeamDispersalMethod('sequential')}
                        className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition ${teamDispersalMethod === 'sequential' ? 'bg-[#eaf1ea] text-ink border-ink font-bold shadow-sm' : 'bg-white text-muted border-line hover:text-ink hover:border-ink'}`}
                      >
                        Sign Only (Sequential)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-muted uppercase font-bold tracking-wider mb-1 font-mono">
                {recipientType === 'team' && teamPayMethod === 'default' ? 'Amount (Disabled)' : 'Amount ($USD)'}
              </label>
              <Input
                type="number"
                value={recipientType === 'team' && teamPayMethod === 'default' ? '' : amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSending || (recipientType === 'team' && teamPayMethod === 'default')}
                placeholder={recipientType === 'team' && teamPayMethod === 'default' ? 'Stored Registry Amounts' : '150.00'}
                className="h-10 text-xs font-mono font-bold"
                required={!(recipientType === 'team' && teamPayMethod === 'default')}
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted uppercase font-bold tracking-wider mb-1 font-mono">Memo / Purpose</label>
              <Input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={isSending}
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSending || (recipientType === 'user' && !selectedContact) || (recipientType === 'team' && !selectedTeam)}
            className="new w-full gap-2 h-11 justify-center disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{paymentRouting === 'shielded' ? 'Generating ZK Proof...' : 'Broadcasting Transaction...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-lime" />
                <span>{paymentRouting === 'shielded' ? 'Send Shielded Payment' : 'Send Public Payment'}</span>
              </>
            )}
          </button>

          {/* Progress bar */}
          {isSending && (
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-line">
                <div
                  className="h-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${sendProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Transaction console output */}
          {txResult && (
            <div className={`p-3 border rounded-xl space-y-1.5 ${txResult.success ? 'bg-[#f4fbf4] border-line' : 'bg-red-50 border-red-200'}`}>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${txResult.success ? 'text-[#1c6434]' : 'text-red-800'}`}>
                {txResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-red-600" />}
                <span>{txResult.success ? 'Payment Dispatched Successfully' : 'Dispersal Interrupted'}</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${txResult.success ? 'text-[#31834b]' : 'text-red-700'}`}>
                {txResult.message && txResult.message.length > 120
                  ? txResult.message.slice(0, 120) + '…'
                  : txResult.message}
              </p>
              {txResult.success && txResult.txHash && txResult.txHash !== 'pending_confirmation' && (
                <div className="text-[9px] font-mono text-[#4c855a] break-all select-all leading-tight">
                  Tx: {txResult.txHash.slice(0, 40)}{txResult.txHash.length > 40 ? '…' : ''}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
