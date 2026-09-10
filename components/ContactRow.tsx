import { PixelIcon } from '@/components/PixelIcon'

/**
 * The four ways to reach him, as pixel icons.
 *
 * One list and one row, used by the desktop rail, the phone's menu card and
 * the foot of the phone's scroll. It existed twice before this — the same four
 * entries copied between the rail and the mobile chrome — and a third copy for
 * the footer is what made it worth having once. A phone number that is right
 * in two places out of three is worse than one that is wrong everywhere,
 * because nobody thinks to check the others.
 */
export const CONTACT = [
  { href: 'mailto:s.anshul@iitg.ac.in', label: 'Email', icon: 'mail' },
  { href: 'tel:+916376542708', label: 'Phone', icon: 'phone' },
  { href: 'https://linkedin.com/in/sutharanshul', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://behance.net/anshulsuthar', label: 'Behance', icon: 'behance' },
] as const

export function ContactRow({ className = '' }: { className?: string }) {
  return (
    <div className={`contact-row ${className}`.trim()}>
      {CONTACT.map(({ href, label, icon }) => (
        <a
          key={label}
          href={href}
          /* mailto: and tel: are handed to the OS, so only the two real links
             open elsewhere — and only those two need the opener severed. */
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          data-sfx="tick"
          className="contact-chip"
          aria-label={label}
          title={label}
        >
          <PixelIcon name={icon} size={26} />
        </a>
      ))}
    </div>
  )
}
