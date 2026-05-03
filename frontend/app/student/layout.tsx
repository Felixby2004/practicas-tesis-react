'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentSidebar } from '@/components/layout/student-sidebar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(userData || '{}');
      if (parsedUser.rol !== 'ESTUDIANTE') router.push('/dashboard');
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar user={user} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-16 lg:pt-6">
        {children}
      </main>
    </div>
  );
}