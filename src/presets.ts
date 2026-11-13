/**
 * The `team` Agent Preset, declared by this plugin.
 *
 * Splitting a task across a strong captain and cheap workers needs three
 * things in one composition: the captain brief, the delegation tools, and the
 * teammate composition that captain-created subagents join. Declaring the
 * preset here keeps all three next to the tools they name, so a plugin upgrade
 * cannot leave a preset pointing at tools that no longer exist.
 *
 * Registration is optional: a deployment without the preset registry keeps
 * every tool and loses only the picker entry.
 */
import type { Context } from '@deepseek-ai/cordis'

/**
 * One preset declaration.
 *
 * Declared locally rather than imported: the preset registry ships in the Host
 * but not as a build dependency of this package, and only these five fields
 * cross the boundary. `plugins` stays `unknown` because the registry validates
 * the row list itself, exactly as it does for YAML-declared presets.
 */
export interface PresetDefinition {
  readonly id: string
  readonly name?: string
  readonly description?: string
  readonly order?: number
  readonly plugins: unknown
}

/** The seat the preset registry adds to the Host Context. */
export interface PresetRegistrySeat {
  readonly agentPresets: {
    register: (definition: PresetDefinition) => Promise<() => Promise<void>>
  }
}

/** Preset id the captain Session records. */
export const TEAM_PRESET_ID = 'team'

/** Rank that keeps the team preset after the shipped ones. */
const TEAM_PRESET_ORDER = 40

/** Captain brief: the rules that make a strong model delegate the bulk. */
export const CAPTAIN_BRIEF = `# Role & Objective
你是当前项目团队的**首席架构师与技术队长（Tech Lead / Orchestrator）**。
你的团队由多个执行力强但推理成本极低的 Worker 节点组成。
你的核心目标是通过**极致的任务拆解与边界隔离**，以最低的 Token 成本、零文件冲突的方式高质量交付项目。

---

# Core Operating Principles (铁律)

## 1. 算力分配原则
- **严禁亲自编写常规业务代码：** 凡是 CRUD 接口、UI 组件、工具函数、样式调整、单元测试、文档注释等常规实现（约占项目绝大部分工作量），**必须**拆解为独立子任务下发给 Worker 执行。
- **你的专属领地（仅限最难的小部分）：**
  1. 全局架构设计、目录拓扑规划与核心接口契约（Interfaces / Types / Schema）定义。
  2. 跨模块的高复杂度核心算法、状态机流转、并发锁与安全鉴权逻辑。
  3. 当 Worker 在同一子任务上连续失败超过 2 次时的深度排障与接管。
  4. 最终的跨文件集成、依赖冲突解决与全量代码审查（Code Review）。

## 2. 严格文件隔离与独占锁（Zero-Conflict File Isolation）
由于多个 Worker 会并发读写同一个工作区，你在创建和派发子任务时，**必须遵守以下物理隔离规则**：
- **一文件一责任人：** 同一批次（Wave）处于并发执行状态的多个子任务，其目标修改/创建的文件路径集合**绝对不能有任何交集**。
- **契约先行，实现并行：** 若多个子任务需要依赖同一个公共类型文件、配置文件或路由入口，**由你先亲自创建并锁定该契约文件**，或者将其设为前置阻塞任务（DAG Dependency）；待契约落盘后，再并行下发各自独立文件的子任务。
- **禁止模糊派单：** 严禁发出“优化一下认证模块”或“重构前端页面”这类未指定具体文件路径的宽泛任务。

## 3. 轻量上下文保护（Token Economy）
- 你的推理算力极其昂贵，**禁止直接读取几千行的完整源码文件或冗长的报错堆栈**。
- 优先使用目录树扫描、符号搜索（grep / ripgrep）或读取类型定义文件来掌握全局结构。
- 若需了解 Worker 的执行结果，要求 Worker 在完成任务后提交简明扼要的**变更摘要与导出签名**，而非直接把全文代码贴回给你。

---

# Execution Workflow (标准工作流)

### Phase 1: 勘测与契约定义（由你亲自执行）
1. 快速扫描项目目录结构与关键配置文件（如 package.json、pyproject.toml、Cargo.toml 等）。
2. 确立模块边界，**亲自编写并落盘核心类型定义或接口桩（Stubs）**，作为所有 Worker 必须严格遵守的编译期契约。

### Phase 2: 拓扑拆解与批量派发
将剩余 90% 的开发任务拆解为原子级子任务，并在任务描述中强制包含以下**四要素模板**：
- **[独占文件范围]**：明确列出允许创建或修改的精确文件路径，声明“严禁修改此列表之外的任何文件”。
- **[输入与输出契约]**：明确指定需引入的类型文件路径、函数签名、参数结构及预期返回值。
- **[实现约束]**：代码风格、禁止引入的第三方库、边界异常捕获要求。
- **[自检标准]**：Worker 标记完成前必须执行的单文件语法/类型检查命令。

### Phase 3: 异常处理与熔断接管
- **第 1 次失败：** 仅阅读其精简的 Error Message，给出 1~2 句精准提示让其重试。
- **第 2 次失败：** 立即终止该 Worker 对此任务的尝试，由你亲自介入接管并直接修复该难点。

### Phase 4: 集成收口与最终验收（由你亲自执行）
- 所有并行子任务完成后，由你亲自处理**入口文件挂载**（如 main.ts、路由注册表等公共冲突高发区）。
- 运行全局构建、类型检查或集成测试；跨模块接口不匹配或合并冲突由你直接定位并统一修正，最后向用户汇报交付结果。

---

# 团队模式运行机制
- 你的模型由用户在会话框选定，全程不变；你只决定“谁来干”，不更换自己的模型。
- 任务板是唯一事实来源：用 \`agent_teams_create\` 建队并拆解任务（写清四要素，用 blocked_by 表达依赖），用 \`agent_teams_add_member\` 拉起队员并指定角色与模型，用 \`agent_teams_send_message\` 派活，用 \`agent_teams_status\` 查进度。
- 拉起队员时务必给 \`execution_prompt\`，写明其职责边界、独占文件范围与交付格式；队员会自动失去队长专属工具，不需要你额外约束。
- 同一批次并发的队员，其独占文件集合必须两两互斥。常规实现选择成本最低、速度最快的模型；只有原子任务确实需要更强推理时才选择更强路由。
- 队员完成后会回传精简报告。所有队员都在跑而你无事可做时，结束当前回合等待通知，不要轮询或 sleep。
- 与用户沟通使用中文，简洁直接。`

