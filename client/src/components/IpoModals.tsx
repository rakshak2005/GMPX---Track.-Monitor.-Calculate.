import { useState } from 'react';
import type { Ipo } from '../types/ipo.js';

export interface IpoForm {
  name: string; companyName: string; symbol: string; logoUrl: string;
  issuePrice: string; lotSize: string; lotsApplied: string;
  openDate: string; closeDate: string; allotmentDate: string; listingDate: string;
  notes: string;
}

export function toForm(ipo?: Ipo): IpoForm {
  const d = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
  return {
    name: ipo?.name ?? '', companyName: ipo?.companyName ?? '', symbol: ipo?.symbol ?? '', logoUrl: ipo?.logoUrl ?? '',
    issuePrice: String(ipo?.issuePrice ?? ''), lotSize: String(ipo?.lotSize ?? ''), lotsApplied: String(ipo?.lotsApplied ?? ''),
    openDate: d(ipo?.openDate), closeDate: d(ipo?.closeDate), allotmentDate: d(ipo?.allotmentDate), listingDate: d(ipo?.listingDate),
    notes: ipo?.notes ?? '',
  };
}

export function formToPayload(f: IpoForm) {
  const dt = (s: string) => (s ? new Date(s).toISOString() : null);
  return {
    name: f.name.trim(), companyName: f.companyName.trim(), symbol: f.symbol.trim(), logoUrl: f.logoUrl.trim(),
    issuePrice: Number(f.issuePrice), lotSize: Number(f.lotSize), lotsApplied: Number(f.lotsApplied),
    openDate: dt(f.openDate), closeDate: dt(f.closeDate), allotmentDate: dt(f.allotmentDate), listingDate: dt(f.listingDate),
    notes: f.notes,
  };
}

function Fields({ form, set }: { form: IpoForm; set: (f: IpoForm) => void }) {
  const setF = (k: keyof IpoForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set({ ...form, [k]: e.target.value });
  const item = (label: string, k: keyof IpoForm, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-400">{label}</span>
      <input value={form[k]} onChange={setF(k)} {...props} />
    </label>
  );
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {item('IPO Name *', 'name', { placeholder: 'SS Retail', required: true })}
      {item('Company Name', 'companyName', { placeholder: 'SS Retail Ltd' })}
      {item('Issue Price (₹) *', 'issuePrice', { type: 'number', min: 1, placeholder: '742' })}
      {item('Lot Size *', 'lotSize', { type: 'number', min: 1, placeholder: '20' })}
      {item('Number of Lots *', 'lotsApplied', { type: 'number', min: 1, placeholder: '1' })}
      {item('IPO Symbol', 'symbol', { placeholder: 'SSRETAIL' })}
      {item('IPO Open Date', 'openDate', { type: 'date' })}
      {item('IPO Close Date', 'closeDate', { type: 'date' })}
      {item('Allotment Date', 'allotmentDate', { type: 'date' })}
      {item('Listing Date', 'listingDate', { type: 'date' })}
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-slate-400">Logo URL (optional)</span>
        <input value={form.logoUrl} onChange={setF('logoUrl')} placeholder="https://…" />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-semibold text-slate-400">My Notes (private)</span>
        <textarea value={form.notes} onChange={setF('notes')} rows={2} placeholder="Thesis, subscription watch…" />
      </label>
    </div>
  );
}

export function AddIpoModal({ open, onClose, onSave, saving }: { open: boolean; onClose: () => void; onSave: (p: unknown) => void; saving: boolean }) {
  const [form, setForm] = useState<IpoForm>(toForm());
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 p-0 sm:p-4 sm:items-center backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-2xl !bg-[#0b1020] p-5 sm:p-6 rounded-t-2xl sm:rounded-2xl border-b-0 sm:border-b max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">+ Add IPO</h2>
          <button onClick={onClose} className="sm:hidden text-slate-400 hover:text-white p-1">✕</button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Quantity and investment are calculated automatically.</p>
        <div className="mt-4"><Fields form={form} set={setForm} /></div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
          <button
            disabled={saving}
            onClick={() => onSave(formToPayload(form))}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save IPO'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditIpoModal({ ipo, onClose, onSave, saving }: { ipo: Ipo | null; onClose: () => void; onSave: (p: unknown) => void; saving: boolean }) {
  const [form, setForm] = useState<IpoForm>(toForm(ipo ?? undefined));
  const [key] = useState(ipo?.id);
  if (!ipo) return null;
  if (key !== ipo.id) { setForm(toForm(ipo)); }
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 p-0 sm:p-4 sm:items-center backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-2xl !bg-[#0b1020] p-5 sm:p-6 rounded-t-2xl sm:rounded-2xl border-b-0 sm:border-b max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Edit {ipo.name}</h2>
          <button onClick={onClose} className="sm:hidden text-slate-400 hover:text-white p-1">✕</button>
        </div>
        <div className="mt-4"><Fields form={form} set={setForm} /></div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
          <button
            disabled={saving}
            onClick={() => onSave(formToPayload(form))}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteConfirmation({ name, onClose, onConfirm, deleting }: { name: string; onClose: () => void; onConfirm: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass w-full max-w-md !bg-[#0b1020] p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">Delete {name}?</h2>
        <p className="mt-2 text-sm text-slate-400">This will remove the IPO from your personal tracker and delete its GMP history.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
