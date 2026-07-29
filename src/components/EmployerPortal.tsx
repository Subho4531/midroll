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
      <Card className="border-indigo-900/40 bg-slate-950/90 shadow-2xl relative overflow-hidden">
        <CardHeader className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Corporate HR Treasury & Shielded Compliance</span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-white">
                TechCorp <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Midnight HR Portal</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-300 mt-1 max-w-xl">
                Confidential payroll distribution powered by Compact zero-knowledge smart state.
              </CardDescription>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Button variant="cyan" size="lg" onClick={() => setIsDepositModalOpen(true)} className="gap-2">
                <Layers className="w-4 h-4" />
                <span>Deposit Shielded Batch</span>
              </Button>

              <Button variant="secondary" size="lg" onClick={() => setIsAddWorkerModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add Worker</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-900/40">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-900/40 space-y-1">
              <div className="text-xs text-slate-400">Shielded Treasury Commitment</div>
              <div className="text-2xl font-bold text-white font-mono">{formatUSD(treasuryBalanceUSD)}</div>
              <div className="text-[11px] text-cyan-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Shielded Balance
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-900/40 space-y-1">
              <div className="text-xs text-slate-400">Total Monthly Payroll Rate</div>
              <div className="text-2xl font-bold text-cyan-300 font-mono">{formatUSD(totalMonthlyPayroll)}</div>
              <div className="text-[11px] text-slate-400">across {employees.length} employees</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-900/40 space-y-1">
              <div className="text-xs text-slate-400">Estimated ZK Tax Withholding</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">{formatUSD(estimatedTaxWithheld)}</div>
              <div className="text-[11px] text-amber-300/80">ZKP Tax Remittance Ready</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-900/40 space-y-1">
              <div className="text-xs text-slate-400">PayFlow Velocity</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                ${(totalMonthlyPayroll / (30 * 24 * 3600)).toFixed(4)}/sec
              </div>
              <div className="text-[11px] text-emerald-400">Real-time Stream Active</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Roster Table Card */}
      <Card className="border-indigo-900/40">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Confidential Employee Roster</span>
            </CardTitle>
            <CardDescription>Salaries and identities protected via client-side viewing keys</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Department: All</span>
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-indigo-900/40 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Monthly Pay</th>
                  <th className="pb-3 font-semibold">Stream Status</th>
                  <th className="pb-3 font-semibold">Viewing Key</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-900/30 text-slate-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-white">{emp.name}</div>
                      <div className="text-xs text-slate-400">{emp.role}</div>
                    </td>
                    <td className="py-4">
                      <Badge variant="secondary">{emp.department}</Badge>
                    </td>
                    <td className="py-4 font-mono font-semibold text-cyan-300">
                      {formatUSD(emp.salaryMonthly)}
                    </td>
                    <td className="py-4">
                      <Badge variant="emerald">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Streaming
                      </Badge>
                    </td>
                    <td className="py-4 text-xs font-mono text-slate-400">
                      {emp.viewingKey.substring(0, 16)}...
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => alert(`Viewing Key hash for ${emp.name}:\n${emp.viewingKey}\n\nShielded Address:\n${emp.shieldedAddress}`)}
                      >
                        Audit Key
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deposit Amount (USDC-M)</label>
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
            <Button variant="cyan" disabled={isDepositing} onClick={handleExecuteDeposit}>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. Samantha Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Title</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-indigo-900/50 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Zero-Knowledge R&D">Zero-Knowledge R&D</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                  <option value="Smart Contracts">Smart Contracts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Pay (USD)</label>
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
              <Button type="submit" variant="purple">
                Enroll Worker
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