/** One composition row: a plugin name plus its optional configuration. */
interface CompositionRow {
  readonly id: string
  readonly name: string
  readonly config?: Record<string, unknown>
}

/** Filesystem rows every team member needs, with patch application off. */
function fileRows(): readonly CompositionRow[] {
  return [
    { id: 'tool-fs', name: '@deepseek-ai/dsh-tool-fs', config: { applyPatch: false } },
    { id: 'tool-fs-search', name: '@deepseek-ai/dsh-tool-fs-search', config: { sampleOverCapGlobResults: false } },
    { id: 'tool-jobs', name: '@deepseek-ai/dsh-tool-jobs' },
  ]
}

/** Shell rows; the Host disables whichever executor the platform lacks. */
function shellRows(): readonly CompositionRow[] {
  return [
    { id: 'tool-bash', name: '@deepseek-ai/dsh-tool-bash' },
    { id: 'tool-pwsh', name: '@deepseek-ai/dsh-tool-pwsh' },
  ]
}

/**
 * Compose the captain: brief, sandboxed tools, and delegation onto the member preset.
 * @returns composition rows in mounting order.
 */
export function captainComposition(): readonly CompositionRow[] {
  return [
    { id: 'persona', name: '@deepseek-ai/dsh-persona', config: { prefix: CAPTAIN_BRIEF } },
    { id: 'agent-instructions', name: '@deepseek-ai/dsh-agent-instructions', config: { maxBytes: 65536 } },
    { id: 'time-context', name: '@deepseek-ai/dsh-time-context' },
    ...shellRows(),
    ...fileRows(),
    {
      // No `agentPreset`: a captain-created teammate joins this same preset, so
      // it inherits the sandbox and executor rows while the team runtime denies
      // it every captain-only tool. Naming a second preset here would also put
      // that preset in the new-session picker.
      id: 'tool-subagent',
      name: '@deepseek-ai/dsh-tool-subagent',
      config: {
        provider: 'spawn',
        toolName: 'subagent',
        modelSelection: true,
        modelDiscovery: true,
      },
    },
    { id: 'tool-todo', name: '@deepseek-ai/dsh-tool-todo', config: { allowParallelInProgress: true } },
    { id: 'tool-ask-user', name: '@deepseek-ai/dsh-tool-ask-user' },
    { id: 'tool-present', name: '@deepseek-ai/dsh-tool-present' },
  ]
}


/**
 * The one preset this plugin declares.
 *
 * A single entry is deliberate: the registry lists every registered preset in
 * the new-session picker, and only activation failures are filtered out, so a
 * second "member" preset would appear as a choice users must not pick. Members
 * inherit this preset instead and are distinguished by their execution prompt
 * plus the captain-only tool denial the team runtime already enforces.
 * @returns the captain preset declaration.
 */
export function teamPresetDefinitions(): readonly PresetDefinition[] {
  return [
    {
      id: TEAM_PRESET_ID,
      name: '团队模式',
      description: '会话所选模型担任队长负责决策与集成，低成本子智能体担任队员并发干活。',
      order: TEAM_PRESET_ORDER,
      plugins: captainComposition(),
    },
  ]
}
