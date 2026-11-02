import { supabase } from '../lib/supabase'

const getErrorMessage = (error, fallback) => error?.message || fallback

export async function fetchDiaries() {
  const { data, error } = await supabase
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(getErrorMessage(error, '일기를 불러오지 못했습니다.'))
  return data || []
}

export async function createDiary({ content, emotion }) {
  const { error } = await supabase.from('diaries').insert({ content, emotion })
  if (error) throw new Error(getErrorMessage(error, '일기를 저장하지 못했습니다.'))
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id)
  if (error) throw new Error(getErrorMessage(error, '일기를 삭제하지 못했습니다.'))
}
