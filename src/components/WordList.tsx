import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Award, Crown, Zap, Eye } from 'lucide-react'
import { getAllWords, Word } from '../lib/supabase'
import WordDetailModal from './WordDetailModal'

interface WordListProps {
  refreshKey: number // 用于触发数据刷新的键值
}

export default function WordList({ refreshKey }: WordListProps) {
  // 状态管理
  const [words, setWords] = useState<Word[]>([]) // 存储从数据库获取的单词列表
  const [loading, setLoading] = useState(true) // 加载状态
  const [error, setError] = useState<string | null>(null) // 错误状态
  const [selectedWord, setSelectedWord] = useState<Word | null>(null) // 选中的单词
  const [isModalOpen, setIsModalOpen] = useState(false) // 弹窗开关状态

  // 根据单词频率返回对应的样式类和图标
  const getFrequencyStyle = (frequency: number) => {
    if (frequency >= 30) {
      // 神话级 (30+次) - 橙色
      return {
        containerClass: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-300',
        textClass: 'text-orange-800',
        frequencyClass: 'bg-orange-100 text-orange-800',
        icon: <Crown className="w-4 h-4 text-orange-600" />,
        label: '神话',
        labelClass: 'text-orange-600'
      }
    } else if (frequency >= 20) {
      // 传奇级 (20-29次) - 红色
      return {
        containerClass: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300',
        textClass: 'text-red-800',
        frequencyClass: 'bg-red-100 text-red-800',
        icon: <Award className="w-4 h-4 text-red-600" />,
        label: '传奇',
        labelClass: 'text-red-600'
      }
    } else if (frequency >= 10) {
      // 史诗级 (10-19次) - 紫色
      return {
        containerClass: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:border-purple-300',
        textClass: 'text-purple-800',
        frequencyClass: 'bg-purple-100 text-purple-800',
        icon: <Zap className="w-4 h-4 text-purple-600" />,
        label: '史诗',
        labelClass: 'text-purple-600'
      }
    } else if (frequency >= 5) {
      // 稀有级 (5-9次) - 蓝色
      return {
        containerClass: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300',
        textClass: 'text-blue-800',
        frequencyClass: 'bg-blue-100 text-blue-800',
        icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
        label: '稀有',
        labelClass: 'text-blue-600'
      }
    } else {
      // 普通级 (1-4次) - 白色
      return {
        containerClass: 'bg-white border-gray-200 hover:border-gray-300',
        textClass: 'text-gray-800',
        frequencyClass: 'bg-gray-100 text-gray-800',
        icon: <BarChart3 className="w-4 h-4 text-gray-600" />,
        label: '普通',
        labelClass: 'text-gray-600'
      }
    }
  }

  // 获取单词数据的函数
  const fetchWords = async () => {
    try {
      setLoading(true)
      setError(null)
      const wordsData = await getAllWords() // 调用 Supabase 函数获取所有单词
      setWords(wordsData)
    } catch (err) {
      console.error('获取单词列表失败:', err)
      setError('获取单词列表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 当 refreshKey 变化时重新获取数据
  useEffect(() => {
    fetchWords()
  }, [refreshKey])

  // 处理单词点击事件
  const handleWordClick = (word: Word) => {
    setSelectedWord(word)
    setIsModalOpen(true)
  }

  // 处理弹窗关闭
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedWord(null)
  }

  // 处理单词更新后的回调
  const handleWordUpdated = (updatedWord: Word) => {
    setWords(prevWords => 
      prevWords.map(word => 
        word.id === updatedWord.id ? updatedWord : word
      )
    )
  }

  // 计算总单词数
  const totalWords = words.length

  // 加载状态
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-16">
        <div className="bg-white border border-gray-200 rounded-none shadow-sm">
          <div className="px-8 py-12 text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-light">加载单词列表中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-16">
        <div className="bg-white border border-red-200 rounded-none shadow-sm">
          <div className="px-8 py-12 text-center">
            <p className="text-red-600 font-light mb-4">{error}</p>
            <button
              onClick={fetchWords}
              className="px-6 py-2 bg-gray-900 text-white rounded-none font-light hover:bg-gray-800 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 空状态
  if (words.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-16">
        <div className="bg-white border border-gray-200 rounded-none shadow-sm">
          <div className="px-8 py-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-light text-gray-900 mb-2">暂无单词记录</h3>
            <p className="text-gray-500 font-light">开始添加一些单词来查看统计信息</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mt-16">
        {/* 简化的统计信息卡片 - 只显示总单词数 */}
        <div className="bg-white border border-gray-200 rounded-none shadow-sm mb-8">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-light text-gray-900">单词统计</h2>
          </div>
          <div className="px-8 py-8">
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 mb-2">{totalWords}</div>
              <div className="text-sm text-gray-500 font-light tracking-wide uppercase">总单词数</div>
            </div>
          </div>
        </div>

        {/* 单词列表 */}
        <div className="bg-white border border-gray-200 rounded-none shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-light text-gray-900">单词列表</h2>
              <div className="text-sm text-gray-500 font-light">
                按频率排序 · 点击查看详情
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {/* 单词网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {words.map((word) => {
                const style = getFrequencyStyle(word.frequency)
                
                return (
                  <div
                    key={word.id}
                    onClick={() => handleWordClick(word)}
                    className={`
                      ${style.containerClass}
                      border rounded-none p-4 transition-all duration-200 hover:shadow-sm cursor-pointer
                      hover:scale-[1.02] active:scale-[0.98]
                    `}
                  >
                    {/* 单词头部 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {style.icon}
                        <span className={`text-xs font-medium ${style.labelClass} tracking-wide uppercase`}>
                          {style.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium ${style.frequencyClass}
                        `}>
                          {word.frequency}次
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* 单词内容 */}
                    <div className="mb-3">
                      <div className={`text-lg font-medium ${style.textClass} break-all`}>
                        {word.word}
                      </div>
                      {/* 显示是否有详细信息 */}
                      {(word.pronunciation || word.definitions || word.examples) && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">已获取详情</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 添加时间 */}
                    <div className="text-xs text-gray-400 font-light">
                      {new Date(word.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 font-light tracking-wide uppercase">
            Word Frequency Statistics
          </p>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-3"></div>
        </div>
      </div>

      {/* 单词详情弹窗 */}
      <WordDetailModal
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onWordUpdated={handleWordUpdated}
      />
    </>
  )
}