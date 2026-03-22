'use client';

import { configureAmplify } from '@/lib/amplify-config';

configureAmplify();

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight-950 px-4 relative overflow-hidden">
      {/* Fog overlay */}
      <div className="absolute inset-0 animate-fog pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(197,165,90,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(45,106,106,0.03) 0%, transparent 50%)',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,8,16,0.8) 100%)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
