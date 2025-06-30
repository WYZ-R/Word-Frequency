import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查必要的环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 定义单词定义的接口
export interface WordDefinition {
  partOfSpeech: string  // 词性 (noun, verb, adjective, etc.)
  definition: string    // 定义
}

// 定义发音信息的接口
export interface WordPronunciation {
  text: string    // 发音文本 (如: /həˈloʊ/)
  audio?: string  // 音频文件URL
}

// 定义单词数据的 TypeScript 接口
export interface Word {
  id: string                    // 单词的唯一标识符
  word: string                  // 单词内容
  frequency: number             // 出现频率
  created_at: string            // 创建时间
  pronunciation?: string        // 发音文本（向后兼容）
  pronunciations?: WordPronunciation[] // 发音信息数组（新字段）
  examples?: string[]           // 例句数组（可选）
  definitions?: WordDefinition[] // 定义数组（可选）
  last_fetched_at?: string      // 最后获取详情的时间（可选）
}

/**
 * 添加新单词或更新现有单词的频率
 * @param word - 要添加或更新的单词
 * @returns Promise<Word | null> - 返回更新后的单词数据，失败时返回 null
 */
export async function addOrUpdateWord(word: string): Promise<Word | null> {
  try {
    // 将单词转换为小写以确保一致性
    const normalizedWord = word.toLowerCase()
    
    // 首先检查单词是否已存在于数据库中
    const { data: existingWord, error: fetchError } = await supabase
      .from('words')
      .select('*')
      .eq('word', normalizedWord)
      .maybeSingle()

    // 如果查询出错，则抛出异常
    if (fetchError) {
      throw fetchError
    }

    if (existingWord) {
      // 如果单词已存在，更新其频率（增加1）
      const { data, error } = await supabase
        .from('words')
        .update({ frequency: existingWord.frequency + 1 })
        .eq('id', existingWord.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // 如果单词不存在，插入新记录，频率设为1
      const { data, error } = await supabase
        .from('words')
        .insert([{ word: normalizedWord, frequency: 1 }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    // 记录错误信息到控制台
    console.error('Error adding/updating word:', error)
    return null
  }
}

/**
 * 批量处理多个单词（并发执行）
 * @param words - 要处理的单词数组
 * @returns Promise<{ success: Word[], failed: string[] }> - 返回成功和失败的单词列表
 */
export async function addOrUpdateWordsConcurrently(words: string[]): Promise<{
  success: Word[]
  failed: string[]
}> {
  try {
    // 去重并标准化单词
    const uniqueWords = [...new Set(words.map(word => word.toLowerCase()))]
    
    // 创建所有单词处理的 Promise 数组
    const wordPromises = uniqueWords.map(async (word) => {
      try {
        const result = await addOrUpdateWord(word)
        return { word, result, success: result !== null }
      } catch (error) {
        console.error(`处理单词 "${word}" 时出错:`, error)
        return { word, result: null, success: false }
      }
    })

    // 并发执行所有单词处理操作
    const results = await Promise.all(wordPromises)
    
    // 分离成功和失败的结果
    const success: Word[] = []
    const failed: string[] = []
    
    results.forEach(({ word, result, success: isSuccess }) => {
      if (isSuccess && result) {
        success.push(result)
      } else {
        failed.push(word)
      }
    })

    return { success, failed }
  } catch (error) {
    console.error('批量处理单词时出错:', error)
    return { success: [], failed: words }
  }
}

/**
 * 获取所有单词，按频率降序排列
 * @returns Promise<Word[]> - 返回单词数组，失败时返回空数组
 */
export async function getAllWords(): Promise<Word[]> {
  try {
    // 从数据库获取所有单词，按频率降序排列
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('frequency', { ascending: false }) // 按频率降序排列

    if (error) throw error
    return data || [] // 如果 data 为 null，返回空数组
  } catch (error) {
    // 记录错误信息到控制台
    console.error('Error fetching words:', error)
    return []
  }
}

/**
 * 更新单词的详细信息（发音、定义、例句）
 * @param wordId - 单词ID
 * @param details - 单词详细信息
 * @returns Promise<Word | null> - 返回更新后的单词数据
 */
export async function updateWordDetails(
  wordId: string,
  details: {
    pronunciation?: string
    pronunciations?: WordPronunciation[]
    definitions?: WordDefinition[]
    examples?: string[]
  }
): Promise<Word | null> {
  try {
    const { data, error } = await supabase
      .from('words')
      .update({
        pronunciation: details.pronunciation,
        pronunciations: details.pronunciations,
        definitions: details.definitions,
        examples: details.examples,
        last_fetched_at: new Date().toISOString()
      })
      .eq('id', wordId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating word details:', error)
    return null
  }
}

/**
 * 根据单词ID获取单词详情
 * @param wordId - 单词ID
 * @returns Promise<Word | null> - 返回单词数据
 */
export async function getWordById(wordId: string): Promise<Word | null> {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', wordId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching word by ID:', error)
    return null
  }
}