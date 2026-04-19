import type { ReactNode } from "react";
import OwnerNav from "@/components/owner/OwnerNav";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="owner-app">
      <OwnerNav />
      <div className="owner-content-wrap">
        <main className="owner-main">{children}</main>
      </div>
    </div>
  );
}
