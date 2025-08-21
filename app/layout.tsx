import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "NATS Client Interface",
  description: "Web interface for NATS messaging with JetStream support",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={GeistSans.className}>
        <ToastProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
