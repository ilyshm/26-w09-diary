import { supabase } from '../lib/supabase'

const clientOrThrow = () => {
  if (!supabase) throw new Error('Supabase 환경 변수가 설정되지 않았습니다. .env.local을 확인해주세요.')
  return supabase
}

export async function fetchDiaries() {
  const { data, error } = await clientOrThrow().from('diaries').select('id, content, emotion, created_at').order('created_at', { ascending: false })
  if (error) throw new Error(error.message || '일기를 불러오지 못했습니다.')
  return data || []
}
export async function createDiary(values) {
  const { error } = await clientOrThrow().from('diaries').insert(values)
  if (error) throw new Error(error.message || '일기를 저장하지 못했습니다.')
}
export async function deleteDiary(id) {
  const { error } = await clientOrThrow().from('diaries').delete().eq('id', id)
  if (error) throw new Error(error.message || '일기를 삭제하지 못했습니다.')
}
