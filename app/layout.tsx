import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Geist } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

export const metadata: Metadata = {
  title: "Finance Tracker • Inteligentne zarządzanie finansami nowej generacji",
  description:
    "Przejmij pełną kontrolę nad budżetem, oszczędnościami i inwestycjami z synchronizacją w czasie rzeczywistym Firebase. Wypróbuj za darmo przez 7 dni.",
  keywords: [
    "finanse osobiste",
    "zarządzanie budżetem",
    "Firebase",
    "Next.js 16",
    "analiza wydatków",
    "oszczędzanie",
  ],
  authors: [{ name: "Finance Tracker Team" }],
  openGraph: {
    title:
      "Finance Tracker • Inteligentne zarządzanie finansami nowej generacji",
    description:
      "Nowoczesna platforma do kontroli finansów w czasie rzeczywistym z silnikiem Firebase.",
    type: "website",
    locale: "pl_PL",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang='pl'
      className={cn("dark", "h-full", "antialiased", "font-sans", geist.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col font-sans bg-surface text-on-surface'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
