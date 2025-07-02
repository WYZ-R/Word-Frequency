# 单词频率追踪器 (Word Frequency Tracker)

一个简单直观的 Web 应用程序，用于记录和追踪您输入的单词频率。它帮助用户分析文本中单词的使用情况，并提供单词的详细信息，包括发音、定义和例句。
![image](https://github.com/user-attachments/assets/762a4fae-8fc5-4997-a60a-0e54705978c7)

## ✨ 功能特性

*   **单词频率统计：** 粘贴文本或输入单词（多个单词空格隔开），应用会自动解析并统计每个单词的出现频率。
![image](https://github.com/user-attachments/assets/d6ba95dc-bb1a-4785-9c83-0f5fc760ef6a)
*   **实时更新：** 单词频率会即时更新，并按频率降序排列。
*   **单词详情查询：** 点击列表中的单词，可查看其详细信息，包括：
    *   发音（支持音频播放）
    *   定义
    *   例句
![image](https://github.com/user-attachments/assets/1968f2ab-adb3-4b5f-bc37-704dad591d6e)
![image](https://github.com/user-attachments/assets/67b229d2-19bc-4597-9654-a968cacc0310)
*   **智能详情获取：** 自动从外部 API 获取单词详情，并缓存到数据库中，避免重复请求。
*   **响应式设计：** 界面适应不同屏幕尺寸，提供良好的用户体验。
*   **Supabase 集成：** 使用 Supabase 作为后端数据库，提供数据存储和实时同步能力。



## 🚀 技术栈

*   **前端:**
    *   **React 18:** 构建用户界面的核心库。
    *   **TypeScript:** 提供类型安全，增强代码可维护性。
    *   **Tailwind CSS:** 快速构建响应式和美观的用户界面。
    *   **Lucide React:** 简洁的开源图标库。
    *   **Vite:** 极速的前端开发和构建工具。
*   **后端/数据库:**
    *   **Supabase:** 开源的 Firebase 替代方案，提供 PostgreSQL 数据库、认证和实时功能。
*   **外部 API:**
    *   **Free Dictionary API:** 用于获取单词的发音、定义和例句。

## 🛠️ 快速开始

### 先决条件

在开始之前，请确保您的开发环境中已安装以下软件：

*   Node.js (推荐 LTS 版本)
*   npm 或 Yarn
*   一个 Supabase 账户和一个新的 Supabase 项目

### 安装步骤

1.  **克隆仓库:**
    ```bash
    git clone <repository-url>
    cd word-frequency-tracker
    ```
2.  **安装依赖:**
    ```bash
    npm install
    # 或者 yarn install
    ```
3.  **配置环境变量:**
    在项目根目录创建 `.env` 文件，并根据 `.env.example` 填写您的 Supabase 项目信息：
    ```
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *   您可以在 Supabase 项目设置的 `API` 页面找到这些值。

### 数据库设置 (Supabase)

1.  **创建 Supabase 项目:** 如果您还没有，请在 Supabase 官网创建一个新项目。
2.  **运行迁移:**
    项目包含数据库迁移文件，用于设置 `words` 表及其相关字段和策略。您可以通过 Supabase CLI 或手动在 Supabase SQL 编辑器中运行这些迁移。
    *   `supabase/migrations/20250628185011_lively_canyon.sql`: 创建 `words` 表并设置 RLS 策略。
    *   `supabase/migrations/20250629095947_peaceful_smoke.sql`: 添加 `pronunciation`, `examples`, `definitions`, `last_fetched_at` 字段。
    *   `supabase/migrations/20250629101458_raspy_smoke.sql`: 添加 `pronunciations` 字段以支持多发音和音频。

    **推荐使用 Supabase CLI:**
    ```bash
    # 确保已安装 Supabase CLI
    supabase login
    supabase link --project-ref your-project-id
    supabase db push
    ```
    或者，您可以将 `supabase/migrations` 目录下的 SQL 文件内容复制粘贴到 Supabase 项目的 SQL 编辑器中并运行。

### 运行应用

1.  **启动开发服务器:**
    ```bash
    npm run dev
    # 或者 yarn dev
    ```
2.  **访问应用:**
    应用将在 `http://localhost:5173` (或 Vite 提示的其他端口) 上运行。

## 💡 使用指南

1.  在主页的文本输入框中输入或粘贴您想要分析的文本。
2.  点击“添加单词”按钮。应用将处理文本，提取单词，并更新它们的频率。
3.  在下方的单词列表中，您将看到按频率排序的单词。
4.  点击任何单词卡片，将弹出一个模态框，显示该单词的详细信息，包括发音、定义和例句。

## 🤝 贡献

欢迎任何形式的贡献！如果您有任何建议或发现 Bug，请随时提交 Issue 或 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证。





