'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push('/dashboard/');
    } catch {
      // error is set in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-slide-up">
      {/* Logo / Brand */}
      <div className="text-center mb-10">
        {/* Magnifying glass icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-brass-500/30 mb-5 animate-pulse-glow">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass-400">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-parchment tracking-wide" style={{ fontFamily: 'var(--font-serif)' }}>
          City Mysteries
        </h1>
        <p className="text-fog-500 mt-2 text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Agencia de Investigacion
        </p>
      </div>

      {/* Login Card */}
      <div className="card-case-file rounded-xl p-7">
        {/* Case file header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-midnight-600">
          <span className="text-xs text-fog-500 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            Acceso de Agente
          </span>
          <span className="stamp text-[10px] py-0.5 px-2">Confidencial</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-crimson-900/40 border border-crimson-500/30 text-crimson-400 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}
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
              aria-label="Email de identificacion"
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
              placeholder="••••••••"
              aria-label="Clave de acceso"
              className="w-full px-4 py-2.5 rounded-lg input-noir text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg btn-detective text-sm"
          >
            {submitting ? 'Verificando identidad...' : 'Acceder al Caso'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-fog-500 mt-6">
        Nuevo agente?{' '}
        <Link href="/register/" className="text-brass-400 hover:text-brass-300 transition-colors">
          Solicitar acceso
        </Link>
      </p>
    </div>
  );
}
