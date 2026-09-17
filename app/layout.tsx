import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "NLAMS 2.0 — National Land Acquisition & Management System",
  description: "A secure, transparent platform for land acquisition and rehabilitation management.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="light"><body><AuthProvider>{children}</AuthProvider></body></html>
}

