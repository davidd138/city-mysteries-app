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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400">Confirmar cuenta</h1>
          <p className="text-stone-500 mt-2">Introduce el codigo enviado a tu email</p>
        </div>
        <form onSubmit={handleConfirm} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-stone-400 mb-1">Codigo de verificacion</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Confirmando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-400">City Mysteries</h1>
        <p className="text-stone-500 mt-2">Crea tu cuenta de detective</p>
      </div>
      <form onSubmit={handleSignUp} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-stone-400 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-stone-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-stone-400 mb-1">Contrasena</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <p className="text-xs text-stone-600 mt-1">Minimo 8 caracteres, mayuscula, minuscula y numero</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="text-center text-sm text-stone-500 mt-4">
        Ya tienes cuenta?{' '}
        <Link href="/login/" className="text-amber-400 hover:text-amber-300">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
