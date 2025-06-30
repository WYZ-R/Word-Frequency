import React, { useState } from 'react'
import WordInput from './components/WordInput'
import WordList from './components/WordList'

function App() {
  // 用于触发 WordList 组件数据刷新的状态
  // 当 WordInput 组件添加新单词后，会增加这个值，从而触发 WordList 重新获取数据
  const [refreshKey, setRefreshKey] = useState(0)

  // 处理单词添加完成的回调函数
  // 这个函数会被传递给 WordInput 组件，在单词成功添加后调用
  const handleWordsAdded = () => {
    setRefreshKey(prev => prev + 1) // 增加 refreshKey 触发 WordList 刷新
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主容器 */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* 页面标题区域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Word Frequency
          </h1>
          {/* 装饰性分割线 */}
          <div className="w-24 h-0.5 bg-gray-900 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-light max-w-md mx-auto leading-relaxed">
            记录和追踪您的单词使用频率，让语言学习更加直观
          </p>
        </div>

        {/* 单词输入组件 */}
        {/* 传递 onWordsAdded 回调函数，当单词添加成功后会调用 handleWordsAdded */}
        <WordInput onWordsAdded={handleWordsAdded} />
        
        {/* 单词列表显示组件 */}
        {/* 传递 refreshKey 属性，当这个值变化时，WordList 会重新获取数据 */}
        <WordList refreshKey={refreshKey} />
      </div>
    </div>
  )
}

export default App