import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'
import './App.css'

const EMOTIONS = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

const getEmotion = (value) => EMOTIONS.find((emotion) => emotion.value === value)

const formatDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

function App() {
  const [diaries, setDiaries] = useState([])
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('joy')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [today] = useState(() => new Date())

  const loadDiaries = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      setDiaries(await fetchDiaries())
    } catch (loadError) {
      setError(loadError.message || '일기를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDiaries()
  }, [loadDiaries])

  const filteredDiaries = useMemo(
    () =>
      filter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === filter),
    [diaries, filter],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent || isSaving) return

    setIsSaving(true)
    setError('')
    try {
      await createDiary({ content: trimmedContent, emotion })
      setContent('')
      await loadDiaries()
    } catch (saveError) {
      setError(saveError.message || '일기를 저장하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (deletingId) return
    setDeletingId(id)
    setError('')
    try {
      await deleteDiary(id)
      await loadDiaries()
    } catch (deleteError) {
      setError(deleteError.message || '일기를 삭제하지 못했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand-mark" aria-hidden="true">✦</div>
        <p className="eyebrow">MY DAILY SPACE</p>
        <h1>오늘의 마음을<br /><span>차분히 기록해요</span></h1>
        <p className="subtitle">작은 감정도 소중하게 남겨두면, 나를 더 잘 이해할 수 있어요.</p>
      </header>

      <section className="composer-card" aria-labelledby="composer-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">NEW ENTRY</p>
            <h2 id="composer-title">오늘은 어떤 하루였나요?</h2>
          </div>
          <span className="date-badge">{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(today)}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <fieldset className="emotion-picker">
            <legend>지금 느끼는 감정</legend>
            <div className="emotion-options">
              {EMOTIONS.map((item) => (
                <button
                  type="button"
                  className={`emotion-button ${emotion === item.value ? 'selected' : ''}`}
                  key={item.value}
                  onClick={() => setEmotion(item.value)}
                  aria-pressed={emotion === item.value}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="sr-only" htmlFor="diary-content">오늘의 일기</label>
          <textarea
            id="diary-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="오늘 하루, 마음속에 남은 이야기를 자유롭게 적어보세요..."
            rows="5"
            maxLength="5000"
          />
          <div className="form-footer">
            <span className="character-count">{content.length} / 5,000</span>
            <button className="save-button" type="submit" disabled={isSaving || !content.trim()}>
              {isSaving ? '저장 중...' : '기록 남기기'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">!</span>
          <p>{error}</p>
          <button type="button" onClick={loadDiaries}>다시 시도</button>
        </div>
      )}

      <section className="entries-section" aria-labelledby="entries-title">
        <div className="entries-heading">
          <div>
            <p className="section-kicker">YOUR ENTRIES</p>
            <h2 id="entries-title">나의 기록 <span>{diaries.length}</span></h2>
          </div>
          <div className="filter-tabs" role="tablist" aria-label="감정 필터">
            <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체</button>
            {EMOTIONS.map((item) => (
              <button type="button" className={filter === item.value ? 'active' : ''} key={item.value} onClick={() => setFilter(item.value)}>
                {item.emoji} <span className="filter-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="state-card"><span className="spinner" /> 기록을 불러오는 중이에요...</div>
        ) : filteredDiaries.length === 0 ? (
          <div className="state-card empty-state">
            <span className="empty-emoji">🌱</span>
            <strong>{diaries.length === 0 ? '아직 남겨진 기록이 없어요' : '이 감정의 기록이 없어요'}</strong>
            <p>{diaries.length === 0 ? '오늘의 마음을 첫 번째로 기록해보세요.' : '다른 감정 탭에서 기록을 찾아보세요.'}</p>
          </div>
        ) : (
          <div className="diary-list">
            {filteredDiaries.map((diary) => {
              const diaryEmotion = getEmotion(diary.emotion) || EMOTIONS[0]
              return (
                <article className={`diary-card ${diaryEmotion.value}`} key={diary.id}>
                  <div className="diary-card-top">
                    <span className="diary-emotion">{diaryEmotion.emoji} {diaryEmotion.label}</span>
                    <time dateTime={diary.created_at}>{formatDate(diary.created_at)}</time>
                  </div>
                  <p className="diary-content">{diary.content}</p>
                  <button className="delete-button" type="button" onClick={() => handleDelete(diary.id)} disabled={deletingId === diary.id}>
                    {deletingId === diary.id ? '삭제 중...' : '삭제'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <footer>나의 마음을 돌보는 시간 <span>•</span> MY DAILY SPACE</footer>
    </main>
  )
}

export default App
