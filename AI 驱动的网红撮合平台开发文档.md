# **YouTube 垂类网红精准撮合平台 (Web MVP)  NicheOutreach开发文档**

## **给 AI Coding Agent 的指令 (Instructions to AI Agent)**

你将扮演一位**资深全栈软件工程师**。你的任务是根据这份开发文档，构建一个高可用、可扩展且用户体验流畅的 Web MVP。

**核心核心原则:**

1. **KISS (Keep It Simple, Stupid):** MVP 阶段专注于核心流程（分拣 \-\> 生成文案 \-\> 复制）。  
2. **用户体验至上:** "高密度分拣看板"需要极其流畅，支持全键盘操作。  
3. **关注点分离 (SoC):** 前端仅负责展示和交互，后端专注于爬虫逻辑、数据持久化和 AI 文本生成。  
4. **类型安全:** 必须使用 TypeScript (前端) 和 Pydantic (后端) 进行严格的类型定义。  
5. 在应用搭建完成后，我们会提供各种需要的api key。如果有任何需要的api key，请在开发结束后做一个列表给我，我会提供这些api keys

## ---

**1\. 总体架构图 (High-Level Architecture)**

这是一个经典的解耦架构。

Code snippet

graph TD  
    User\[创始人\] \-- 操作 Web 界面 \--\> FE\[前端: Next.js \+ Tailwind\]  
    FE \-- REST API (JSON) \--\> BE\[后端: FastAPI\]  
    BE \-- 存取数据 \--\> DB\[数据库: PostgreSQL\]  
      
    subgraph "后端异步任务"  
        BE \-- 异步触发 \--\> Wkr\[Task Worker: Celery/Arq\]  
        Wkr \-- 耗时操作 \--\> YTData\[YouTube Data API v3\]  
        Wkr \-- 耗时操作 \--\> YTTrans\[youtube-transcript-api\]  
        Wkr \-- 发送 Context \--\> LLM\[AI Engine: OpenAI/Anthropic\]  
        LLM \-- 生成草稿 \--\> Wkr  
        Wkr \-- 保存结果 \--\> DB  
    end

## ---

**2\. 前端开发文档 (Frontend Development Docs)**

### **2.1 技术栈 (Tech Stack)**

* **Framework:** Next.js 14+ (App Router).  
* **Language:** TypeScript (Strict Mode).  
* **Styling:** Tailwind CSS.  
* **UI Components:** 无头组件库 (如 Headless UI 或 Radix UI) 用于 Modal/Dropdown，保持轻量。Icons 使用 lucide-react.  
* **State Management:**  
  * **Server State:** TanStack Query (React Query) \- 用于获取、缓存和同步后台数据。  
  * **Client State:** Zustand \- 用于处理 UI 状态（如当前选中的线索、键盘快捷键提示的状态）。  
* **Utilities:** clsx / tailwind-merge 用于动态类名组合。

### **2.2 目录结构 (Directory Structure \- Best Practice)**

Plaintext

src/  
├── app/                  \# Next.js App Router 路由  
│   ├── (dashboard)/      \# 需登录后的主业务分组  
│   │   ├── triage/       \# 模块二：线索分拣看板页面  
│   │   │   ├── page.tsx  
│   │   │   └── \_components/\# Triage 专用的局部组件  
│   │   ├── shortlist/    \# 模块三：收藏夹与文案副驾驶页面  
│   │   └── layout.tsx    \# 公共导航  
│   ├── api/              \# 用于 BFF (Backend-for-Frontend) 的轻量路由 (如果需要)  
│   ├── layout.tsx  
│   └── page.tsx          \# 模块一：全局配置/登录页  
├── components/           \# 全局复用 UI 组件 (Button, Input, Card, Skeleton)  
├── hooks/                \# 全局自定义 Hooks (e.g., useKeyboardShortcuts)  
├── lib/                  \# 第三方库配置 (api client, utils)  
├── stores/               \# Zustand stores  
└── types/                \# TypeScript 类型定义 (\*.d.ts)

