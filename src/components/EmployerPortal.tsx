'use client';

import React, { useState } from 'react';
import { Building2, Users, Layers, Plus, Lock, Filter } from 'lucide-react';
import { Employee, formatUSD, generateZKHash } from '@/lib/midroll-zk';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import confetti from 'canvas-confetti';

interface EmployerPortalProps {
  employees: Employee[];
  onAddEmployee: (newEmp: Employee) => void;
  treasuryBalanceUSD: number;
  onDepositTreasury: (amountUSD: number) => void;
}

export const EmployerPortal: React.FC<EmployerPortalProps> = ({
  employees,
  onAddEmployee,
  treasuryBalanceUSD,
  onDepositTreasury,
}) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');
  const [isDepositing, setIsDepositing] = useState(false);

  // New Worker Form
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [salaryMonthly, setSalaryMonthly] = useState('12000');

  const totalMonthlyPayroll = employees.reduce((acc, curr) => acc + curr.salaryMonthly, 0);
  const estimatedTaxWithheld = totalMonthlyPayroll * 0.23;

  const handleExecuteDeposit = () => {
    setIsDepositing(true);
    setTimeout(() => {
      onDepositTreasury(Number(depositAmount));
      setIsDepositing(false);
      setIsDepositModalOpen(false);
      confetti({ particleCount: 60, spread: 60 });
    }, 1200);
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    const monthlyVal = Number(salaryMonthly);
    const newEmp: Employee = {
      id: generateZKHash('emp_zk').substring(0, 12),
      name,
      role,
      department,
      salaryMonthly: monthlyVal,
      shieldedAddress: generateZKHash('0xmid_shield'),
      taxRateBasisPoints: 2200,
      status: 'STREAMING',
      streamVelocitySec: monthlyVal / (30 * 24 * 3600),
      viewingKey: generateZKHash('vk_night'),
      lastClaimTimestamp: Date.now(),
      totalClaimedUSD: 0,
    };

    onAddEmployee(newEmp);
    setIsAddWorkerModalOpen(false);
    setName('');
    setRole('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Banner */}
      <div className="card hero relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="eyebrow text-[#aebbb2] mb-2 font-mono">Corporate HR Treasury & Shielded Compliance</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ color: 'white' }}>
              TechCorp Midnight HR Portal
            </h1>
            <p className="text-sm text-[#aebbb2] mt-2 max-w-xl">
              Confidential payroll distribution powered by Compact zero-knowledge smart state.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="new shrink-0"
              style={{ background: 'var(--lime)', color: 'var(--ink)' }}
            >
              <Layers className="w-4 h-4" />
              <span>Deposit Shielded Batch</span>
            </button>

            <button
              onClick={() => setIsAddWorkerModalOpen(true)}
              className="new shrink-0"
              style={{ background: 'white', color: 'var(--ink)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Worker</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-mono text-[#aebbb2] tracking-wider">Shielded Treasury Commitment</div>
            <div className="text-xl font-bold text-white font-mono">{formatUSD(treasuryBalanceUSD)}</div>
            <div className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> Shielded Balance
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-mono text-[#aebbb2] tracking-wider">Total Monthly Payroll Rate</div>
            <div className="text-xl font-bold text-[#d7ff65] font-mono">{formatUSD(totalMonthlyPayroll)}</div>
            <div className="text-[10px] text-[#aebbb2] font-mono">across {employees.length} employees</div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-mono text-[#aebbb2] tracking-wider">Estimated ZK Tax Withholding</div>
            <div className="text-xl font-bold text-[#ffdbda] font-mono">{formatUSD(estimatedTaxWithheld)}</div>
            <div className="text-[10px] text-[#ffdbda]/80 font-mono">ZKP Tax Remittance Ready</div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-mono text-[#aebbb2] tracking-wider">PayFlow Velocity</div>
            <div className="text-xl font-bold text-[#ddd3ff] font-mono">
              ${(totalMonthlyPayroll / (30 * 24 * 3600)).toFixed(4)}/sec
            </div>
            <div className="text-[10px] text-[#ddd3ff] font-mono">Real-time Stream Active</div>
          </div>
        </div>
        <div className="orb"></div>
      </div>

      {/* Roster Table Card */}
      <div className="card">
        <div className="card-head pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2>Confidential Employee Roster</h2>
            <p className="text-xs text-muted mt-1">Salaries and identities protected via client-side viewing keys</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef4ee] border border-line text-ink">
            <Filter className="w-3.5 h-3.5 text-ink" />
            <span>Department: All</span>
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted uppercase tracking-wider font-mono">
                <th className="pb-3 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Monthly Pay</th>
                <th className="pb-3 font-semibold">Stream Status</th>
                <th className="pb-3 font-semibold">Viewing Key</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#fbfcfa] transition">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-ink">{emp.name}</div>
                    <div className="text-xs text-muted">{emp.role}</div>
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f0efff] border border-[#ddd3ff] text-[#4f46e5]">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-semibold text-ink">
                    {formatUSD(emp.salaryMonthly)}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c6f6d5] border border-[#a3e9b9] text-[#1c6434]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Streaming
                    </span>
                  </td>
                  <td className="py-4 text-xs font-mono text-muted">
                    {emp.viewingKey.substring(0, 16)}...
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => alert(`Viewing Key hash for ${emp.name}:\n${emp.viewingKey}\n\nShielded Address:\n${emp.shieldedAddress}`)}
                      className="new py-1.5 px-3 text-xs bg-[#eef4ee] border border-line text-ink font-semibold"
                      style={{ background: 'white', color: 'var(--ink)', border: '1px solid var(--line)', padding: '6px 12px' }}
                    >
                      Audit Key
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Shielded Payroll Treasury</DialogTitle>
            <DialogDescription>
              Funds are committed into the Compact contract state commitment pool.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Deposit Amount (USDC-M)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="font-mono text-xl font-bold"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isDepositing} onClick={handleExecuteDeposit} type="submit">
              {isDepositing ? 'Depositing...' : 'Confirm Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Worker Modal */}
      <Dialog open={isAddWorkerModalOpen} onOpenChange={setIsAddWorkerModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Confidential Employee to Payroll</DialogTitle>
            <DialogDescription>Enrolls employee with client-side ZK viewing key</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWorker} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Full Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. Samantha Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Role Title</label>
              <Input
                type="text"
                required
                placeholder="e.g. Zero-Knowledge Researcher"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Zero-Knowledge R&D">Zero-Knowledge R&D</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                  <option value="Smart Contracts">Smart Contracts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 font-mono">Monthly Pay (USD)</label>
                <Input
                  type="number"
                  required
                  value={salaryMonthly}
                  onChange={(e) => setSalaryMonthly(e.target.value)}
                  className="font-mono text-base"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddWorkerModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Enroll Worker
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
