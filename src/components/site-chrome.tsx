"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { WorkspaceHeader } from "./workspace-header";

export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const workspace = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  return <>{workspace ? <WorkspaceHeader/> : header}<main id="main-content">{children}</main>{workspace ? null : footer}</>;
}
