import React, { useState } from 'react';
import { X, Lock, KeyRound, User, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthCredentials } from '../types/finance';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: AuthCredentials;
  onSaveCredentials: (newCreds: AuthCredentials) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSaveCredentials,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(credentials.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Verify current password
    if (currentPassword !== credentials.password) {
      setError('A senha atual informada está incorreta.');
      return;
    }

    const cleanUser = newUsername.trim();
    if (!cleanUser) {
      setError('O nome de usuário não pode ficar vazio.');
      return;
    }

    // If new password provided, check confirmation and length
    let finalPassword = credentials.password;
    if (newPassword.trim()) {
      if (newPassword.length < 4) {
        setError('A nova senha deve possuir pelo menos 4 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('A confirmação da nova senha não confere.');
        return;
      }
      finalPassword = newPassword;
    }

    onSaveCredentials({
      username: cleanUser,
      password: finalPassword,
    });

    setSuccessMessage('Credenciais atualizadas com sucesso!');
    setTimeout(() => {
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[12px_16px_36px_rgba(0,0,0,0.18),-8px_-8px_24px_rgba(255,255,255,0.9)] border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Alterar Usuário & Senha
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Segurança de acesso ao painel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Current Password (Security confirmation) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Senha Atual *</span>
            </label>
            <input
              type="password"
              required
              placeholder="Digite sua senha atual para autorizar"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full clay-input py-2.5 px-3.5 text-slate-800 text-sm"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            {/* New Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nome de Usuário</span>
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ex: Arthur"
                className="w-full clay-input py-2.5 px-3.5 text-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nova Senha</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Deixe em branco para manter a senha atual"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full clay-input py-2.5 px-3.5 text-slate-800 text-sm"
            />
          </div>

          {/* Confirm New Password */}
          {newPassword.trim().length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirmar Nova Senha *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full clay-input py-2.5 px-3.5 text-slate-800 text-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              Salvar Novas Credenciais
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
