import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-md bg-bg/80">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-accent font-mono text-sm font-semibold tracking-widest uppercase">
            ∑ Math ML
          </span>
        </Link>
        <div className="flex items-center gap-6 text-muted text-sm">
          <a
            href="https://github.com/het34"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors link-underline"
          >
            GitHub
          </a>
          <a
            href="https://www.udemy.com/course/machine-learning-data-science-foundations-masterclass/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors link-underline"
          >
            Course
          </a>
        </div>
      </div>
    </nav>
  )
}
