import React, { useState } from 'react';
import {
  Transaction,
  TransactionType,
  Category,
  ExpenseCategory,
  IncomeCategory,
} from '../types/cashflow';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/parser';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  Download,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdateTransaction: (updated: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Income' | 'Expense' | 'Needs Review'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState<TransactionType>('Expense');
  const [editCategory, setEditCategory] = useState<Category>('Miscellaneous');
  const [editAmount, setEditAmount] = useState<string>('');

  // Add new transaction modal / drawer state
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<TransactionType>('Expense');
  const [newCategory, setNewCategory] = useState<Category>('Miscellaneous');
  const [newAmount, setNewAmount] = useState('');

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditDate(tx.date);
    setEditDesc(tx.description);
    setEditType(tx.type);
    setEditCategory(tx.category);
    setEditAmount(tx.amount.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt < 0) return;

    onUpdateTransaction({
      id,
      date: editDate,
      description: editDesc.trim() || 'Untitled Transaction',
      type: editType,
      category: editCategory,
      amount: amt,
      status: 'valid',
      isDuplicate: false,
    });
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(amt) || amt <= 0) return;

    onAddTransaction({
      date: newDate,
      description: newDesc.trim(),
      type: newType,
      category: newCategory,
      amount: amt,
      status: 'valid',
    });

    setNewDesc('');
    setNewAmount('');
    setIsAdding(false);
  };

  // Filter & Search
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.date.includes(searchQuery);

    if (!matchesSearch) return false;

    if (typeFilter === 'Income') return tx.type === 'Income';
    if (typeFilter === 'Expense') return tx.type === 'Expense';
    if (typeFilter === 'Needs Review') return tx.status === 'needs_review' || tx.isDuplicate;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
              Transaction Ledger
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {transactions.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Editable transaction records. Changes immediately recalculate your dashboard and cash health.
          </p>
        </div>

        {/* Filter and Add buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search narration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-44"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs font-semibold">
            {(['All', 'Income', 'Expense', 'Needs Review'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTypeFilter(mode)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === mode
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Add New Transaction Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateNew}
          className="mx-5 p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Client payment, Petrol, Tea"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
            <select
              value={newType}
              onChange={(e) => {
                const val = e.target.value as TransactionType;
                setNewType(val);
                setNewCategory(val === 'Income' ? 'Sales' : 'Miscellaneous');
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Category)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              {newType === 'Income'
                ? INCOME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                : EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              placeholder="500"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
              required
            />
          </div>
          <div className="sm:col-span-6 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-2xs"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <th className="py-3 px-4 w-28">Date</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 w-24">Type</th>
              <th className="py-3 px-4 w-44">Category</th>
              <th className="py-3 px-4 text-right w-32">Amount</th>
              <th className="py-3 px-4 text-center w-24">Status</th>
              <th className="py-3 px-4 text-right w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No transactions match the selected filter or search query.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isEditing = editingId === tx.id;
                const isNeedsReview = tx.status === 'needs_review' || tx.isDuplicate;

                if (isEditing) {
                  return (
                    <tr key={tx.id} className="bg-blue-50/40">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full p-1 text-xs rounded border border-slate-300 bg-white font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full p-1 text-xs rounded border border-slate-300 bg-white font-medium"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={editType}
                          onChange={(e) => {
                            const val = e.target.value as TransactionType;
                            setEditType(val);
                            setEditCategory(val === 'Income' ? 'Sales' : 'Miscellaneous');
                          }}
                          className="w-full p-1 text-xs rounded border border-slate-300 bg-white"
                        >
                          <option value="Income">Income</option>
                          <option value="Expense">Expense</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as Category)}
                          className="w-full p-1 text-xs rounded border border-slate-300 bg-white"
                        >
                          {editType === 'Income'
                            ? INCOME_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))
                            : EXPENSE_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full p-1 text-xs rounded border border-slate-300 bg-white text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="text-xs text-blue-600 font-semibold">Editing</span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(tx.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isNeedsReview ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      {tx.reviewReason && (
                        <div className="text-[11px] text-amber-700 font-normal mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{tx.reviewReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          tx.type === 'Income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                      {tx.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      <span
                        className={
                          tx.type === 'Income' ? 'text-emerald-700' : 'text-slate-900'
                        }
                      >
                        {tx.type === 'Income' ? '+' : '-'}₹
                        {tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isNeedsReview ? (
                        <span
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-200"
                          title={tx.reviewReason || 'Needs Review'}
                        >
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Review</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-semibold"
                          title="Verified transaction"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => startEdit(tx)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filtered.length} of {transactions.length} entries
        </span>
        <span className="text-[11px] text-slate-400">
          All entries are included in mathematical totals and charts
        </span>
      </div>
    </div>
  );
};
