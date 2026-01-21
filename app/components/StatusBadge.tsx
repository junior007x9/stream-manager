import { CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isPaid = status === 'paid';

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-md border
        ${
          isPaid
            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30 text-red-300'
        }
      `}
    >
      {isPaid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{isPaid ? 'PAGO' : 'PENDENTE'}</span>
    </div>
  );
}