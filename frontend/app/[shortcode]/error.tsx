'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return <div>Oops! Something went wrong. Redirecting to home...</div>;
}
