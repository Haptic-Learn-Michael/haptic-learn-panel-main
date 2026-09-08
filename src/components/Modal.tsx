import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#FF6B35]',
  iconBg = 'bg-[#FF6B35]/15',
  onClose,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div
      className={`bg-[#2C0B50] border border-white/[0.08] rounded-2xl shadow-2xl w-full ${maxWidth} animate-modal-in overflow-hidden`}
    >
      {/* Gradient accent strip */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B35] via-[#FF9A6B] to-[#FFD166]" />

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {children}
    </div>
  </div>
);

export const ModalBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-6 space-y-4 ${className}`}>{children}</div>
);

export const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3 px-6 pb-6 pt-2">{children}</div>
);

export const ModalError = ({ message }: { message: string }) => (
  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-3.5 py-3 text-sm">
    <span className="leading-snug">{message}</span>
  </div>
);

export const ModalField = ({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-medium text-white/65 mb-1.5">
      {label}
      {required && (
        <span className="w-1 h-1 rounded-full bg-[#FF6B35] inline-block" />
      )}
    </label>
    {children}
    {hint && <p className="text-xs text-white/25 mt-1.5">{hint}</p>}
  </div>
);

interface DrawerProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  onClose: () => void;
  children: ReactNode;
}

export const Drawer = ({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}: DrawerProps) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-[#130328] border-l border-white/[0.08] w-[460px] max-w-[90vw] h-full flex flex-col shadow-2xl animate-drawer-in">
      <div className="h-[3px] bg-gradient-to-r from-[#FF6B35] via-[#FF9A6B] to-[#FFD166] flex-shrink-0" />
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#FF6B35]/15">
            <Icon size={18} className="text-[#FF6B35]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

export const BtnCancel = ({ onClick, label = 'Cancelar' }: { onClick: () => void; label?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 py-2.5 text-sm font-medium text-white/50 border border-white/10 rounded-xl hover:bg-white/[0.05] hover:text-white/70 transition-colors"
  >
    {label}
  </button>
);

export const BtnPrimary = ({
  loading,
  label,
  loadingLabel,
  disabled,
}: {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e85c28] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,107,53,0.35)]"
  >
    {loading ? (loadingLabel ?? 'Guardando…') : label}
  </button>
);
