"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function AuthSessionProviders({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
