"use client";

import { usePathname } from "next/navigation";
import AuthProvider from "./SessionProvider";

export default function ConditionalSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/" || pathname === "/product-info";
  return isAuthPage ? <>{children}</> : <AuthProvider>{children}</AuthProvider>;
}
