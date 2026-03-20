'use client';

import { configureAmplify } from '@/lib/amplify-config';

configureAmplify();

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      {children}
    </div>
  );
}