### **2.3 关键 UI 模块实现细节**

#### **模块二：高密度线索分拣看板 (Triage Dashboard)**

* **布局:** 左右分栏固定，中间不滚动，各自内部滚动。  
* **左侧列表 (Leads List):**  
  * 使用虚拟滚动 (@tanstack/react-virtual) 处理大量线索，保证性能。  
  * 显示：Channel Name, Match Score, Title of latest video.  
* **右侧详情 (Details Pane):**  
  * 展示选中的 KOL 详细数据：Match Score, **AI Reasoning (Must be prominent)**, Key Quotes from transcript (高亮显示).  
* **全键盘快捷键実装 (Core UX):**  
  * 使用 react-hotkeys-hook 库。  
  * ↑ / ↓: 切换左侧列表选中项。  
  * Enter 或 →: Approve (收藏) 该线索，自动跳到下一条。  
  * Backspace 或 ←: Reject (忽略) 该线索，自动跳到下一条。  
  * **Best Practice:** 页面底部需有一个不显眼的 Shortcut Legend，提示用户操作。

#### **模块三：AI 文案副驾驶 (Draft Hub)**

* **布局:** Shortlist 列表在左，Markdown 编辑器风格的邮件草稿区在右。  
* **草稿展示区:**  
  * 并非使用 \<textarea\>，而是使用一个设置了 contenteditable 的 \<div\> 或专用的 Markdown 预览组件。  
  * **变量高亮 (Requirement):** AI 生成的 JSON 中如果包含 {{hook\_video\_title}} 或 {{pain\_point\_timestamp}} 等占位符，前端需通过正则替换为 \<span\> 标签，并应用特定的 Tailwind 类名（例如：bg-yellow-100 text-yellow-900 px-1 rounded），视觉上提醒创始人检查。  
* **交互按钮组:**  
  * **Huge "Copy to Clipboard" Button:** 优先使用 Clipboard API. 成功后需有 Toast 提示。  
  * **\[Open Channel About Page\] Button:** window.open(yt\_channel\_url \+ '/about', '\_blank').

## ---

**3\. 后端开发文档 (Backend Development Docs)**

### **3.1 技术栈 (Tech Stack)**

* **Framework:** FastAPI (Python).  
* **Async runtime:** Asyncio (All DB and network calls must be async).  
* **ORM:** SQLModel (Wrapper around SQLAlchemy and Pydantic).  
* **Database:** PostgreSQL.  
* **Task Queue:** Arq (Redis-based, for lightweight async jobs) 或 Celery. *爬虫和 LLM 调用必须是异步任务*。  
* **External APIs:** Google Python Client (YouTube Data v3), youtube-transcript-api.  
* **LLM Integration:** 直接调用 Gemini API.

### **3.2 数据库 Schema (SQLModel Entity Definitions)**

Python

from sqlmodel import SQLModel, Field, Relationship  
from typing import List, Optional  
from datetime import datetime  
from pgvector.sqlalchemy import Vector \# 如果未来需要做语义搜索  
from sqlalchemy import Column, JSON

class UserContext(SQLModel, table=True):  
    id: Optional\[int\] \= Field(default=None, primary\_key=True)  
    product\_value: str  
    target\_pain\_points: str  
    spider\_keywords: str  \# Comma separated  
    min\_subscribers: int  
    created\_at: datetime \= Field(default\_factory=datetime.utcnow)

class LeadStatus(str, Enum):  
    PENDING \= "pending"   \# 待分拣  
    APPROVED \= "approved" \# 已收藏  
    REJECTED \= "rejected" \# 已忽略

