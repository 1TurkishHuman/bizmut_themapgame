import { useState, useEffect } from 'react'
import './App.css'
import { TurkiyeMap } from './components/TurkiyeMap'

interface TargetCity {
  plate_code: number
  name: string
  region: string
}

interface QuestionData {
  mode: string
  target_city: TargetCity
  options?: TargetCity[]
}

function App() {
  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [score, setScore] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [wrongCount, setWrongCount] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('Oyun yükleniyor...')
  const [cityStatus, setCityStatus] = useState<Record<number, 'correct' | 'wrong'>>({})

  // backten yeni soru cekiliuor
  const fetchNewQuestion = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/game/question?mode=find_city')
      const data = await res.json()
      setQuestion(data)
      setFeedback(`Hedef il: ${data.target_city.name}. Haritada yerini bulabilir misin?`)
    } catch (err) {
      console.error(err)
      setFeedback('Backend sunucusuna bağlanılamadı. Docker servisinin açık olduğundan emin olun.')
    }
  }

  // sayfa acildiginda soruyu getir
  useEffect(() => {
    fetchNewQuestion()
  }, [])

  // cevap isaretlendiginde backte kontrol ediyor 
  const handleCityClick = async (clickedPlate: number, _clickedName: string) => {
    if (!question) return

    try {
      const res = await fetch('http://localhost:8000/api/game/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_plate: question.target_city.plate_code,
          selected_plate: clickedPlate,
          mode: question.mode
        })
      })
      const result = await res.json()

      if (result.is_correct) {
        setScore((prev) => prev + 10)
        setCorrectCount((prev) => prev + 1)
        setCityStatus((prev) => ({ ...prev, [clickedPlate]: 'correct' }))
        setFeedback(`🎉 ${result.feedback_message}`)

        // 1.5 saniye
        setTimeout(() => {
          fetchNewQuestion()
        }, 1500)
      } else {
        setWrongCount((prev) => prev + 1)
        setCityStatus((prev) => ({ ...prev, [clickedPlate]: 'wrong' }))
        setFeedback(`❌ ${result.feedback_message}`)
      }
    } catch (err) {
      console.error(err)
      setFeedback('Cevap kontrol edilirken bir hata oluştu.')
    }
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Türkiye Harita Öğrenme Oyunu</h1>
        <p>İlleri keşfet, doğru yeri bul ve puanları topla!</p>
      </header>

      {/* currrent stats*/}
      <section className="status-bar">
        <div className="status-card target-box">
          <span className="status-label">Bulunacak İl:</span>
          <span className="target-city">
            {question ? question.target_city.name : '...'}
          </span>
        </div>
        <div className="status-card">
          <span className="status-label">Puan</span>
          <span className="status-value score">{score}</span>
        </div>
        <div className="status-card">
          <span className="status-label">Doğru / Yanlış</span>
          <span className="status-value">{correctCount} / {wrongCount}</span>
        </div>
      </section>

      {/* feedback */}
      <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: '600', fontSize: '1.1rem' }}>
        {feedback}
      </div>

      {/* map bilesenleri */}
      <main className="map-wrapper">
        <TurkiyeMap
          onCityClick={handleCityClick}
          highlightedPlate={null}
          statusMap={cityStatus}
        />
      </main>
    </div>
  )
}

export default App