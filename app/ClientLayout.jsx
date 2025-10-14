"use client";

import { usePathname } from "next/navigation";
import { MainNav } from "@/components/MainNav";
import { Footer } from "@/components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <MainNav />}
      {children}
      {!isAdminPage && <Footer />}
    </>
  );
}
