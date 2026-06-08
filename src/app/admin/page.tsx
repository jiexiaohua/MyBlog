import type { Metadata } from "next";
import { AdminComposer } from "@/components/AdminComposer";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "发文",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <AdminComposer />
      </div>
    </main>
  );
}
