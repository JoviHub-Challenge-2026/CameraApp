import Header from './components/Header.jsx'

function App() {
  return (
    <div className="phone">
      <Header />

      
      <main className="viewfinder">
        <svg className="viewfinder-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="viewfinder-text">Visor da camera</p>
      </main>

   
      <footer className="footer">

        {/* TODO: botao para a galeria.*/}
        <button className="gallery-btn" aria-label="Galeria">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <button className="shutter-btn" aria-label="Tirar foto"></button>
        <span className="footer-spacer"></span>

      </footer>

    </div>
  )
}

export default App
