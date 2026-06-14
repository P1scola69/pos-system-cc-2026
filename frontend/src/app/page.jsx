'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // TODO: Verificar token válido antes de redirigir
    const token = localStorage.getItem('token');
    router.replace(token ? '/dashboard' : '/login');
  }, [router]);
  return null;
}