class YoutubeLead(SQLModel, table=True):  
    id: str \= Field(primary\_key=True) \# Youtube Channel ID  
    channel\_name: str  
    channel\_url: str  
    subscriber\_count: int  
      
    \# 核心数据  
    latest\_video\_title: str  
    latest\_video\_id: str  
    \# 存储原始 Transcript 数据 (list of dicts)  
    transcript\_raw: Optional\[List\[dict\]\] \= Field(default=None, sa\_column=Column(JSON))  
      
    \# AI 分析结果  
    match\_score: int  
    ai\_reasoning: str  
    \# 存储生成的 Draft 模板，包含变量  
    email\_draft\_template: Optional\[str\] \= Field(default=None)   
      
    \# 状态管理  
    status: LeadStatus \= Field(default=LeadStatus.PENDING)  
    created\_at: datetime \= Field(default\_factory=datetime.utcnow)  
    updated\_at: datetime \= Field(default\_factory=datetime.utcnow)

### **3.3 API 端点设计 (RESTful)**

| Method | Endpoint | Description | Payload |
| :---- | :---- | :---- | :---- |
| **POST** | /api/v1/context | 保存创始人输入，触发异步爬虫任务 | UserContextCreate |
| **GET** | /api/v1/leads?status=pending | 获取待分拣线索 (用于 Triage 看板) | None |
| **PATCH** | /api/v1/leads/{lead\_id} | 审批线索 (Approve/Reject) | {"status": "approved"} |
| **GET** | /api/v1/leads?status=approved | 获取已收藏线索 (用于 Shortlist) | None |

### **3.4 异步后台任务逻辑 (The Engine)**

当 /api/v1/context 被调用时，后端需启动异步任务：

1. **Task 1: Spider (YT API \+ Transcript)**  
   * 使用 YouTube Data API 根据 spider\_keywords 搜索视频/频道。  
   * 过滤 min\_subscribers。  
   * 针对符合条件的每个频道，获取其最新视频的 ID。  
   * 调用 youtube-transcript-api 获取字幕文本。  
2. **Task 2: AI Processor (LLM)**  
   * **Input:** Product Value, Pain Points, Channel Info, Video Title, Transcript.  
   * **Prompt Engineering (关键):**  
     * "扮演一位擅长 Cold Outreach 的增长黑客。"  
     * "根据提供的视频字幕，找出红人最关心的痛点，或者他的原话。"  
     * "生成一个极具个性化的开篇钩子 (Hook)。不要说 '我看了你的视频' 这种废话。"  
     * "将个性化信息放入变量 {{变量名}} 中。"  
     * "最终输出 JSON 格式: {"match\_score": 95, "reason": "...", "subject": "...", "body\_template": "..."}"  
3. **Task 3: Persistence**  
   * 将爬取和生成的数据保存到 YoutubeLead 表中，状态设为 PENDING。

## ---

**4\. 交付物检查清单 (Agent Completion Checklist)**

AI Agent 在宣称完成任务前，必须自我检查以下各项：

* \[ \] **技术栈一致性:** 前端是否使用了 Next.js 14, TypeScript, Tailwind, Zustand, TanStack Query？后端是否使用了 FastAPI, SQLModel, Arq？  
* \[ \] **PRD 还原度:**  
  * \[ \] 模块一：可以输入上下文。  
  * \[ \] 模块二：分拣看板支持键盘 ↑ ↓ Enter Backspace 操作吗？是否左右分栏？有显示 AI 理由吗？  
  * \[ \] 模块三：收藏夹能看到预生成的邮件草稿吗？变量（如视频标题、痛点）是否在 UI 上高亮了？复制按钮有用吗？跳转 YouTube About 页面按钮有用吗？  
* \[ \] **代码质量 (Best Practices):**  
  * \[ \] TypeScript 是否启用了 strict 模式？没有 any 类型。  
  * \[ \] 后端 API 路径是否使用了版本号 (/v1/)？  
  * \[ \] 耗时的网络请求（YT API, OpenAI API）是否都在后台异步任务中运行，没有阻塞 API 响应？  
  * \[ \] 是否有基本的错误处理（e.g., 爬虫失败时的占位状态，LLM 生成失败时的重试机制）？