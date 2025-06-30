import React, { useState, useEffect } from 'react'
import { X, Volume2, BookOpen, MessageSquare, Loader2, RefreshCw } from 'lucide-react'
import { Word, WordDefinition, updateWordDetails, getWordById } from '../lib/supabase'
import { fetchWordDetails, shouldUpdateWordDetails } from '../services/dictionaryApi'

interface WordDetailModalProps {
  word: Word | null
  isOpen: boolean
  onClose: () => void
  onWordUpdated?: (updatedWord: Word) => void
}

export default function WordDetailModal({ 
  word, 
  isOpen, 
  onClose, 
  onWordUpdated 
}: WordDetailModalProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(word)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // 当传入的 word 改变时更新本地状态
  useEffect(() => {
    setCurrentWord(word)
    setError(null)
  }, [word])

  // 获取单词详情
  const fetchDetails = async () => {
    if (!currentWord) return

    setIsLoading(true)
    setError(null)

    try {
      // 从 API 获取详情
      const details = await fetchWordDetails(currentWord.word)
      
      if (details) {
        // 转换定义格式
        const definitions: WordDefinition[] = details.definitions.map(def => ({
          partOfSpeech: def.partOfSpeech,
          definition: def.definition
        }))

        // 更新数据库
        const updatedWord = await updateWordDetails(currentWord.id, {
          pronunciation: details.pronunciation,
          pronunciations: details.pronunciations,
          definitions,
          examples: details.examples
        })

        if (updatedWord) {
          setCurrentWord(updatedWord)
          onWordUpdated?.(updatedWord)
        }
      } else {
        setError('未找到该单词的详细信息')
      }
    } catch (err) {
      console.error('获取单词详情失败:', err)
      setError('获取单词详情失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 检查是否需要自动获取详情
  useEffect(() => {
    if (currentWord && isOpen) {
      const needsUpdate = shouldUpdateWordDetails(currentWord.last_fetched_at)
      if (needsUpdate && !currentWord.pronunciation && !currentWord.definitions) {
        fetchDetails()
      }
    }
  }, [currentWord, isOpen])

  // 播放发音
  const playPronunciation = async () => {
    if (!currentWord) return

    // 优先使用新的 pronunciations 数组中的音频
    let audioUrl = null
    if (currentWord.pronunciations && currentWord.pronunciations.length > 0) {
      // 寻找第一个有音频的发音
      const pronunciationWithAudio = currentWord.pronunciations.find(p => p.audio)
      if (pronunciationWithAudio?.audio) {
        audioUrl = pronunciationWithAudio.audio
      }
    }

    if (audioUrl) {
      try {
        setIsPlaying(true)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsPlaying(false)
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          console.error('音频播放失败')
          // 如果音频播放失败，显示发音文本
          const pronunciationText = currentWord.pronunciations?.[0]?.text || currentWord.pronunciation
          if (pronunciationText) {
            alert(`发音: ${pronunciationText}`)
          }
        }
        
        await audio.play()
      } catch (error) {
        setIsPlaying(false)
        console.error('播放发音失败:', error)
        // 播放失败时显示发音文本
        const pronunciationText = currentWord.pronunciations?.[0]?.text || currentWord.pronunciation
        if (pronunciationText) {
          alert(`发音: ${pronunciationText}`)
        }
      }
    } else {
      // 没有音频时显示发音文本
      const pronunciationText = currentWord.pronunciations?.[0]?.text || currentWord.pronunciation
      if (pronunciationText) {
        alert(`发音: ${pronunciationText}`)
      }
    }
  }

  // 获取显示的发音文本
  const getDisplayPronunciation = () => {
    if (currentWord?.pronunciations && currentWord.pronunciations.length > 0) {
      return currentWord.pronunciations[0].text
    }
    return currentWord?.pronunciation
  }

  // 检查是否有音频
  const hasAudio = () => {
    if (currentWord?.pronunciations && currentWord.pronunciations.length > 0) {
      return currentWord.pronunciations.some(p => p.audio)
    }
    return false
  }

  // 如果弹窗未打开或没有单词数据，不渲染
  if (!isOpen || !currentWord) {
    return null
  }

  const displayPronunciation = getDisplayPronunciation()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-none shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* 头部 */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">
                    {currentWord.word}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    出现频率: {currentWord.frequency} 次
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* 刷新按钮 */}
                <button
                  onClick={fetchDetails}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  title="刷新详情"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                
                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="px-8 py-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* 加载状态 */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-light">正在获取单词详情...</span>
                </div>
              </div>
            )}

            {/* 错误状态 */}
            {error && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-none p-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-900">获取失败</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={fetchDetails}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-none font-light hover:bg-red-700 transition-colors text-sm"
                >
                  重试
                </button>
              </div>
            )}

            {/* 单词详情内容 */}
            {!isLoading && !error && (
              <div className="space-y-8">
                {/* 发音部分 */}
                {displayPronunciation && (
                  <div className="bg-gray-50 rounded-none p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">发音</h3>
                        <p className="text-xl font-light text-gray-700 font-mono">
                          {displayPronunciation}
                        </p>
                        {hasAudio() && (
                          <p className="text-xs text-green-600 mt-1">
                            🔊 支持音频播放
                          </p>
                        )}
                      </div>
                      <button
                        onClick={playPronunciation}
                        disabled={isPlaying}
                        className={`
                          p-3 rounded-full transition-colors
                          ${hasAudio() 
                            ? 'bg-gray-900 text-white hover:bg-gray-800' 
                            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                          }
                          ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title={hasAudio() ? "播放发音" : "显示发音文本"}
                      >
                        <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 定义部分 */}
                {currentWord.definitions && currentWord.definitions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      定义
                    </h3>
                    <div className="space-y-4">
                      {currentWord.definitions.map((def, index) => (
                        <div key={index} className="border-l-4 border-gray-200 pl-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {def.partOfSpeech}
                            </span>
                          </div>
                          <p className="text-gray-700 font-light leading-relaxed">
                            {def.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 例句部分 */}
                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      例句
                    </h3>
                    <div className="space-y-4">
                      {currentWord.examples.map((example, index) => (
                        <div key={index} className="bg-blue-50 border-l-4 border-blue-200 p-4">
                          <p className="text-gray-700 font-light italic leading-relaxed">
                            "{example}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 空状态 */}
                {!displayPronunciation && 
                 (!currentWord.definitions || currentWord.definitions.length === 0) && 
                 (!currentWord.examples || currentWord.examples.length === 0) && 
                 !isLoading && !error && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-light text-gray-900 mb-2">暂无详细信息</h3>
                    <p className="text-gray-500 font-light mb-6">
                      点击刷新按钮获取该单词的发音、定义和例句
                    </p>
                    <button
                      onClick={fetchDetails}
                      className="px-6 py-3 bg-gray-900 text-white rounded-none font-light hover:bg-gray-800 transition-colors"
                    >
                      获取详情
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部信息 */}
          <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                添加时间: {new Date(currentWord.created_at).toLocaleDateString('zh-CN')}
              </span>
              {currentWord.last_fetched_at && (
                <span>
                  详情更新: {new Date(currentWord.last_fetched_at).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}