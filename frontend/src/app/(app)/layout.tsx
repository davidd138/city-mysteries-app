'use client';

import { configureAmplify } from '@/lib/amplify-config';
import { AuthGuard } from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

configureAmplify();

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen texture-parchment">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
