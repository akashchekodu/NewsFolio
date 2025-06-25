'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-J61ZVRL7NV', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
