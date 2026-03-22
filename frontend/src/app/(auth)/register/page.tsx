'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { signUp, confirmAccount, error, needsConfirmation } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const complete = await signUp(email, password, name);
      if (complete) router.push('/dashboard/');
    } catch {
      // error is set in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await confirmAccount(code);
      router.push('/dashboard/');
    } catch {
      // error is set in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-teal-500/30 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-400">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-parchment" style={{ fontFamily: 'var(--font-serif)' }}>
            Verificar Identidad
          </h1>
          <p className="text-fog-500 mt-2 text-sm">Introduce el codigo enviado a tu email</p>
        </div>
        <div className="card-case-file rounded-xl p-7">
          <form onSubmit={handleConfirm} className="space-y-5">
            {error && (
              <div className="bg-crimson-900/40 border border-crimson-500/30 text-crimson-400 px-4 py-2.5 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs text-fog-500 mb-1.5 tracking-wider uppercase">
                Codigo de verificacion
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-lg input-noir text-sm text-center tracking-[0.3em] text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg btn-detective text-sm"
            >
              {submitting ? 'Verificando...' : 'Confirmar Identidad'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-slide-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-brass-500/30 mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-parchment tracking-wide" style={{ fontFamily: 'var(--font-serif)' }}>
          Nuevo Agente
        </h1>
        <p className="text-fog-500 mt-2 text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Formulario de Reclutamiento
        </p>
      </div>

      {/* Register Card */}
      <div className="card-case-file rounded-xl p-7">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-midnight-600">
          <span className="text-xs text-fog-500 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            Datos del Agente
          </span>
          <span className="stamp text-[10px] py-0.5 px-2">Nuevo Caso</span>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="bg-crimson-900/40 border border-crimson-500/30 text-crimson-400 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs text-fog-500 mb-1.5 tracking-wider uppercase">
              Nombre en Clave
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Detective..."
              className="w-full px-4 py-2.5 rounded-lg input-noir text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-fog-500 mb-1.5 tracking-wider uppercase">
              Identificacion
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="agente@citymysteries.com"
              className="w-full px-4 py-2.5 rounded-lg input-noir text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-fog-500 mb-1.5 tracking-wider uppercase">
              Clave de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg input-noir text-sm"
            />
            <p className="text-xs text-fog-600 mt-1.5">Minimo 8 caracteres, mayuscula, minuscula y numero</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg btn-detective text-sm"
          >
            {submitting ? 'Procesando solicitud...' : 'Solicitar Acceso'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-fog-500 mt-6">
        Ya eres agente?{' '}
        <Link href="/login/" className="text-brass-400 hover:text-brass-300 transition-colors">
          Acceder
        </Link>
      </p>
    </div>
  );
}
