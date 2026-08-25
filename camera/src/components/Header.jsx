function Header() {
  return (
    <header className="header">
    
      <span className="header-spacer"></span>

      <button className="ai-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        </svg>
        <span>AI</span>
      </button>

      {/* TODO: Ainda nao leva a lugar nenhum. */}
      <button className="ai-archive-btn" aria-label="AI Archive">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="4" rx="1" />
          <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      </button>
    </header>
  )
}

export default Header
