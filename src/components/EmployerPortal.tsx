'use client';

import React, { useState } from 'react';
import { Building2, Users, DollarSign, ShieldAlert, Plus, Layers, ArrowUpRight, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';
import { Employee, formatUSD, generateZKHash } from '@/lib/midzoll-zk';
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
  const estimatedTaxWithheld = totalMonthlyPayroll * 0.23; // 23% avg tax

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
      
      {/* Top Banner / Employer Overview */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Corporate HR Treasury & Shielded Compliance</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              TechCorp <span className="text-gradient-cyan">Midnight HR Portal</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Confidential payroll distribution powered by Compact zero-knowledge smart state
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Deposit Shielded Batch</span>
            </button>

            <button
              onClick={() => setIsAddWorkerModalOpen(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Confidential Worker</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-900/40">
          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/30">
            <div className="text-xs text-slate-400">Shielded Treasury Commitment</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {formatUSD(treasuryBalanceUSD)}
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Shielded Balance
            </div>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/30">
            <div className="text-xs text-slate-400">Total Monthly Payroll Rate</div>
            <div className="text-2xl font-bold text-cyan-300 font-mono mt-1">
              {formatUSD(totalMonthlyPayroll)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">across {employees.length} employees</div>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/30">
            <div className="text-xs text-slate-400">Estimated ZK Tax Withholding</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {formatUSD(estimatedTaxWithheld)}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">ZKP Tax Remittance Ready</div>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-indigo-900/30">
            <div className="text-xs text-slate-400">PayFlow Velocity</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ${(totalMonthlyPayroll / (30 * 24 * 3600)).toFixed(4)}/sec
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Real-time Stream Active</div>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Confidential Employee Roster</span>
            </h2>
            <p className="text-xs text-slate-400">Salaries and identities protected via client-side viewing keys</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Department: All</span>
            </span>
          </div>
        </div>

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
                    <span className="px-2.5 py-1 rounded-md text-xs bg-indigo-950/80 border border-indigo-800/40 text-indigo-300">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-semibold text-cyan-300">
                    {formatUSD(emp.salaryMonthly)}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Streaming
                    </span>
                  </td>
                  <td className="py-4 text-xs font-mono text-slate-400">
                    {emp.viewingKey.substring(0, 16)}...
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => alert(`Viewing Key hash for ${emp.name}:\n${emp.viewingKey}\n\nShielded Address:\n${emp.shieldedAddress}`)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer"
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

      {/* Deposit Treasury Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow max-w-md w-full p-6 rounded-2xl border border-cyan-500/50">
            <h3 className="text-lg font-bold text-white mb-2">Deposit Shielded Payroll Treasury</h3>
            <p className="text-xs text-slate-300 mb-6">
              Funds are committed into the Compact contract state commitment pool.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Amount (USDC-M)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-lg font-mono font-bold"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={isDepositing}
                  onClick={handleExecuteDeposit}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/30 cursor-pointer"
                >
                  {isDepositing ? 'Depositing...' : 'Confirm Deposit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Confidential Worker Modal */}
      {isAddWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-indigo-900/50">
            <h3 className="text-lg font-bold text-white mb-4">Add Confidential Employee to Payroll</h3>
            <form onSubmit={handleCreateWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samantha Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zero-Knowledge Researcher"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full glass-input p-3 rounded-xl text-sm bg-slate-900"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Zero-Knowledge R&D">Zero-Knowledge R&D</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Smart Contracts">Smart Contracts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Pay (USD)</label>
                  <input
                    type="number"
                    required
                    value={salaryMonthly}
                    onChange={(e) => setSalaryMonthly(e.target.value)}
                    className="w-full glass-input p-3 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Enroll Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
