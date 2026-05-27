import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Gem,
  Heart,
  Map,
  Medal,
  MessageCircle,
  Pause,
  Play,
  RefreshCcw,
  Route,
  ScrollText,
  Search,
  Settings2,
  Shield,
  Swords,
  Trophy,
  WandSparkles,
  Zap,
} from 'lucide-react'
import './App.css'
import { comfyUiResearchPlan } from './researchFallbacks'

const navItems = [
  { label: '今日开工', icon: Swords },
  { label: '目标地图', icon: Map },
  { label: '任务清单', icon: ScrollText },
  { label: '复盘', icon: MessageCircle },
  { label: '成就系统', icon: Trophy },
]

const achievements = [
  { label: '七日连击', icon: Flame, tone: 'green' },
  { label: '首次暴击', icon: Zap, tone: 'blue' },
  { label: '低压启动', icon: Shield, tone: 'cream' },
]

const defaultGoal = {
  title: '30 天学会 ComfyUI',
  days: 30,
  dailyMinutes: 30,
  level: '零基础',
}

function buildFallbackPlan(goal) {
  if (/comfy\s*ui|comfyui/i.test(goal.title)) {
    return {
      ...comfyUiResearchPlan,
      goalTitle: goal.title,
      days: Number(goal.days) || comfyUiResearchPlan.days,
      dailyMinutes: Number(goal.dailyMinutes) || comfyUiResearchPlan.dailyMinutes,
      level: goal.level,
      researchSummary: {
        ...comfyUiResearchPlan.researchSummary,
        note: '当前环境不支持页面内联网请求，已使用预研的 ComfyUI 官方资料计划。',
      },
    }
  }

  const days = Number(goal.days) || 30
  const minutes = Number(goal.dailyMinutes) || 30
  const isComfy = /comfy\s*ui|comfyui/i.test(goal.title)
  const topic = isComfy ? 'ComfyUI' : goal.title.replace(/\d+\s*天/g, '').trim() || '新技能'
  const chapters = isComfy
    ? ['安装与模型准备', '理解节点和工作流', '文生图与图生图实战', '进阶工作流与自定义节点']
    : ['理解目标', '基础输入', '小作品练习', '复盘巩固']
  const tasks = isComfy
    ? ['阅读安装要求并确认模型目录', '完成 ComfyUI 启动，并保存第一张测试图', '拆解基础文生图 workflow 的核心节点', '修改 prompt、采样器和步数，记录输出差异']
    : ['完成今天最小可行动作', '整理 3 个关键材料', '推进一个 10 分钟小步骤', '做一次低压复盘']

  return {
    goalTitle: goal.title,
    days,
    dailyMinutes: minutes,
    level: goal.level,
    researchSummary: {
      topic,
      sourceNames: isComfy ? 'ComfyUI Documentation、ComfyUI GitHub' : '本地学习模板',
      method: isComfy
        ? ['先跑通最小工作流，再学习节点含义', '每天保存一个可复现 workflow', '优先排查模型路径、缺失节点和版本问题']
        : ['每天只做一个可验证小任务', '先模仿再改动', '用复盘调整任务大小'],
      note: '网络检索失败时使用本地兜底计划。',
    },
    boss: {
      name: `${topic}${isComfy ? '节点工作流焦虑' : '开始困难怪'}`,
      tag: '第 1 天 Boss',
      hp: 68,
      task: tasks[0],
      micro: isComfy ? '打开 ComfyUI 文档，确认安装方式和模型目录' : '打开第一份学习资料，停留 2 分钟',
      time: `${Math.max(8, Math.round(minutes * 0.4))} 分钟`,
      mood: 'calm',
    },
    mapNodes: chapters.map((chapter, index) => ({
      title: `${index + 1}. ${chapter}`,
      detail: index === 0 ? '1/8 今日推进' : '预计 8 个小任务',
      active: index === 0,
      done: false,
    })),
    dailyTasks: tasks.map((task, index) => ({
      title: task,
      day: index + 1,
      minutes: Math.max(8, Math.round(minutes * 0.4) + index * 3),
      method: isComfy ? '复现一个最小工作流并记录变化' : '只完成可验证的一小步',
    })),
    fullPlan: [],
    next: isComfy ? '安装与模型目录检查' : '最小可行动作',
    sources: [],
  }
}

