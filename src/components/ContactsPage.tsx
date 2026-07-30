import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Upload, ShieldAlert, CheckCircle2, Search, Trash2, Plus, Info, ListFilter, ArrowRight } from 'lucide-react';
import { useLaceWallet } from '@/lib/lace-wallet-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

interface Contact {
  walletAddress: string;
  name: string;
  purpose: string;
  amount: number;
  createdAt: string;
  teams?: Team[];
}

interface Team {
  id: string;
  name: string;
  members?: Contact[];
  createdAt: string;
}

export const ContactsPage: React.FC = () => {
  const { walletAddress } = useLaceWallet();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Individual Contact Form State
  const [cName, setCName] = useState('');
  const [cWallet, setCWallet] = useState('');
  const [cPurpose, setCPurpose] = useState('');
  const [cAmount, setCAmount] = useState('150.00');
  const [isCreatingContact, setIsCreatingContact] = useState(false);

  // Team Form State
  const [tName, setTName] = useState('');
  const [tMethod, setTMethod] = useState<'manual' | 'csv'>('manual');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  
  // Manual Team Members State
  const [manualMembers, setManualMembers] = useState<{ name: string; walletAddress: string; purpose: string; amount: string }[]>([
    { name: '', walletAddress: '', purpose: '', amount: '150.00' }
  ]);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ name: string; walletAddress: string; purpose: string; amount: string }[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create-contact' | 'create-team'>('list');

  const fetchData = async () => {
    if (!walletAddress) {
      setContacts([]);
      setTeams([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [contactsRes, teamsRes] = await Promise.all([
        fetch(`/api/contacts?walletAddress=${encodeURIComponent(walletAddress)}`),
        fetch(`/api/teams?walletAddress=${encodeURIComponent(walletAddress)}`)
      ]);

      if (!contactsRes.ok || !teamsRes.ok) {
        throw new Error('Failed to fetch data from the server.');
      }

      const contactsData = await contactsRes.json();
      const teamsData = await teamsRes.json();

      setContacts(contactsData);
      setTeams(teamsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [walletAddress]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cWallet || !cPurpose) return;

    setIsCreatingContact(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cName,
          walletAddress: cWallet,
          purpose: cPurpose,
          amount: Number(cAmount) || 0.0,
          adminWalletAddress: walletAddress
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }

      confetti({ particleCount: 60, spread: 60 });
      setCName('');
      setCWallet('');
      setCPurpose('');
      setCAmount('150.00');
      setActiveSubTab('list');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsCreatingContact(false);
    }
  };

  // CSV parsing
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const parsed: { name: string; walletAddress: string; purpose: string; amount: string }[] = [];
      const startIndex = lines[0].toLowerCase().includes('wallet') || lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
          parsed.push({
            name: parts[0].trim(),
            walletAddress: parts[1].trim(),
            purpose: parts[2] ? parts[2].trim() : 'Team Member',
            amount: parts[3] ? parts[3].trim() : '150.00'
          });
        }
      }

      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleAddManualMemberRow = () => {
    setManualMembers([...manualMembers, { name: '', walletAddress: '', purpose: '', amount: '150.00' }]);
  };

  const handleRemoveManualMemberRow = (index: number) => {
    setManualMembers(manualMembers.filter((_, idx) => idx !== index));
  };

  const handleManualMemberChange = (index: number, field: string, value: string) => {
    const updated = [...manualMembers];
    updated[index] = { ...updated[index], [field]: value };
    setManualMembers(updated);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName) return;

    setIsCreatingTeam(true);
    try {
      let membersPayload: { name: string; walletAddress: string; purpose: string; amount: number }[] = [];

      if (tMethod === 'csv') {
        membersPayload = csvPreview.map(m => ({
          name: m.name,
          walletAddress: m.walletAddress,
          purpose: m.purpose,
          amount: Number(m.amount) || 0.0
        }));
      } else {
        // filter out rows that don't have name and walletAddress
        membersPayload = manualMembers
          .filter(m => m.name.trim() && m.walletAddress.trim())
          .map(m => ({
            name: m.name,
            walletAddress: m.walletAddress,
            purpose: m.purpose,
            amount: Number(m.amount) || 0.0
          }));
      }

      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tName,
          members: membersPayload,
          adminWalletAddress: walletAddress
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create team');
      }

      confetti({ particleCount: 80, spread: 70 });
      setTName('');
      setManualMembers([{ name: '', walletAddress: '', purpose: '', amount: '150.00' }]);
      setCsvFile(null);
      setCsvPreview([]);
      setActiveSubTab('list');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'An error occurred while creating the team.');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="eyebrow text-[#aebbb2] mb-2 font-mono">Shielded Directory & Team Access Control</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ color: 'white' }}>
              Contacts & Teams Registry
            </h1>
            <p className="text-sm text-[#aebbb2] mt-2 max-w-xl">
              Securely store recipient wallet addresses and compile payment distribution rosters.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveSubTab('create-contact')}
              className={`new shrink-0 ${activeSubTab === 'create-contact' ? 'bg-[#25332b]' : ''}`}
              style={{ background: 'white', color: 'var(--ink)' }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>

            <button
              onClick={() => setActiveSubTab('create-team')}
              className={`new shrink-0 ${activeSubTab === 'create-team' ? 'bg-[#25332b]' : ''}`}
              style={{ background: 'var(--lime)', color: 'var(--ink)' }}
            >
              <Users className="w-4 h-4" />
              <span>Create Team</span>
            </button>
          </div>
        </div>
        <img 
                  src="/images/unsheilded.png" 
                  alt="Shielded Token Balance Background" 
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-105 z-0 opacity-20"
                />
      </div>

      {/* Main Panel Routing */}
      {error && (
        <div className="p-4 bg-rose/10 border border-rose/30 rounded-xl text-rose flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to query Postgres DB</p>
            <p className="text-xs text-muted mt-0.5">{error}</p>
            <button onClick={fetchData} className="text-xs font-semibold underline mt-2">Retry</button>
          </div>
        </div>
      )}

      {/* Subtab selection indicator */}
      {activeSubTab !== 'list' && (
        <div className="flex justify-start">
          <button 
            onClick={() => setActiveSubTab('list')}
            className="period flex items-center gap-1.5 font-bold"
          >
            ← Back to Directory List
          </button>
        </div>
      )}

      {activeSubTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contacts Directory Column */}
          <div className="card lg:col-span-2 space-y-4">
            <div className="card-head pb-2 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2>Contacts Directory</h2>
                <p className="text-xs text-muted mt-1">Individual recipients and their purpose mappings</p>
              </div>

              {/* Search contacts */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted pointer-events-none" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs uppercase font-mono tracking-widest font-semibold">Loading Postgres data...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-line rounded-2xl bg-white">
                <Info className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="font-semibold text-ink">No contacts found</p>
                <p className="text-xs text-muted mt-0.5">Add contacts or create a team to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs text-muted uppercase tracking-wider font-mono">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Wallet Address</th>
                      <th className="pb-3 font-semibold">Purpose</th>
                      <th className="pb-3 font-semibold text-right">Default Pay ($USD)</th>
                      <th className="pb-3 font-semibold pl-4">Teams</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.walletAddress} className="hover:bg-[#fbfcfa] transition">
                        <td className="py-4 font-bold text-ink">{contact.name}</td>
                        <td className="py-4 font-mono text-xs text-ink">
                          <span className="bg-[#eef4ee] px-2 py-1 rounded border border-line select-all">
                            {contact.walletAddress}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-muted">{contact.purpose}</td>
                        <td className="py-4 text-xs font-mono text-right font-bold text-[#31834b]">
                          ${contact.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-4 text-xs pl-4">
                          {contact.teams && contact.teams.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {contact.teams.map(t => (
                                <Badge key={t.id} variant="secondary" className="text-[10px] bg-slate-100 font-medium">
                                  {t.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Teams Column */}
          <div className="card space-y-4">
            <div className="card-head pb-2 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2>Teams Compiled</h2>
                <p className="text-xs text-muted mt-1">Multi-recipient rosters</p>
              </div>
            </div>

            {/* Team search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted pointer-events-none" />
              <Input
                placeholder="Search teams..."
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted">
                <p className="text-xs uppercase font-mono tracking-widest font-semibold">Syncing teams...</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-line rounded-2xl">
                <p className="text-xs text-muted">No teams created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="p-4 bg-[#fbfcfa] border border-line rounded-2xl hover:border-slate-300 transition space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-ink text-sm">{team.name}</h3>
                        <p className="text-[10px] text-muted font-mono">{team.id.substring(0, 8)}...</p>
                      </div>
                      <Badge variant="emerald" className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                        {team.members?.length || 0} Members
                      </Badge>
                    </div>

                    {team.members && team.members.length > 0 && (
                      <div className="pt-2 border-t border-line/50 space-y-1">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider font-semibold">Members:</div>
                        <div className="max-h-24 overflow-y-auto space-y-1 text-xs pr-1">
                          {team.members.map(member => (
                            <div key={member.walletAddress} className="flex justify-between items-center bg-white p-1.5 rounded border border-line/60">
                              <span className="font-semibold text-ink text-[11px]">{member.name}</span>
                              <span className="text-[9px] font-mono text-muted">{member.walletAddress.substring(0, 6)}...</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'create-contact' && (
        <div className="max-w-xl mx-auto card space-y-6">
          <div className="pb-3 border-b border-line">
            <h2>Add Individual Contact</h2>
            <p className="text-xs text-muted mt-1">Insert a new recipient profile into the PostgreSQL database</p>
          </div>

          <form onSubmit={handleCreateContact} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">Recipient Full Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. Alice Johnson"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">Wallet Address (Primary Key)</label>
              <Input
                type="text"
                required
                placeholder="e.g. 0x0123...4567"
                value={cWallet}
                onChange={(e) => setCWallet(e.target.value)}
                className="w-full font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">Purpose / Memo</label>
              <Input
                type="text"
                required
                placeholder="e.g. Contract Engineering Reimbursements"
                value={cPurpose}
                onChange={(e) => setCPurpose(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">Default Pay Amount ($USD)</label>
              <Input
                type="number"
                required
                placeholder="e.g. 150.00"
                value={cAmount}
                onChange={(e) => setCAmount(e.target.value)}
                className="w-full font-mono"
              />
            </div>

            <div className="pt-2 border-t border-line flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveSubTab('list')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingContact} style={{ background: 'var(--ink)', color: 'white' }}>
                {isCreatingContact ? 'Saving...' : 'Add Contact Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === 'create-team' && (
        <div className="max-w-2xl mx-auto card space-y-6">
          <div className="pb-3 border-b border-line">
            <h2>Compile New Roster Team</h2>
            <p className="text-xs text-muted mt-1">Bundle multiple payment recipients together under a single group</p>
          </div>

          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono mb-1.5">Team Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. Q3 Design Contractors"
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider font-mono">Members Import Method</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTMethod('manual')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition text-center ${tMethod === 'manual' ? 'border-ink bg-slate-50 font-bold' : 'border-line bg-white'}`}
                >
                  Manually Add Fields
                </button>
                <button
                  type="button"
                  onClick={() => setTMethod('csv')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition text-center ${tMethod === 'csv' ? 'border-ink bg-slate-50 font-bold' : 'border-line bg-white'}`}
                >
                  Upload CSV File
                </button>
              </div>
            </div>

            {tMethod === 'manual' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">Roster Ranks</h3>
                  <button
                    type="button"
                    onClick={handleAddManualMemberRow}
                    className="period py-1 px-3 flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Add Member Row
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {manualMembers.map((member, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-[#fbfcfa] p-3 rounded-2xl border border-line">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => handleManualMemberChange(idx, 'name', e.target.value)}
                          className="h-9 text-xs"
                          required={idx === 0}
                        />
                        <Input
                          placeholder="Wallet Address"
                          value={member.walletAddress}
                          onChange={(e) => handleManualMemberChange(idx, 'walletAddress', e.target.value)}
                          className="h-9 text-xs font-mono"
                          required={idx === 0}
                        />
                        <Input
                          placeholder="Purpose (optional)"
                          value={member.purpose}
                          onChange={(e) => handleManualMemberChange(idx, 'purpose', e.target.value)}
                          className="h-9 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Amount ($USD)"
                          value={member.amount}
                          onChange={(e) => handleManualMemberChange(idx, 'amount', e.target.value)}
                          className="h-9 text-xs font-mono"
                          required={idx === 0}
                        />
                      </div>

                      {manualMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveManualMemberRow(idx)}
                          className="text-slate-400 hover:text-rose p-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tMethod === 'csv' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-line rounded-2xl p-6 text-center hover:bg-slate-50 transition relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="font-semibold text-sm">Select CSV File</p>
                  <p className="text-xs text-muted mt-1">Columns required: Name, WalletAddress, Purpose, Amount (Optional)</p>
                  {csvFile && (
                    <Badge variant="emerald" className="mt-3 text-xs bg-emerald-50 text-emerald-700">
                      File: {csvFile.name}
                    </Badge>
                  )}
                </div>

                {csvPreview.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">CSV Preview ({csvPreview.length} found)</h3>
                    <div className="max-h-[220px] overflow-y-auto border border-line rounded-2xl divide-y divide-line bg-[#fbfcfa] text-xs">
                      {csvPreview.map((row, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center gap-4 hover:bg-white">
                          <div>
                            <span className="font-bold text-ink">{row.name}</span>
                            <span className="text-[10px] text-muted block">{row.purpose} | ${row.amount}</span>
                          </div>
                          <span className="font-mono text-muted text-[10px] truncate max-w-[200px]">{row.walletAddress}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-line flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveSubTab('list')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingTeam} style={{ background: 'var(--ink)', color: 'white' }}>
                {isCreatingTeam ? 'Assembling...' : 'Assemble Team Roster'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
