import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'
import './App.css'

const EMOTIONS = [
  ['joy', '😊', '기쁨'], ['calm', '😌', '평온'], ['sad', '😢', '슬픔'],
  ['angry', '😠', '화남'], ['anxious', '😰', '불안'],
]

const emotionFor = (value) => EMOTIONS.find(([key]) => key === value) || EMOTIONS[0]
const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

function App() {
  const [diaries, setDiaries] = useState([])
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('joy')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setDiaries(await fetchDiaries()) }
    catch (loadError) { setError(loadError.message || '일기를 불러오지 못했습니다.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const visible = useMemo(
    () => filter === 'all' ? diaries : diaries.filter((diary) => diary.emotion === filter),
    [diaries, filter],
  )

  const save = async (event) => {
    event.preventDefault()
    const text = content.trim()
    if (!text || saving) return
    setSaving(true); setError('')
    try { await createDiary({ content: text, emotion }); setContent(''); await load() }
    catch (saveError) { setError(saveError.message || '일기를 저장하지 못했습니다.') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (deleting) return
    setDeleting(id); setError('')
    try { await deleteDiary(id); await load() }
    catch (deleteError) { setError(deleteError.message || '일기를 삭제하지 못했습니다.') }
    finally { setDeleting(null) }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand-mark">✦</div>
        <p className="eyebrow">MY DAILY SPACE</p>
        <h1>오늘의 마음을<br /><span>차분히 기록해요</span></h1>
        <p className="subtitle">작은 감정도 소중하게 남겨두면, 나를 더 잘 이해할 수 있어요.</p>
      </header>

      <section className="composer-card">
        <div className="section-heading"><div><p className="section-kicker">NEW ENTRY</p><h2>오늘은 어떤 하루였나요?</h2></div></div>
        <form onSubmit={save}>
          <fieldset className="emotion-picker"><legend>지금 느끼는 감정</legend><div className="emotion-options">
            {EMOTIONS.map(([key, emoji, label]) => <button type="button" className={`emotion-button ${emotion === key ? 'selected' : ''}`} aria-pressed={emotion === key} onClick={() => setEmotion(key)} key={key}>{emoji} {label}</button>)}
          </div></fieldset>
          <label className="sr-only" htmlFor="diary-content">오늘의 일기</label>
          <textarea id="diary-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="오늘 하루, 마음속에 남은 이야기를 자유롭게 적어보세요..." rows="5" maxLength="5000" />
          <div className="form-footer"><span>{content.length} / 5,000</span><button className="save-button" type="submit" disabled={saving || !content.trim()}>{saving ? '저장 중...' : '기록 남기기'} →</button></div>
        </form>
      </section>

      {error && <div className="error-banner" role="alert"><strong>!</strong><span>{error}</span><button type="button" onClick={() => void load()}>다시 시도</button></div>}

      <section className="entries-section">
        <div className="entries-heading"><div><p className="section-kicker">YOUR ENTRIES</p><h2>나의 기록 <small>{diaries.length}</small></h2></div>
          <div className="filter-tabs" role="tablist"><button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체</button>{EMOTIONS.map(([key, emoji, label]) => <button type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)} key={key}>{emoji} <i>{label}</i></button>)}</div>
        </div>
        {loading ? <div className="state-card"><span className="spinner" /> 기록을 불러오는 중이에요...</div> : visible.length === 0 ? <div className="state-card empty"><b>🌱</b><strong>{diaries.length ? '이 감정의 기록이 없어요' : '아직 남겨진 기록이 없어요'}</strong><span>{diaries.length ? '다른 감정 탭에서 기록을 찾아보세요.' : '오늘의 마음을 첫 번째로 기록해보세요.'}</span></div> : <div className="diary-list">{visible.map((diary) => { const [key, emoji, label] = emotionFor(diary.emotion); return <article className={`diary-card ${key}`} key={diary.id}><div className="diary-card-top"><b>{emoji} {label}</b><time dateTime={diary.created_at}>{dateFormat.format(new Date(diary.created_at))}</time></div><p>{diary.content}</p><button className="delete-button" type="button" disabled={deleting === diary.id} onClick={() => void remove(diary.id)}>{deleting === diary.id ? '삭제 중...' : '삭제'}</button></article> })}</div>}
      </section>
      <footer>나의 마음을 돌보는 시간 · MY DAILY SPACE</footer>
    </main>
  )
}

export default App
