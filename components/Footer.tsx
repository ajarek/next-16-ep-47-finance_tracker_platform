import { Shield } from "lucide-react"
import type { NavLinkItem } from "@/lib/types"

interface FooterProps {
  footerLinks: NavLinkItem[]
}

/**
 * Nowoczesna stopka platformy Finance Tracker z informacjami prawnymi i technologicznymi.
 */
export default function Footer({ footerLinks }: FooterProps) {
  return (
    <footer className='w-full bg-surface-container-lowest border-t border-border py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6'>
        {/* Logo i prawa autorskie */}
        <div className='flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary'>
              <svg
                className='w-4 h-4'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect width='20' height='14' x='2' y='5' rx='3' />
                <line x1='2' x2='22' y1='10' y2='10' />
                <circle cx='16' cy='15' r='1.5' fill='currentColor' />
              </svg>
            </div>
            <span className='font-extrabold text-base text-on-surface'>
              Finance Tracker
            </span>
          </div>

          <span className='text-xs text-on-surface-variant'>
            © 2026 Intelligent Financial Cloud. Wszelkie prawa zastrzeżone.
          </span>
        </div>

        {/* Linki stopki oraz certyfikat */}
        <div className='flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant'>
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className='hover:text-on-surface transition-colors'
            >
              {link.label}
            </a>
          ))}

          <div className='flex items-center gap-1.5 text-primary font-semibold'>
            <Shield className='w-3.5 h-3.5' />
            <span>Bezpieczeństwo Firebase 256-bit</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
