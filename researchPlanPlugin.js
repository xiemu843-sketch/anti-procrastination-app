const fallbackSources = {
  comfyui: [
    {
      title: 'ComfyUI Documentation',
      url: 'https://docs.comfy.org/',
      summary: 'ComfyUI is a node-based interface for creating and running image, video, and audio generation workflows. Beginners should learn installation, model placement, basic node graphs, workflows, and custom nodes in that order.',
    },
    {
      title: 'ComfyUI GitHub',
      url: 'https://github.com/comfyanonymous/ComfyUI',
      summary: 'The official repository explains installation, model folders, running ComfyUI, workflow JSON files, and core concepts such as nodes, checkpoints, samplers, VAEs, and image outputs.',
    },
  ],
}

const topicProfiles = {
  comfyui: {
    label: 'ComfyUI',
    boss: '节点工作流焦虑',
    chapters: ['安装与模型准备', '理解节点和工作流', '文生图与图生图实战', '进阶工作流与自定义节点'],
    milestones: [
      '跑通本地 ComfyUI，并加载一个基础模型',
      '看懂 checkpoint、prompt、sampler、VAE、save image 的基础链路',
      '完成文生图、图生图、局部重绘三个基础工作流',
      '安装 ComfyUI-Manager，并复用一个社区工作流',
    ],
    methods: [
      '每天先复现一个最小工作流，再改一个参数观察变化',
      '建立自己的 workflow 文件夹，保存每次可复现的 JSON',
      '遇到节点报错时先记录缺失模型、缺失自定义节点、路径错误三类原因',
    ],
    micro: '打开 ComfyUI 文档，确认安装方式和模型目录',
    next: '安装与模型目录检查',
  },
  generic: {
    label: '新技能',
    boss: '开始困难怪',
    chapters: ['理解目标', '基础输入', '小作品练习', '复盘巩固'],
    milestones: ['建立学习地图', '完成第一组练习', '做一个小作品', '总结下一阶段路线'],
    methods: ['每天只做一个可验证小任务', '先模仿再改动', '用复盘调整任务大小'],
    micro: '打开第一份学习资料，停留 2 分钟',
    next: '最小可行动作',
  },
}

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function detectTopic(goalTitle) {
  if (/comfy\s*ui|comfyui/i.test(goalTitle)) return 'comfyui'
  return 'generic'
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchSummary(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'AntiProcrastinationPrototype/1.0',
        accept: 'text/html,text/plain,application/json',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    return stripHtml(html).slice(0, 900)
  } finally {
    clearTimeout(timeout)
  }
}

async function researchSources(topic) {
  const seeds = topic === 'comfyui' ? fallbackSources.comfyui : []
  const researched = []

  for (const source of seeds) {
    try {
      const summary = await fetchSummary(source.url)
      researched.push({
        ...source,
        summary: summary || source.summary,
        status: 'live',
      })
    } catch (error) {
      researched.push({
        ...source,
        status: 'fallback',
        error: error.message,
      })
    }
  }

  return researched.length ? researched : fallbackSources.comfyui
}

function inferDays(rawTitle, fallbackDays) {
  const match = rawTitle.match(/(\d+)\s*(天|日|day|days)/i)
  return match ? Number(match[1]) : fallbackDays
}

function buildDailyPlan({ goalTitle, days, dailyMinutes, level, topic, sources }) {
  const profile = topicProfiles[topic] || topicProfiles.generic
  const totalDays = Math.max(7, Math.min(90, inferDays(goalTitle, Number(days) || 30)))
  const minutes = Math.max(10, Math.min(180, Number(dailyMinutes) || 30))
  const chapterSize = Math.max(2, Math.ceil(totalDays / profile.chapters.length))
  const taskMinutes = Math.max(5, Math.min(35, Math.round(minutes * 0.45)))
  const sourceNames = sources.map((source) => source.title).join('、')

  const dailyTasks = Array.from({ length: Math.min(totalDays, 30) }, (_, index) => {
    const day = index + 1
    const chapterIndex = Math.min(profile.chapters.length - 1, Math.floor(index / chapterSize))
    const chapter = profile.chapters[chapterIndex]
    const milestone = profile.milestones[chapterIndex]
    const templates = topic === 'comfyui'
      ? [
          '阅读安装要求并确认 Python/GPU/模型目录',
          '完成 ComfyUI 启动，并保存第一张测试图',
          '拆解一个基础文生图 workflow 的核心节点',
          '修改 prompt、采样器和步数，记录输出差异',
          '完成图生图或局部重绘的最小工作流',
          '安装 ComfyUI-Manager 并修复一个缺失节点',
          '复用一个社区 workflow，写下每个节点作用',
        ]
      : [
          `理解 ${chapter} 的核心概念`,
          `完成 ${chapter} 的一个最小练习`,
          `整理 ${chapter} 的 3 个关键点`,
          `做一次 ${chapter} 的低压复盘`,
        ]

    return {
      day,
      chapter,
      title: templates[index % templates.length],
      minutes: taskMinutes + (index % 3) * 5,
      method: profile.methods[index % profile.methods.length],
      output: day % chapterSize === 0 ? milestone : '留下一个可复现记录',
    }
  })

  return {
    goalTitle,
    days: totalDays,
    dailyMinutes: minutes,
    level,
    researchSummary: {
      topic: profile.label,
      sourceNames,
      method: profile.methods,
      note: `已根据 ${sourceNames || '可用资料'} 生成 ${totalDays} 天学习路线。`,
    },
    boss: {
      name: `${profile.label}${profile.boss}`,
      tag: `第 1 天 Boss`,
      hp: 68,
      task: dailyTasks[0].title,
      micro: profile.micro,
      time: `${dailyTasks[0].minutes} 分钟`,
      mood: 'calm',
      quote: '先跑通一个最小闭环，再慢慢加复杂度。',
    },
    mapNodes: profile.chapters.map((chapter, index) => ({
      title: `${index + 1}. ${chapter}`,
      detail: index === 0 ? `1/${chapterSize} 今日推进` : `预计 ${chapterSize} 个小任务`,
      active: index === 0,
      done: false,
    })),
    dailyTasks: dailyTasks.slice(0, 4).map((task) => ({
      title: task.title,
      day: task.day,
      minutes: task.minutes,
      method: task.method,
    })),
    fullPlan: dailyTasks,
    next: profile.next,
    sources,
  }
}

export default function researchPlanPlugin() {
  return {
    name: 'research-plan-api',
    configureServer(server) {
      server.middlewares.use('/api/research-plan', async (req, res) => {
        if (req.method !== 'POST') {
          json(res, 405, { error: 'Method not allowed' })
          return
        }

        try {
          const body = JSON.parse(await readBody(req))
          const topic = detectTopic(body.title || '')
          const sources = await researchSources(topic)
          const plan = buildDailyPlan({
            goalTitle: body.title || '30 天学会 ComfyUI',
            days: body.days,
            dailyMinutes: body.dailyMinutes,
            level: body.level,
            topic,
            sources,
          })
          json(res, 200, plan)
        } catch (error) {
          json(res, 500, { error: error.message })
        }
      })
    },
  }
}
