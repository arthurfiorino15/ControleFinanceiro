import React, { useState } from 'react';
import { User, KeyRound, AlertCircle, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthCredentials } from '../types/finance';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  credentials: AuthCredentials;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, credentials }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password;

    if (cleanUser === credentials.username && cleanPass === credentials.password) {
      setIsLoading(true);
      setTimeout(() => {
        onLoginSuccess(cleanUser);
      }, 300);
    } else {
      setError('Credenciais incorretas. Verifique seu usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Claymorphic Login Card */}
        <div className="clay-card p-8 sm:p-10 relative overflow-hidden">
          {/* Top Brand & Vehicle Icon */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-[6px_8px_18px_rgba(79,70,229,0.35),inset_2px_2px_4px_rgba(255,255,255,0.4)] mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px] uppercase tracking-wider mb-2 border border-indigo-200/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Restrito</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              AutoGestão Financeira
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Painel de controle de veículo terceirizado
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Usuário</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Informe seu usuário"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full clay-input py-3 px-4 text-slate-800 font-semibold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Senha</span>
              </label>
              <input
                type="password"
                required
                placeholder="Informe sua senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full clay-input py-3 px-4 text-slate-800 font-semibold text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-[6px_8px_18px_rgba(79,70,229,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Security notice without auto-fill button */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ambiente seguro · Sessão criptografada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
