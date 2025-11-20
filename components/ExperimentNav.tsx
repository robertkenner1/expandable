'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ExperimentNav() {
  const pathname = usePathname()
  
  const experiments = [
    { name: 'Depth', path: '/' },
    { name: 'Decide', path: '/table' },
    { name: 'React', path: '/hover' },
  ]
  
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="inline-flex items-center gap-1">
        {experiments.map((exp) => (
          <Link
            key={exp.path}
            href={exp.path}
            className={`text-[10px] px-3 py-1 rounded-full transition-colors ${
              pathname === exp.path
                ? 'text-foreground bg-foreground/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {exp.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

