'use client';

import React, { createContext, useContext, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';

// Context to simulate <Outlet /> rendering child components in Layouts
const OutletContext = createContext<React.ReactNode>(null);

export const OutletProvider = OutletContext.Provider;

export const Outlet = () => {
  return useContext(OutletContext);
};

// Compatibility Link component: translates 'to' prop to 'href'
export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, children, ...props }, ref) => {
  return (
    <NextLink href={to} ref={ref} {...props}>
      {children}
    </NextLink>
  );
});
Link.displayName = 'Link';

// Compatibility NavLink component: resolves active class based on Next.js pathname
export const NavLink = React.forwardRef<HTMLAnchorElement, any>(({ to, className, children, end, ...props }, ref) => {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || (to !== '/' && pathname?.startsWith(to));

  const resolveClassName = (navLinkClass: any) => {
    if (typeof navLinkClass === 'function') {
      return navLinkClass({ isActive });
    }
    return `${navLinkClass} ${isActive ? 'active' : ''}`;
  };

  return (
    <NextLink href={to} className={resolveClassName(className)} ref={ref} {...props}>
      {children}
    </NextLink>
  );
});
NavLink.displayName = 'NavLink';

// Compatibility useNavigate hook: maps navigation options to Next.js useRouter
export const useNavigate = () => {
  const router = useRouter();
  
  return (to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
};

// Compatibility useParams hook: wraps useParams from Next.js
export const useParams = () => {
  return useNextParams() || {};
};

// Compatibility useLocation hook: maps path and search params
export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams ? `?${searchParams.toString()}` : '';
  
  return {
    pathname,
    search,
    hash: '',
    state: null,
  };
};

// Compatibility Navigate component: redirects as a side effect
export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);

  return null;
};
