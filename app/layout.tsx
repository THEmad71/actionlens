import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActionLens — Extract actions, risks & summary from any policy",
  description:
    "Paste a policy, SOP, or email. ActionLens surfaces action items, obligations, risks, and open questions in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
