import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const wheelRef = useRef(null)

  // Verificar se já jogou e gerar ID único da sessão
  useEffect(() => {
    const playedKey = 'barbearia-wheel-played'
    const sessionKey = 'barbearia-session-id'
    
    // Verificar se já jogou
    const played = localStorage.getItem(playedKey)
    if (played) {
      setHasPlayed(true)
      setResult(JSON.parse(played))
    }
    
    // Gerar ou recuperar ID da sessão
    let sessionId = localStorage.getItem(sessionKey)
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem(sessionKey, sessionId)
    }
    setSessionId(sessionId)
  }, [])

  // Prêmios com probabilidades baseadas no valor
  const prizes = [
    { id: 1, name: "Corte Grátis", probability: 0.05, color: "#FFD700" }, // 5% - mais difícil
    { id: 2, name: "2€ de Desconto", probability: 0.15, color: "#FF6B6B" }, // 15%
    { id: 3, name: "2€ de Desconto", probability: 0.15, color: "#4ECDC4" }, // 15%
    { id: 4, name: "1€ de Desconto", probability: 0.25, color: "#45B7D1" }, // 25%
    { id: 5, name: "1€ de Desconto", probability: 0.25, color: "#96CEB4" }, // 25%
    { id: 6, name: "3€ de Desconto", probability: 0.10, color: "#FFEAA7" }, // 10%
    { id: 7, name: "Sobrancelha", probability: 0.05, color: "#DDA0DD" }, // 5% - mais difícil
  ]

  const spinWheel = () => {
    if (isSpinning || hasPlayed) return

    setIsSpinning(true)
    setResult(null)

    // Gerar número aleatório baseado nas probabilidades
    const random = Math.random()
    let cumulativeProbability = 0
    let selectedPrize = null

    for (const prize of prizes) {
      cumulativeProbability += prize.probability
      if (random <= cumulativeProbability) {
        selectedPrize = prize
        break
      }
    }

    // Calcular rotação (múltiplas voltas + posição do prêmio)
    const baseRotation = 360 * 5 // 5 voltas completas
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id)
    const prizeAngle = (360 / prizes.length) * prizeIndex
    const finalRotation = baseRotation + (360 - prizeAngle)

    // Aplicar rotação
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`
    }

    // Mostrar resultado após a animação e salvar no localStorage
    setTimeout(() => {
      setResult(selectedPrize)
      setIsSpinning(false)
      setHasPlayed(true)
      
      // Salvar resultado no localStorage para evitar nova jogada
      localStorage.setItem('barbearia-wheel-played', JSON.stringify(selectedPrize))
    }, 3000)
  }

  const resetWheel = () => {
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)'
    }
    setResult(null)
  }

  const clearData = () => {
    localStorage.removeItem('barbearia-wheel-played')
    localStorage.removeItem('barbearia-session-id')
    setHasPlayed(false)
    setResult(null)
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <img 
            src="https://i.imgur.com/AsKqlr1.png" 
            alt="Primórdio Barbearia" 
            className="barbershop-logo"
          />
        </div>
        <h1>🎯 Roleta da Barbearia</h1>
        <p>Gire a roleta e ganhe prêmios incríveis!</p>
      </header>

      <div className="wheel-container">
        <div className="wheel" ref={wheelRef}>
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * index
            const nextAngle = (360 / prizes.length) * (index + 1)
            const midAngle = (angle + nextAngle) / 2
            
            return (
              <div
                key={prize.id}
                className="wheel-segment"
                style={{
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: prize.color,
                }}
              >
                <div 
                  className="prize-text"
                  style={{
                    transform: `rotate(${midAngle - angle}deg)`,
                  }}
                >
                  {prize.name}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="wheel-pointer"></div>
      </div>

      <div className="controls">
        {!hasPlayed ? (
          <button 
            className="spin-button" 
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? 'Girando...' : 'GIRAR ROLETA'}
          </button>
        ) : (
          <div className="already-played-message">
            <p>🎯 Você já jogou nesta sessão!</p>
            <p className="session-info">ID da sessão: {sessionId}</p>
            <button className="clear-button" onClick={clearData}>
              Limpar dados (apenas para teste)
            </button>
          </div>
        )}
        
        {result && (
          <div className="result-modal">
            <div className="result-content">
              <h2>🎉 Parabéns!</h2>
              <p>Você ganhou:</p>
              <div className="prize-result" style={{ backgroundColor: result.color }}>
                {result.name}
              </div>
              <div className="instagram-instructions">
                <h3>📸 Próximos passos:</h3>
                <ol>
                  <li>Tire um print desta tela</li>
                  <li>Poste no seu Instagram</li>
                  <li>Marque <strong>@primordiobarbearia</strong></li>
                  <li>Apresente o print na barbearia</li>
                </ol>
                <a 
                  href="https://www.instagram.com/primordiobarbearia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="instagram-link-button"
                >
                  📸 Ir para @primordiobarbearia
                </a>
                <p className="prize-note">
                  ⚠️ Guarde este resultado! Você só pode jogar uma vez.
                </p>
                <p className="deadline-note">
                  ⏰ Prazo para resgatar o prêmio: 1 mês a partir de hoje
                </p>
                <p className="validation-warning">
                  ⚡ IMPORTANTE: O prêmio deve ser validado em 24h! Poste nos stories do Instagram e marque @primordiobarbearia para validar seu prêmio.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="instagram-section">
        <a 
          href="https://www.instagram.com/primordiobarbearia/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="instagram-button"
        >
          <span className="instagram-icon">📸</span>
          Siga @primordiobarbearia
        </a>
      </div>
    </div>
  )
}

export default App
