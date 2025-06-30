// Free Dictionary API 服务模块
// API 文档: https://dictionaryapi.dev/

// 定义 API 响应的数据结构
export interface DictionaryApiResponse {
  word: string
  phonetic?: string
  phonetics: Array<{
    text?: string
    audio?: string
  }>
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
      synonyms?: string[]
      antonyms?: string[]
    }>
  }>
}

// 定义发音信息的接口
export interface PronunciationInfo {
  text: string    // 发音文本
  audio?: string  // 音频URL
}

// 处理后的单词详情数据结构
export interface WordDetails {
  pronunciation: string // 主要发音文本（向后兼容）
  pronunciations: PronunciationInfo[] // 所有发音信息
  definitions: Array<{
    partOfSpeech: string
    definition: string
  }>
  examples: string[]
}

/**
 * 从 Free Dictionary API 获取单词详情
 * @param word - 要查询的单词
 * @returns Promise<WordDetails | null> - 返回单词详情或 null
 */
export async function fetchWordDetails(word: string): Promise<WordDetails | null> {
  try {
    // 构建 API URL
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    
    // 发起 API 请求
    const response = await fetch(apiUrl)
    
    // 检查响应状态
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`单词 "${word}" 未找到定义`)
        return null
      }
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }
    
    // 解析 JSON 响应
    const data: DictionaryApiResponse[] = await response.json()
    
    // 检查是否有数据
    if (!data || data.length === 0) {
      console.log(`单词 "${word}" 没有返回数据`)
      return null
    }
    
    // 处理第一个结果（通常是最相关的）
    const wordData = data[0]
    
    // 提取发音信息
    const pronunciations: PronunciationInfo[] = []
    let mainPronunciation = ''
    
    // 处理 phonetics 数组
    if (wordData.phonetics && wordData.phonetics.length > 0) {
      wordData.phonetics.forEach(phonetic => {
        if (phonetic.text) {
          const pronunciationInfo: PronunciationInfo = {
            text: phonetic.text
          }
          
          // 如果有音频URL，添加到发音信息中
          if (phonetic.audio && phonetic.audio.trim() !== '') {
            pronunciationInfo.audio = phonetic.audio
          }
          
          pronunciations.push(pronunciationInfo)
          
          // 设置主要发音（第一个有文本的发音）
          if (!mainPronunciation) {
            mainPronunciation = phonetic.text
          }
        }
      })
    }
    
    // 如果没有从 phonetics 获取到发音，尝试使用 phonetic 字段
    if (!mainPronunciation && wordData.phonetic) {
      mainPronunciation = wordData.phonetic
      pronunciations.push({
        text: wordData.phonetic
      })
    }
    
    // 如果仍然没有发音，使用默认格式
    if (!mainPronunciation) {
      mainPronunciation = `/${word}/`
      pronunciations.push({
        text: mainPronunciation
      })
    }
    
    // 提取定义信息
    const definitions: Array<{ partOfSpeech: string; definition: string }> = []
    const examples: string[] = []
    
    wordData.meanings.forEach(meaning => {
      meaning.definitions.forEach((def, index) => {
        // 每个词性最多取前3个定义
        if (index < 3) {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition
          })
        }
        
        // 收集例句
        if (def.example && examples.length < 5) {
          examples.push(def.example)
        }
      })
    })
    
    // 如果没有找到例句，尝试生成一些基本的例句模板
    if (examples.length === 0) {
      examples.push(`This is an example sentence with the word "${word}".`)
    }
    
    return {
      pronunciation: mainPronunciation,
      pronunciations: pronunciations,
      definitions: definitions.slice(0, 5), // 最多返回5个定义
      examples: examples.slice(0, 3) // 最多返回3个例句
    }
    
  } catch (error) {
    console.error(`获取单词 "${word}" 的详情时出错:`, error)
    return null
  }
}

/**
 * 批量获取多个单词的详情（带延迟以避免API限制）
 * @param words - 单词数组
 * @param delayMs - 请求间隔时间（毫秒）
 * @returns Promise<Map<string, WordDetails>> - 返回单词到详情的映射
 */
export async function fetchMultipleWordDetails(
  words: string[], 
  delayMs: number = 100
): Promise<Map<string, WordDetails>> {
  const results = new Map<string, WordDetails>()
  
  for (const word of words) {
    try {
      const details = await fetchWordDetails(word)
      if (details) {
        results.set(word, details)
      }
      
      // 添加延迟以避免API限制
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`批量获取单词 "${word}" 详情失败:`, error)
    }
  }
  
  return results
}

/**
 * 检查单词是否需要更新详情（基于最后获取时间）
 * @param lastFetchedAt - 最后获取时间
 * @param maxAgeHours - 最大缓存时间（小时）
 * @returns boolean - 是否需要更新
 */
export function shouldUpdateWordDetails(
  lastFetchedAt: string | null | undefined, 
  maxAgeHours: number = 24 * 7 // 默认7天
): boolean {
  if (!lastFetchedAt) {
    return true // 从未获取过，需要更新
  }
  
  const lastFetched = new Date(lastFetchedAt)
  const now = new Date()
  const hoursDiff = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60)
  
  return hoursDiff > maxAgeHours
}