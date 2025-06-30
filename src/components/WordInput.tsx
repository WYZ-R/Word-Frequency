import React, { useState } from 'react'
import { Plus, Type, CheckCircle, AlertCircle } from 'lucide-react'
import { addOrUpdateWordsConcurrently } from '../lib/supabase'

interface WordInputProps {
  onWordsAdded: () => void
}

export default function WordInput({ onWordsAdded }: WordInputProps) {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedWords, setProcessedWords] = useState<string[]>([])
  const [failedWords, setFailedWords] = useState<string[]>([])

  const processWords = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    
    // 清空之前的结果
    setProcessedWords([])
    setFailedWords([])

    // 解析输入文本，提取单词
    const words = inputText
      .toLowerCase()
      .split(/\s+/) // 按空白字符分割
      .filter(word => word.length > 0) // 过滤空字符串
      .map(word => word.replace(/[^a-z]/g, '')) // 只保留字母字符，移除数字和标点符号
      .filter(word => word.length > 0) // 再次过滤空字符串
      .filter(word => word.length >= 2) // 过滤掉单个字母（通常不是有意义的单词）

    if (words.length === 0) {
      setIsProcessing(false)
      return
    }

    try {
      // 使用并发处理函数批量处理所有单词
      const { success, failed } = await addOrUpdateWordsConcurrently(words)
      
      // 更新状态显示处理结果
      setProcessedWords(success.map(word => word.word))
      setFailedWords(failed)
      
      // 清空输入框
      setInputText('')
      
      // 通知父组件刷新单词列表
      onWordsAdded()
    } catch (error) {
      console.error('处理单词时出错:', error)
      setFailedWords(words)
    } finally {
      setIsProcessing(false)
      
      // 4秒后清空结果显示
      setTimeout(() => {
        setProcessedWords([])
        setFailedWords([])
      }, 4000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 主输入区域 */}
      <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
        {/* 头部区域 */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <Type className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light text-gray-900">单词记录器</h2>
              <p className="text-sm text-gray-500 mt-1">输入文本，自动统计单词频率</p>
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="px-8 py-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="word-input" className="block text-sm font-medium text-gray-700 mb-3">
                输入单词或文本
              </label>
              <textarea
                id="word-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入单词或句子..."
                className="w-full h-32 px-4 py-4 border border-gray-200 rounded-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none transition-all duration-200 text-gray-900 placeholder-gray-400 font-light"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-2">
                提示：只会记录字母组成的单词，数字和标点符号会被自动过滤
              </p>
            </div>

            <button
              onClick={processWords}
              disabled={!inputText.trim() || isProcessing}
              className="w-full bg-gray-900 text-white py-4 px-6 rounded-none font-light hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 text-sm tracking-wide uppercase"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                  处理中
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  添加单词
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 成功处理的单词反馈 */}
      {processedWords.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                成功处理 {processedWords.length} 个单词
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {processedWords.map((word, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-green-50 border border-green-200 text-center"
                >
                  <span className="text-sm font-light text-green-900">{word}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 失败处理的单词反馈 */}
      {failedWords.length > 0 && (
        <div className="mt-4 bg-white border border-red-200 rounded-none shadow-sm overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-900">
                处理失败 {failedWords.length} 个单词
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {failedWords.map((word, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-red-50 border border-red-200 text-center"
                >
                  <span className="text-sm font-light text-red-900">{word}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400 font-light tracking-wide uppercase">
          Word Frequency Tracker
        </p>
        <div className="w-12 h-px bg-gray-300 mx-auto mt-3"></div>
      </div>
    </div>
  )
}