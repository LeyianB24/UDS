"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    fetchApi('auth_status')
      .then(res => {
        if (res.authenticated) {
          if (res.portal === 'admin') {
            router.push('/dashboard'); // (admin)/dashboard
          } else {
            router.push('/member/dashboard'); // (member)/dashboard (to be created)
          }
        } else {
          router.push('/login'); // (auth)/login
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-medium">Authenticating USMS Session...</p>
    </div>
  );
}