function requestResearchPlan(goal) {
  if (typeof window.fetch === 'function') {
    return window.fetch('/api/research-plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(goal),
    }).then(async (response) => {
      if (!response.ok) throw new Error('研究接口暂时不可用，已使用本地计划兜底。')
      return response.json()
    })
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/research-plan')
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error('研究接口暂时不可用，已使用本地计划兜底。'))
        return
      }
      try {
        resolve(JSON.parse(xhr.responseText))
      } catch {
        reject(new Error('研究结果解析失败，已使用本地计划兜底。'))
      }
    }
    xhr.onerror = () => reject(new Error('网络请求失败，已使用本地计划兜底。'))
    xhr.send(JSON.stringify(goal))
  })
}

function Sidebar({ plan }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">反</div>
        <div>
          <h1>反拖延神器</h1>
          <p>把目标切到刚好能开始</p>
        </div>
      </div>

      <nav className="nav-list" aria-label="主导航">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button className={index === 0 ? 'nav-item active' : 'nav-item'} key={item.label} type="button">
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <section className="long-goal">
        <div className="section-eyebrow">当前长期目标</div>
        <h2>{plan.goalTitle}</h2>
        <div className="goal-metrics">
          <div>
            <strong>Lv. 6</strong>
            <span>行动者</span>
          </div>
          <div>
            <strong>7</strong>
            <span>连续开工</span>
          </div>
        </div>
        <div className="xp-row">
          <span>XP 进度</span>
          <strong>460 / 500</strong>
        </div>
        <div className="xp-track">
          <span style={{ width: '92%' }} />
        </div>
      </section>

      <div className="sidebar-footer">
        <Heart size={16} />
        <p>今天不追求满分，只要把第一步做出来。</p>
      </div>
    </aside>
  )
}

function GoalBuilder({ draftGoal, setDraftGoal, onGenerate, isResearching }) {
  function updateField(field, value) {
    setDraftGoal((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="goal-builder">
      <div className="builder-title">
        <Settings2 size={17} />
        <span>自定义大目标</span>
      </div>
      <div className="builder-grid">
        <label className="builder-field goal-input">
          <span>我想完成</span>
          <input value={draftGoal.title} onChange={(event) => updateField('title', event.target.value)} placeholder="例如：30 天学会 ComfyUI" />
        </label>
        <label className="builder-field">
          <span>周期</span>
          <input min="7" max="180" type="number" value={draftGoal.days} onChange={(event) => updateField('days', event.target.value)} />
        </label>
        <label className="builder-field">
          <span>每天</span>
          <input min="5" max="180" type="number" value={draftGoal.dailyMinutes} onChange={(event) => updateField('dailyMinutes', event.target.value)} />
        </label>
        <label className="builder-field">
          <span>基础</span>
          <select value={draftGoal.level} onChange={(event) => updateField('level', event.target.value)}>
            <option>零基础</option>
            <option>有一点基础</option>
            <option>进阶冲刺</option>
          </select>
        </label>
        <button className="generate-btn" type="button" onClick={onGenerate} disabled={isResearching}>
          {isResearching ? <Search size={17} /> : <WandSparkles size={17} />}
          {isResearching ? '联网检索中' : '生成每日小目标'}
        </button>
      </div>
    </section>
  )
}

function ResearchBrief({ plan, isResearching, researchError }) {
  const sources = plan.sources || []
  return (
    <section className="research-brief">
      <div className="brief-head">
        <div>
          <div className="section-eyebrow">研究摘要</div>
          <h2>{isResearching ? '正在联网理解目标' : `${plan.researchSummary?.topic || '目标'} 学习路线`}</h2>
        </div>
        <span>{isResearching ? 'Researching' : sources.some((source) => source.status === 'live') ? 'Live sources' : 'Fallback'}</span>
      </div>
      <p>{researchError || plan.researchSummary?.note}</p>
      <div className="method-list">
        {(plan.researchSummary?.method || []).slice(0, 3).map((method) => (
          <span key={method}>{method}</span>
        ))}
      </div>
      <div className="source-list">
        {sources.slice(0, 2).map((source) => (
          <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
            {source.title}
          </a>
        ))}
      </div>
    </section>
  )
}

function BossAvatar({ mood }) {
  return (
    <div className={`boss-avatar ${mood}`}>
      <span className="aura aura-one" />
      <span className="aura aura-two" />
      <div className="horn left" />
      <div className="horn right" />
      <div className="boss-body">
        <span className="eye left" />
        <span className="eye right" />
        <span className="mouth" />
      </div>
    </div>
  )
}

function ParticleBurst({ active }) {
  if (!active) return null

  return (
    <div className="particle-burst" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => (
        <i key={index} style={{ '--i': index }} />
      ))}
    </div>
  )
}

function DailyTaskList({ tasks }) {
  return (
    <div className="daily-split">
      <div className="split-head">
        <span>后续小目标</span>
        <small>由研究结果自动切分</small>
      </div>
      <div className="daily-list">
        {tasks.map((task, index) => (
          <div className={index === 0 ? 'daily-task active' : 'daily-task'} key={`${task.day}-${task.title}`}>
            <span>Day {task.day}</span>
            <strong>{task.title}</strong>
            <small>{task.minutes} 分钟</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function FullPlanPreview({ plan }) {
  const fullPlan = plan.fullPlan || []
  if (!fullPlan.length) return null

  return (
    <div className="full-plan-preview">
      <div className="split-head">
        <span>完整 {plan.days} 天计划</span>
        <small>展示前 7 天，可继续展开</small>
      </div>
      <div className="full-plan-list">
        {fullPlan.slice(0, 7).map((task) => (
          <div key={`${task.day}-${task.title}`}>
            <span>Day {task.day}</span>
            <strong>{task.title}</strong>
            <small>{task.chapter} · {task.output}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function BossBattle({ boss, hp, xpGain, isFighting, combo, onAttack, onShrink, onSwap, onContinue, particles, plan }) {
  const defeated = 100 - hp

  return (
    <section className="battle-card">
      <ParticleBurst active={particles} />
      <div className="battle-layout">
        <div className="battle-primary">
          <div className="battle-context">
            <span>今日唯一主线</span>
            <strong>{boss.tag}</strong>
          </div>

          <div className="quest-panel">
            <div className="quest-main">
              <div className="section-eyebrow">推荐攻击</div>
              <h3>{boss.task}</h3>
              <p>{boss.micro}</p>
            </div>
            <div className="quest-time">
              <Activity size={16} />
              <strong>{boss.time}</strong>
            </div>
          </div>

          <div className="action-grid">
            <button className="primary-action" type="button" onClick={onAttack}>
              <Swords size={18} />
              <span>发起攻击</span>
            </button>
            <button type="button" onClick={onShrink}>
              <Shield size={18} />
              <span>缩小任务</span>
            </button>
            <button type="button" onClick={onSwap}>
              <RefreshCcw size={18} />
              <span>换个打法</span>
            </button>
            <button type="button" onClick={onContinue}>
              <Flame size={18} />
              <span>连击继续</span>
            </button>
          </div>

          <DailyTaskList tasks={plan.dailyTasks} />
          <FullPlanPreview plan={plan} />
        </div>

        <aside className="boss-side">
          <div className="boss-side-top">
            <div>
              <div className="section-eyebrow">Boss</div>
              <h2>{boss.name}</h2>
            </div>
            <BossAvatar mood={boss.mood} />
          </div>

          <div className="hp-panel">
            <div className="hp-label">
              <span>HP</span>
              <strong>{hp}%</strong>
            </div>
            <div className="hp-track">
              <span style={{ width: `${hp}%` }} />
            </div>
            <div className="battle-status">
              <span>{isFighting ? '战斗中' : '待开战'}</span>
              <span>已击破 {defeated}%</span>
            </div>
          </div>

          <div className="reward-strip">
            <span className="reward-pop">+{xpGain} XP</span>
            <strong>{combo} 连击</strong>
            <p>失败不扣分，只会把下一步切小。</p>
            <div className="mini-rewards">
              <span>专注</span>
              <span>勇气</span>
              <span>复盘</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function RightPanel({ status, setStatus, note, setNote, mapNodes }) {
  return (
    <aside className="right-panel">
      <section className="panel map-panel">
        <div className="panel-title">
          <Route size={18} />
          <h2>今日目标地图</h2>
        </div>
        <div className="map-tree">
          {mapNodes.map((node) => (
            <div className={node.active ? 'map-node active' : node.done ? 'map-node done' : 'map-node'} key={node.title}>
              <span />
              <div>
                <strong>{node.title}</strong>
                <p>{node.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel feedback-panel">
        <div className="panel-title">
          <WandSparkles size={18} />
          <h2>状态反馈</h2>
        </div>
        <div className="status-options">
          {['轻松', '刚好', '困难'].map((item) => (
            <button className={status === item ? 'selected' : ''} key={item} type="button" onClick={() => setStatus(item)}>
              {item}
            </button>
          ))}
        </div>
        <label className="emotion-input">
          <span>情绪反馈</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="今天卡住的地方是什么？" />
        </label>
        <div className="review-card">
          <strong>今日复盘</strong>
          <p>{status === '困难' ? '明天自动降到 2 分钟启动任务。' : '保持当前节奏，继续推进一小步。'}</p>
        </div>
      </section>

      <section className="panel achievement-panel">
        <div className="panel-title">
          <Medal size={18} />
          <h2>成就徽章</h2>
        </div>
        <div className="badge-row">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div className={`achievement ${achievement.tone}`} key={achievement.label}>
                <Icon size={18} />
                <span>{achievement.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel trend-panel">
        <div className="panel-title">
          <BarChart3 size={18} />
          <h2>数据趋势</h2>
        </div>
        <div className="trend-bars" aria-label="近七日开工趋势">
          {[42, 58, 36, 74, 64, 86, 78].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <p>近 7 日平均开工 18 分钟，比上周多 24%。</p>
      </section>
    </aside>
  )
}

function PetCompanion({ mood, line }) {
  return (
    <div className={`pet-companion ${mood}`}>
      <div className="speech">{line}</div>
      <div className="pet">
        <span className="pet-ear left" />
        <span className="pet-ear right" />
        <span className="pet-face">
          <i />
          <i />
          <b />
        </span>
      </div>
    </div>
  )
}

function App() {
  const [draftGoal, setDraftGoal] = useState(defaultGoal)
  const [plan, setPlan] = useState(() => buildFallbackPlan(defaultGoal))
  const [hp, setHp] = useState(plan.boss.hp)
  const [xpGain, setXpGain] = useState(25)
  const [combo, setCombo] = useState(7)
  const [isFighting, setIsFighting] = useState(false)
  const [particles, setParticles] = useState(false)
  const [status, setStatus] = useState('刚好')
  const [note, setNote] = useState('')
  const [petMood, setPetMood] = useState('idle')
  const [petLine, setPetLine] = useState('只做2分钟。')
  const [isResearching, setIsResearching] = useState(false)
  const [researchError, setResearchError] = useState('')

  useEffect(() => {
    if (!particles) return undefined
    const timer = window.setTimeout(() => setParticles(false), 900)
    return () => window.clearTimeout(timer)
  }, [particles])

  const headerText = useMemo(() => {
    if (isResearching) return '正在联网理解目标，先找资料，再切任务。'
    if (hp <= 30) return 'Boss 已经动摇，今天再补一击就够了。'
    if (status === '困难') return '今天任务会自动变小，先保护启动感。'
    return '输入大目标后，系统会先研究它，再给出每日学习计划。'
  }, [hp, status, isResearching])

  async function handleGeneratePlan() {
    setIsResearching(true)
    setResearchError('')
    setPetMood('excited')
    setPetLine('我先去查资料，再帮你切成每日小目标。')

    try {
      const nextPlan = await requestResearchPlan(draftGoal)
      setPlan(nextPlan)
      setHp(nextPlan.boss.hp)
      setIsFighting(false)
      setParticles(true)
      setPetLine('资料查好了。今天只做第一格，不用一次学完。')
    } catch (error) {
      const fallback = buildFallbackPlan(draftGoal)
      setPlan(fallback)
      setHp(fallback.boss.hp)
      setResearchError(error.message)
      setPetLine('网络有点慢，我先用本地路线帮你开工。')
    } finally {
      setIsResearching(false)
    }
  }

  function handleAttack() {
    const critical = Math.random() > 0.45
    const damage = critical ? 18 : 11
    setHp((value) => Math.max(0, value - damage))
    setXpGain((value) => value + (critical ? 35 : 20))
    setCombo((value) => value + 1)
    setIsFighting(true)
    setParticles(true)
    setPetMood('celebrate')
    setPetLine(critical ? '暴击！看吧，你已经进入状态了。' : '很好，这一击已经算数。')
  }

  function handleShrink() {
    setIsFighting(false)
    setPetMood('soft')
    setPetLine('任务已缩小。现在只需要打开它。')
  }

  function handleSwap() {
    setPlan((current) => {
      const [first, second, third, fourth] = current.dailyTasks
      const rotatedTasks = [second, third, fourth, first].filter(Boolean)
      return {
        ...current,
        boss: {
          ...current.boss,
          task: rotatedTasks[0]?.title || current.boss.task,
          time: `${rotatedTasks[0]?.minutes || 5} 分钟`,
          micro: rotatedTasks[0]?.method || '换一种更轻的打法：只完成这一步的开头。',
        },
        dailyTasks: rotatedTasks,
      }
    })
    setIsFighting(false)
    setPetMood('idle')
    setPetLine('打法已更换，难度不变，阻力更小。')
  }

  function handleContinue() {
    setIsFighting(true)
    setCombo((value) => value + 1)
    setPetMood('excited')
    setPetLine('连击继续，但只加 5 分钟。')
  }

  return (
    <div className="app">
      <Sidebar plan={plan} />

      <main className="main-area">
        <header className="hero-header">
          <div>
            <div className="section-eyebrow">Dashboard · 今日战役</div>
            <h1>今日 Boss 战</h1>
            <p>{headerText}</p>
          </div>
          <div className="profile-card">
            <div>
              <strong>Lv. 6 行动者</strong>
              <span>还差 40 XP 升级</span>
            </div>
            <Gem size={22} />
          </div>
        </header>

        <GoalBuilder draftGoal={draftGoal} setDraftGoal={setDraftGoal} onGenerate={handleGeneratePlan} isResearching={isResearching} />
        <ResearchBrief plan={plan} isResearching={isResearching} researchError={researchError} />

        <BossBattle
          boss={plan.boss}
          hp={hp}
          xpGain={xpGain}
          isFighting={isFighting}
          combo={combo}
          onAttack={handleAttack}
          onShrink={handleShrink}
          onSwap={handleSwap}
          onContinue={handleContinue}
          particles={particles}
          plan={plan}
        />

        <section className="bottom-dock">
          <div>
            <BookOpen size={18} />
            <span>下一步：{plan.next}</span>
          </div>
          <button type="button">
            <Play size={16} />
            开启 2 分钟
          </button>
          <button type="button">
            <Pause size={16} />
            温柔暂停
          </button>
          <button type="button">
            <Check size={16} />
            记录进展
          </button>
        </section>
      </main>

      <RightPanel status={status} setStatus={setStatus} note={note} setNote={setNote} mapNodes={plan.mapNodes} />
      <PetCompanion mood={petMood} line={petLine} />

      <button className="floating-next" type="button" aria-label="下一步">
        <ChevronRight size={22} />
      </button>
    </div>
  )
}

export default App
