# 新西兰 Year 0–13 数学知识点拓扑图谱补充包：研究报告

研究基准日：**2026-10-18**。适用主范围：新西兰英语授课体系的学校 Mathematics and Statistics。项目基线：`maxazure/nz-learning-graph`，commit `8daa98f84e3cc18de29e6033083a561a512987f3`。

## 1. 交付结论与“覆盖全部”的证明边界

本包已经形成可合并的数据，而非课程目录：新增候选知识点、既有知识点教学补充、逐条带理由的依赖、独立课程及标准映射、来源定位、需求覆盖审计与可执行验证脚本均已生成。英文教学内容可供 AI 提问、判断理解证据、分层提示和安排短练习；中文报告解释课程状态和合并决策。

**已覆盖当前 Year 0–13 的主要课程框架，并逐项核对当前学校数学与统计目录中的全部 33 项 achievement standards。没有宣称已严格证明每一条官方 bullet、每种表示方式、每个数值范围及所有评估题型全部完成。** 可证明的范围分别记录为目录出现、课程目标、标准组件和具体诊断技能；三处显式 partial 与研究范围之外的缺口在第 10 节列出。525 个 covered 行不能除以 534 后当作整个国家课程的完成率。

| 交付量 | 实际数量及口径 |
| --- | --- |
| topics.json | 264 个新 ID 候选：263 个建议新增，1 个身份待审 |
| 复用现有知识点 | 225 个真实上游 ID：152 个完整教学补充，73 个仅增加映射 |
| 可直接使用的完整教学档案 | 416 个，含 454 道原创诊断及参考答案、解释和分层提示 |
| 有课程映射的不同知识点 | 489 |
| 依赖边 | 812 条：698 hard、114 helpful |
| 课程与评估映射 | 1287 |
| 来源记录 | 89 个 source_id，81 个不同精确 URL；同一文件的独立阅读定位保留不同 ID |
| 评估实体 | 33 项 achievement standards，另有 2 项明确限定用途的 unit standards |
| 来源驱动的覆盖矩阵 | 534 行：525 covered、3 partial、6 not_applicable；不同审计层不可相加计算完成百分比 |
| 已执行计算检查 | 300 项，涉及 232 个不同知识点 |
| 合并后图检查 | 1870 个全学科节点、4004 个不同端点对；hard DAG 通过 |

数量依据为同包 `validation-results.json`、`merge-plan.json` 和 `coverage-matrix.csv`，由程序重新计算。新增候选中的 `nzm_graphical_equation_solutions` 仍需与既有 `mt_Yw27nweoTj` 作身份裁决；其教学内容完整，但不建议跳过这项合并决定。另有既有图谱重叠问题，合计 10 组、24 个不同 ID（1 个新候选、23 个既有 ID），这些集合与“复用”不是互斥计数。

## 2. 课程、标准与政策的当前状态

### 2.1 适用版本

| 实体 | 截至研究日的状态 | 适用范围与日期 | 本包处理 |
| --- | --- | --- | --- |
| Mathematics and Statistics 2025 curriculum statement | 当前实施 | Years 0–10，2026-01-01 生效，六条 strand，Phases 1–4 | 599 条当前映射，记录真实教学年/在校时长列 |
| NZC 2007 Mathematics and Statistics Levels 6–8 | 高中部分仍适用 | 当前 senior curriculum；不能把同页较低 levels 也标成当前 | 306 条独立 senior curriculum 映射 |
| 旧 NZC 2007 通过 Level 5 / Year 10 的部分 | 已替代 | 从 2026-01-01 起由新 Years 0–10 statement 替代 | 仅在框架历史记录保留，未新建 current 映射 |
| 当前 NCEA Mathematics and Statistics 标准 | 当前目录仍列出 | Level 1 四项、Level 2 十四项、Level 3 十五项 | 标准实体与知识点分开；采用当前版本与 2026 specifications |
| Phase 5 Years 11–13 规划资料 | 已发布、拟议、尚未生效 | 网页说明 Gazette establishment 待完成；拟 Year 11 自 2028-01-01、Year 12 自 2029-01-01、Year 13 自 2030-01-01 | 只记录状态与时间，不将未完整读取的未来全文变成当前微技能映射 |
| 新高中资格体系 | 已宣布的未来政策 | Foundational Award 2028、NZCE 2029、NZACE 2030 | 与现行 NCEA 分开；不编造新资格注册 ID 或单项标准终止日 |

当前低年级 statement 明示 2026-01-01 生效，并保留 senior companion curriculum。Phase 5 网页的措辞是已发布供规划、进展/评估资料仍在开发、拟议课程等待 Gazette；不应将其写成已经全面实施，也不应把它误称为正在开放咨询。2026-09-10 的官方 rollout 页面与 2026-05-16 政策公告提供未来资格和分年实施背景。依据：[r_nzc_current](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---mathematics-and-statistics-phases-1-4-years-0-10/5637289330.p)；[r_nzc_senior](https://newzealandcurriculum.tahurangi.education.govt.nz/5637209905.p)；[r_phase5_proposed](https://newzealandcurriculum.tahurangi.education.govt.nz/new-zealand-curriculum-online/nzc---mathematics-and-statistics-phase-5/5637326079.p)；[r_rollout](https://tahurangi.education.govt.nz/our-story)；[r_qualification_decision](https://www.beehive.govt.nz/release/details-ncea-replacement-confirmed)。

`curriculum-frameworks.json` 保存 10 个课程/评估/政策实体。当前微技能映射集中在五个已经核实的框架；没有把新资格时间表用作旧标准的 `effective_to`。旧政策报道中的 rephasing 日期不能覆盖研究日已发布的更新政策。

### 2.2 学校年级、课程阶段、资格等级不相等

| 维度 | 数据字段 | 可靠解释 |
| --- | --- | --- |
| 在校时长/学校年级 | `year_or_phase` 或教学档案的 `year_placement` | Phase 1 使用 first six months、first/second/third year of schooling。整数 `[0,1]` 等只是检索范围，不能把 Year 0 等同于最初六个月 |
| NZC 内容等级 | `curriculum_level` | 当前 senior 使用 6、7、8；这是课程内容等级 |
| NCEA 资格等级 | `qualification_level` | Level 1/2/3 通常在 Year 11/12/13 学习，但不是一一对应 |
| 评估实体 | `standard_id`、`standard_version` | 一项标准包含多个方法及情境，不能当作一个知识点 |

官方 NCEA 说明用的是“usually”。本包因此让 NCEA 映射的唯一学校年级为 null，并给出原因；Year 11/12/13 仅作为覆盖矩阵和教学选择的通常路径。一个可直接检验的反例是 **US32406 v4 属于资格 Level 1，但其课程基准关联 Phase 3 Year 8 / Phase 4 Year 9**。这不能被导入为“所有内容只在 Year 11 出现”。依据：[r_ncea_levels](https://ncea.education.govt.nz/about-ncea)；[r_us32406](https://www.nzqa.govt.nz/nqfdocs/units/pdf/32406.pdf)，US32406 Guidance 3、Outcomes 1–3。

| 独立映射框架 | 映射数 | 解释 |
| --- | --- | --- |
| NZC_2025_Y0_10 | 599 | 当前 Phases 1–4，使用实际教学阶段/年列 |
| NZC_2007_L6_8 | 306 | 保留适用的 senior NZC；curriculum_level 为 6、7 或 8 |
| NCEA_current | 372 | 当前标准；qualification_level 为 1、2 或 3，唯一 school year 不适用 |
| NCEA_numeracy_corequisite | 8 | US32406 的部分组成技能 |
| NZQA_vocational_unit_standard | 2 | US5236 的工作场所直角三角形方法 |

### 2.3 标准版本及日期

Level 1 当前使用 AS91944 v4、AS91945 v3、AS91946 v3、AS91947 v2。Level 2 的 AS91256–91269 当前英文文件为 v3；Level 3 的 AS91573–91587 为 v2。目录仍链接的 `2019` 文件夹不是“2019 年已退出”的意思；标准的 copyright、publication、planned review、last assessment 是不同日期。标准记录未确认准确 operative day 时使用 null，并逐字段解释。依据：[r_l1_index](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=01&query=mathematics&view=all)；[s_as91944](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91944.pdf)；[r_as91945](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91945.pdf)；[r_as91946](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91946.pdf)；[r_as91947](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91947.pdf)；[m_index_l2](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=02&query=mathematics&view=all)；[m_index_l3](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=03&query=mathematics&view=all)。

本包另核实 US32406 v4 与 US5236 v9 的 2026-01-29 修订记录。后者是工作场所 Pythagoras/trigonometry 的独立职业情境，要求真实工作证据；本包假设性短题不冒充该证据。其旧 planned review 日期不是当前版本的退出日。依据：[r_us32406](https://www.nzqa.govt.nz/nqfdocs/units/pdf/32406.pdf)；[r_us5236](https://www.nzqa.govt.nz/nqfdocs/units/pdf/5236.pdf)。

## 3. 仓库实际检查与复用决策

### 3.1 已读文件及可复现基线

通过 GitHub 接口完整取得并阅读了要求的六个文件：`lib/graph.ts`、`data/topics.json`、`data/dependencies.json`、`data/nz-overlay.json`、`PROVENANCE.md`、`docs/nz-curriculum.md`。每份本地文本均与返回的 Git blob SHA-1 一致，并在固定 commit 再次核实六个 blob；另提供 SHA-256。并未把网页搜索摘要当作完整仓库读取。

实际原始图有 1,590 个全学科节点、3,221 条边；NZ overlay 另有 16 个全学科活动节点，`graph.ts` 由 `prerequisiteIds` 生成 32 条 hard 边。合并基线是 1,606 节点、3,253 边。去重研究使用其中 **512 个数学记录的完整描述索引**，并查阅相关 evidence 和依赖。依据：[r_repo](https://github.com/maxazure/nz-learning-graph/tree/8daa98f84e3cc18de29e6033083a561a512987f3)；精确文件 URL、字节数及哈希见 `repository-snapshot.json`。

### 3.2 影响导入的实际实现

1. `graph.ts` 把原始 topics 与 overlay 拼接，并把每个 overlay prerequisite 都转成 hard；它无法直接保留本包的 helpful、basis、confidence 和定位证据。因此不能把新数据简单塞进旧 `prerequisiteIds`。
2. 旧 Topic 使用 `ageRangeStart/End`、`evidence`、`assessmentPrompt`、`standards[]` 等字段。本包提供独立教学档案和课程映射，不用“年级+5”生成年龄，也不覆盖上游其他国家标准。
3. 当前 `searchTopics` 检索 name、description、domain、nz.localContext；要支持新图谱，需要加入 subdomain、独立映射、标准 ID、阶段和状态的查询。
4. 当前 `learningPath` 沿 hard 追溯，visited 能避免无限访问，却不能证明数据没有环。导入前与合并后都必须做显式 DAG 检查。
5. 当前 `prerequisites` 返回 topic、strength、reason；新服务应同时返回 basis、confidence、source_ids、source_locators，使 AI 能区分官方内容对应与教学先修判断。

这些是固定 commit 的实际实现分析，不是已完成的线上改造。公开站点读取未成功，未实际运行生产 MCP 或浏览器交互；本研究只对已取得的仓库结构和独立数据包作验证。

### 3.3 已解决与待审的同义问题

新增的坐标距离草稿已合并回真实 ID `mt_1VmTUxBrNd`；其名称虽然写着 Types of angles，完整 description/evidence 实际覆盖 Pythagoras 和坐标距离。平方/立方单位换算草稿复用 `mt_tpT9brpI6D`。另将固定比例复合增长公式草稿并入 `nzm_exponential_growth_decay`，保留计算表格式的 `nzm_recursive_compound_growth` 为独立表示技能。被合并的草稿 ID 只保留在别名/审查记录中，不留悬空边或自依赖。

已有 `mt_tAJH5BrpOx` 的名字是 Angles in triangles，但正文是面积公式与棱柱/圆柱体积；本包补充符合正文的名称和教学档案。`mt_VVn1IXjkzn` 的舍入区间明确说明正数 round-half-up 的端点约定；`mt_5mIcmKRCgA` 的反比例强调恒定乘积，避免把所有下降关系都当作反比例。这些都是可审查的 `topic-enrichments.json` 记录，不是已经覆盖上游文件。

去重使用完整描述和数学对象/方法/表示差异，并辅助使用名称相似度筛查；九个筛查对已逐一辨别，另修正了 normal percentile cutoff 与 unknown parameter recovery 的范围重叠。最终保留十组身份/既有重叠审查，包括坐标、网格变换、概率刻度与补事件、分数等值、角和、比以及散点构造/预测。`merge-plan.json` 给出全部真实 ID、理由和建议。相似字符串只能发现候选，不能证明语义等价。

## 4. 知识组织与拓扑方法

### 4.1 四层分离

教学节点只使用 `concept`、`skill`、`practice`：概念描述数学对象及条件；技能描述可执行方法；实践连接情境选择、建模、调查、论证与检查。标准另存 `standards.json`，课程框架另存 `curriculum-frameworks.json`，多对多对应在 `curriculum-mappings.json`。

416 个完整档案中有 85 个 concept、300 个 skill、31 个 practice。每个档案均有英文 description、learning_objectives、understanding_evidence、common_misconceptions、diagnostic_questions（答案/解释/至少两级提示）、short_activity、year_placement、standard_ids、定位来源和 merge 建议。活动按内容保留计算器、公式、推理及情境；高中没有被统一改写为幼龄游戏。

| 领域 | 新增候选档案 | 现有 ID 的完整教学补充 |
| --- | --- | --- |
| Number | 11 | 73 |
| Algebra | 45 | 19 |
| Functions | 16 | 0 |
| Measurement | 8 | 24 |
| Geometry | 26 | 17 |
| Trigonometry | 14 | 1 |
| Calculus | 35 | 0 |
| Probability | 33 | 8 |
| Statistics | 66 | 8 |
| Mathematical practices | 10 | 2 |

`topic_id` 指向知识身份，不承诺其所有子技能在每条年级映射中都适用。同一节点若跨阶段复用，必须读取映射 notes 和诊断 applicability。例如 Year 10 对某统计节点的图表子范围，不等于同时要求该节点更高阶段的密度公式或完整参数推断。Phase 1 的整数检索年范围已标作 editorial_range。

### 4.2 边的方向和证据

统一约定 `prerequisite_id → topic_id`。hard 表示本节点目标或诊断方法采用的必要基础；helpful 表示可支持理解或某条解题路线的基础。每条边均有具体数学理由。812 条新/补充边全部标为 **pedagogical_inference**（787 high、25 medium）：官方资料支持知识内容与课程位置，但没有提供项目中这 812 个微技能端点的逐条强制先修表。本包没有为了增加“官方边”数量而把内容相邻关系包装成 source_explicit。

例如，乘法可支持有序选择的计数乘法原理；函数复合为链式法则识别内外函数提供必要基础；对数为由 Poisson 零事件概率恢复 rate 提供必要反运算。它们的必要性来自数学结构，而不是相邻学校年级。

以下两条链的相邻端点都是交付图中实际 hard 边；它们只是完整祖先集合中的路径示例，不应解释为每个目标只有这一条前置链：

| 实际路径 | 可诊断的连接 |
| --- | --- |
| `mt_PZ909yPrEC` → `mt_KwdjWEmMNo` → `nzm_integer_exponent_laws` → `nzm_polynomial_derivatives` → `nzm_chain_rule` | 乘法/代数记号、整数幂、多项式导数到复合求导；另有函数复合 hard 前置 |
| `mt_PZ909yPrEC` → `mt_XWSGuFW7It` → `nzm_poisson_model_rate` → `nzm_poisson_probabilities_moments` → `nzm_poisson_inverse_rate` | 乘法与比、暴露量和 rate、模型概率到逆向参数求解；另有对数 hard 前置 |

为避免人为切断统计路径，积分到连续密度面积仅是 helpful：矩形/三角形面积足以解释相应基础分布。短路、生成树、遍历和关键路径分别按不同目标拆分，不将“网络”当作一个总节点。三条与实际上游方向相反的建议已降为 helpful，原方向保留并进入独立 direction review。相关/同义关系保存在合并审查元数据，未用双向 hard 边表示。

完整合并图的 hard 部分无环。265 个具有 senior 映射的完整教学档案全部有通往明确当前 Years 0–10 节点的 hard 路径，或自身有这样的基础映射。此检查可以发现孤立的高中分包，但**不能自动证明每个主题所有必要基础都已穷尽**；具体理由仍需随内容审阅。

## 5. Years 0–10：基础链与精确阶段处理

| 当前阶段 | 映射数 | 不同 topic ID | 来源分组行 | partial 行 |
| --- | --- | --- | --- | --- |
| Years 0–3 / Phase 1 | 155 | 96 | 47 | 0 |
| Years 4–6 / Phase 2 | 174 | 105 | 39 | 1 |
| Years 7–8 / Phase 3 | 136 | 89 | 24 | 0 |
| Years 9–10 / Phase 4 | 134 | 97 | 20 | 0 |

阶段之间可复用相同 ID，表内不同 ID 数不能相加当作总主题数。四阶段教学表实际阅读范围覆盖全部出现的 strand/element/年列；130 行、273 组件是按数学内容整理的审计分组，不是对每个官方 bullet 的逐字编号替代。依据：[f_phase1](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289331.p)；[f_phase2](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289332.p)；[f_phase3](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289333.p)；[f_phase4](https://newzealandcurriculum.tahurangi.education.govt.nz/5637291579.p)。

早期基础包含一一计数、顺序/序数、subitising、位值、相等、加减互逆、等组乘除、分数单位、模式和表示、测量比较与单位、方向/位置/对称以及分类计数。Phase 1 的首六个月 Statistics 空列、四个时间列中的 Probability 空白，以及 Year 4 Probability 空白独立记为 not_applicable；这不表示儿童不能提早探索机会语言。

Years 4–6 深化位值和运算、分数/小数、比例/百分数起点、句式与未知数、长度/时间/质量/容量和角、面积体积基础、坐标与几何图形，以及统计图表和已有概率要求。已补五位数除法、千分位小数加减、偶数样本中位数、多众数和日期时长等原档案数值范围。Year 6 历法比较的缺口单独保留。

Years 7–8 连接整数与有理数、分数百分数互换、线性关系、平面与立体几何、角、统计解释和实验概率。新建 `nzm_integer_addition_subtraction` 的原因是原有宽节点 `mt_gNUE4B3vuk` 把整数、分数、小数四则合在一起，先修包含分数除法；将其全部要求强加到 Year 7–8 整数加减会造成错误学习顺序。现在较窄整数节点先行，完整有理数节点的映射限于较后范围。

Years 9–10 补齐高中入口：负指数和科学记数法、根式、分数/百分数逆算、汇率和迭代复利、线性方程与不等式、展开/因式分解、二次零乘积与图像、两点定直线、Pythagoras 及坐标距离、圆边界、相似及平方/立方比例、棱柱/棱锥/圆柱表面积与体积、坐标放缩、IQR/图表评价、抽样与调查、初步比较和联合事件。圆柱展开图有单独节点，堆积条形图有单独读取诊断。

对 source-table 年列进行了收紧：没有把后续余数解释、公制换算、均值/极差、圆柱展开、外币换算或 75%-to-50% 比较规则随意提前到上一年。te reo Māori 数词采用官方语言资源核对书面构词；语言资源的旧课程背景不作为当前数学年级证据，也没有声称检查了语音。依据：[f_te_reo_counting](https://tahurangi.education.govt.nz/ka-mau-te-wehi-unit-4---waea-mai---ring-me/5637169343.p?domain=newzealandcurriculum.tahurangi.education.govt.nz)，New words、Activity 2；数学年级仍由 Phase 1 决定。

## 6. Year 11–13 的实质完成范围

### 6.1 评估目录与主题数

| 通常学习阶段（非固定对应） | NCEA level | 当前标准数 | 评估映射数 | 不同 topic ID |
| --- | --- | --- | --- | --- |
| 通常 Year 11 | 1 | 4 | 82 | 55 |
| 通常 Year 12 | 2 | 14 | 101 | 94 |
| 通常 Year 13 | 3 | 15 | 189 | 166 |

不同 NCEA level 可复用同一知识点，这些数不能相加当作唯一主题总数。另有 64、85、157 条分别对应 NZC Levels 6、7、8 的独立课程映射，其中部分不挂任何 achievement standard。完整档案的通常年级检索范围分别为 Year 11：59 个、Year 12：121 个、Year 13：183 个；同一档案可出现于多个范围。这些数与上表的“标准映射主题数”回答不同问题。

### 6.2 Year 11：当前 Level 1 边界与完整基础入口

数学覆盖比例/复合率、舍入与界限、指数、展开因式分解、可因式分解二次方程、线性系统、图像和模式、二维到三维三角形、固体测量、相似、圆几何、loci、变换与情境建模。统计按 AS91944 的四种 enquiry 拆分：数值组间比较、两数值变量关系、时间序列和多阶段概率实验，连接变量/来源/图表/概要/情境结论。AS91945 的数学探索包含方法选择及解释，AS91946 的信息处理另有独立映射，AS91947 的推理不等于单纯计算题。

当前 SLO Version 4 是本阶段的关键边界来源：AS91945 不把配方和二次公式列入相关范围；AS91947 采用整数指数而非任意分数指数，涉及两条线性方程而非线性/非线性混合系统；**2026 AS91947 没有 Probability 考试范围**。概率实验由 AS91944 等位置支持，没有误挂 AS91947。课程 Level 6 的较广内容与 assessment 边界分开保存。依据：[r_l1_slo_v4](https://ncea-live-3-storagestack-53q-assetstorages3bucket-2o21xte0r81u.s3.amazonaws.com/s3fs-public/2026-01/MS%20NCEA%20Level%201%20Subject%20Learning%20Outcomes.pdf?VersionId=w7R4QClh24XNIfDtPq46oauOYzTBAv7E)；[r_l1_spec2026](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91947-spc-2026.pdf)，SLO pp. 2–10、11–16、19–21。

Level 1 数据调查不强制正式 least-squares regression 或 R²；时间序列不要求计算季节效应。非正式总体比较的视觉规则保留其样本条件，不能套成普遍显著性检验。高阶方法仍可作为未来学习路径存在，但不因此成为本年级的考试硬要求。AS91946 的完整媒体资源和 A/M/E 边界校准仍是部分完成。

### 6.3 Year 12：数学分支、研究设计与概率模型

数学方面，八个标准组具体覆盖 coordinate geometry、graphical methods、sequences and series、trigonometric relationships、networks、algebra、calculus 和 systems of equations。细化包括直线条件、函数家族/定义域/变换、数列阈值和参数恢复、弧度及扇形、SSA 歧义、生成树与路径、配方/判别式/对数/有理式、导数图像/切线/驻点/反导数，以及线性/非线性联立和可行区域。附录 A 给出全部八项编号及组件定位。

统计的六项标准为 AS91263–91268：问卷将需求、操作定义、题目/选项、pilot 与修订证据分开；推断区分总体/样本、抽样框、随机选择、偏差和抽样变异；实验区分单位、处理、响应、重复/控制和可支持的结论；报告评价分离 coverage/non-response/measurement error；概率包括条件化表格、相对风险、变化树、连续面积、正态正反求；模拟区分随机机制、一次 trial、停止规则、重复与估计误差。依据：[s_as91263](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91263.pdf)；[s_as91264](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91264.pdf)；[s_as91265](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91265.pdf)；[s_as91266](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91266.pdf)；[s_as91267](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91267.pdf)；[s_as91268](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91268.pdf)；[s_spec_l2_2026](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91267-spc-2026.pdf)。

非正式中位数区间采用相关 NZ 教学规则 `median ± 1.5 IQR / √n` 时，明确它不是有普遍 95% coverage 的正式区间。大样本不能自动消除系统偏差，随机抽样与随机分配也不是同一个操作。依据：[s_s7_inference](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Achievement-objectives/AOs-by-level/AO-S7-2)，AO S7-2。

### 6.4 Year 13 Mathematics / Calculus：具体方法与深度

八项数学标准 AS91573–91579、AS91587 均有方法组件审计：圆锥曲线、线性规划、三角方法、关键路径、复数、微分、积分和三元联立系统。图谱包含圆/抛物线/椭圆/双曲线的方程与几何条件；约束/目标/可行区域/整数可行解；单位圆、恒等式证明、区间解与通解；关键路径正推/反推与 float；复数极形式、De Moivre、所有 n 次根、共轭及轨迹；链式/乘积/商法则、参数二阶导数、极限/连续/可微、凹凸/拐点、related rates 和优化；定积分、有符号累积、曲线间面积、总路程、数值法、初值与可分离微分方程、增长衰减和冷却。附录 A 给出标准逐项表。

课程层另外保留函数复合、反函数与倒数函数的区别、对数模型、排列组合、数值微分和 CLT 等不应被标准标题清单遮蔽的内容。方法选择与必考项目分开：数值积分中的 Simpson 方法和有理积分的部分分式是一条可能路线，不将标准未逐条列出的所有方法宣布为各校独立必考节点。没有凭印象把分部积分、旋转体、矩阵、向量或隐式微分加入当前强制映射。依据：[m_nzc_senior](https://newzealandcurriculum.tahurangi.education.govt.nz/5637209905.p)；[m_as91578](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91578.pdf)；[m_as91579](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91579.pdf)；[m_l3_report_2025](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2025/91578-report-2025.pdf)。

### 6.5 Year 13 Statistics / Probability：模型、推断与解释

| 组别 | 实际细化 | 边界 |
| --- | --- | --- |
| AS91580 时间序列 | 趋势/季节/残差、奇数平滑、偶数周期居中 moving average、季节效应估计及零和居中、加法调整、预测与可比性 | 小活动验证方法，不替代完整数据调查；不任意扩成 ARIMA 或乘法时间序列 |
| AS91581 双变量 | explanatory/response、线性回归系数与单位、残差、非线性拟合、插值/外推、相关与混杂、对数回转 | response 连续；x 可为离散或连续数值；R² 不是该标准必需 |
| AS91582 formal inference | 有放回且保留样本量的 resample、组内抽样、差值方向、percentile bootstrap interval、含零结论、样本 n 与重复 B | 不把打乱组标签混成 bootstrap；不保证任意小样本均有名义 95% 覆盖率 |
| AS91583 experimental design | 单位/处理/响应、随机分配、控制/重复、可选 blocking/paired、sharp null 下 randomisation、尾部证据、因果和外推 | p-value 不是零假设为真的概率；配对/分块具体路线标明教学扩展 |
| AS91584 统计报告 | 抽样/非抽样误差，单比例、同 poll 两比例差、独立 polls 差的 margin 近似与限制 | 当前为 external 标准；margin 不包含系统偏差 |
| AS91585 概率概念 | 交并补、互斥/独立、条件/反向条件、全概率、模型与经验概率、树/表/自然频数 | 空交集定义互斥；避免赌徒谬误和反向条件混淆 |
| AS91586 分布 | 随机变量表、期望净收益、方差/SD、线性变换、binomial、Poisson rate 缩放与反求、normal 反百分位及参数恢复、uniform、triangular、模型选择 | 逐个保留分布参数/假设；uniform/triangular 明确见 2026 specification |

依据为各标准 EN、2026 specifications 与已读教学/评估资料：[s_as91580](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91580.pdf)；[s_as91581](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91581.pdf)；[s_as91582](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91582.pdf)；[s_as91583](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91583.pdf)；[s_as91584](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91584.pdf)；[s_as91585](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91585.pdf)；[s_as91586](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91586.pdf)；[s_spec_l3_2026](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91586-spc-2026.pdf)；[s_examreport_2025](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2025/91586-report-2025.pdf)。

当前 NZC Level 8 的统计目标还包含 CLT、均值/比例/差值置信区间。于是本包在课程层提供 sampling distribution、standard error、均值 z 区间和大样本比例区间，不把它们全部误映射成 AS91582 的 bootstrap 必做公式。CLT 保留独立同分布、有限非零方差等条件；原始数据不会因 n 达到某个阈值就变成正态。正态 cutoff 节点专门处理已知参数求阈值，恢复未知模型参数使用独立节点，避免同义扩张。依据：[s_nzc_senior](https://newzealandcurriculum.tahurangi.education.govt.nz/the-new-zealand-curriculum---mathematics-and-statistics/5637209905.p)；[s_clt](https://newzealandcurriculum.tahurangi.education.govt.nz/central-limit-theorem/5637219747.p)；[s_bootstrap_glossary](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Glossary/Glossary-page-B)；[s_bootstrap_transcript](https://flexiblelearning.auckland.ac.nz/data-to-insight/8/1/files/illustrated-6.2_bootstrap-re-sampling.pdf)。

## 7. 学校课程路径及升学衔接

Te Kura 的当前课程目录分别提供 Level 3 Calculus、Statistics 与 Mathematics 课程，这说明实际路径可分支，也可组合。其各课程进入条件属于该提供者，不是国家课程普遍 hard prerequisites。本包将“常见路径”放在解释层，未将某学校选课门槛写成数学依赖边。依据：[r_tekura_paths](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics)；[r_tekura_mx3000](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics/mx3000)；[r_tekura_ms3000](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics/ms3000)；[r_tekura_mz3000](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics/mz3000)。

大学衔接另核实 Auckland MATHS 108 的已发布 **2027 Summer** 页面：其中一个 NCEA 路径要求 Level 3 Mathematics 13 credits 且包括 AS91578，也列有大学课程替代路径。这是特定大学、特定未来课程实例，不是所有 Year 13 学生的共同要求，不作为当前 NCEA 标准日期。依据：[r_auckland_2027](https://study.auckland.ac.nz/ords/r/uoa/catalogue/course?p0_catalogue_term=Summer&p0_catalogue_year=2027&p6_code=MATHS+108)，Prerequisite。

US32406 co-requisite 与 US5236 workplace 标准另列，不将所有学校标准的集合解释为每个学生必修课表。Cambridge 和 IB 未进入主图映射；本包未完成独立的比较研究，不能由这些大学页面的替代入口反推两者的学校课程等价关系。

## 8. 如何证明覆盖、怎样读 coverage-matrix.csv

| audit_kind | 行数 | 能证明什么 | 不能证明什么 |
| --- | ---: | --- | --- |
| teaching_sequence_component | 130 | 按现行阶段教学表整理的 273 个内容组成部分及其主题连接 | 每条原始 bullet、数字界限、材料与活动模态均一一完成 |
| curriculum_objective | 49 | 当前 senior Levels 6–8 的目标内容组有独立对应 | 与唯一学校年级或标准一一对应 |
| assessment_component | 83 | 16 项高级数学标准的 EN 内容组件已逐项对照 | 全部评估情境、题型和 A/M/E 边界已校准 |
| curriculum_objective_component | 27 | 高中数学分组对相应 NZC 目标另作组件细分 | 与上一层无重叠，或可相加成分母 |
| diagnostic_skill_family | 212 | 数学/统计分包列出的精细方法或实践有主题和诊断 | 一项技能独立完成便获得整项标准 |
| standard_catalogue_presence | 33 | 当前目录中每项 school achievement standard 都出现 | 学生取得标准、课程完整认证或选课必修性 |

`covered` 表示该审计行列出的内容组有表示；`partial` 表示确切范围、教学内容或证据尚有限；`gap` 用于完全缺失的组成部分；`not_applicable` 用于源表该列没有独立内容。一个 partial 父行内部可以有 gap 组件。CSV 每行包含 topic_count、实际 topic_ids、source_ids、定位及 remaining_gaps。对应完整层级在 `curriculum-requirements.json`，含同阶段映射与仅提供支持的 topic 区分。

当前总量为 525 covered、3 partial、6 not_applicable。**所有 current 标准均出现和整套课程已完全覆盖不是同一句话。** 覆盖审计是开发者继续核对原表、补题和细分的入口，而不是隐藏剩余工作的完成率。

## 9. 验证与数学审查

交付前实际执行 `python3 nz-maths-supplement/validate.py --repo repo-reference`，结果为 passed，0 errors、0 warnings。脚本使用 Python 标准库，无需联网或第三方依赖；实现本包 `schema.json` 使用的全部关键字，并检查跨文件不变量。详细时间、Python 版本、拓扑序哈希与每个计算的实际/预期值在 `validation-results.json`。

已执行检查包括完整 JSON（重复 key 和非有限数也拒绝）、必需字段和枚举、ID 唯一、新旧身份分离、所有 topic/source/standard/framework/mapping 引用、映射缓存一致、null 原因、无自依赖/重复端点对、语义重复映射、当前/未来日期、标准标题/版本/等级一致、33 项目录及 external 子集、禁止 Probability 映射 AS91947、基线/补充/合并三次 hard DAG、Year 11–13 单独覆盖行、CSV 数量和引用，以及 265 个 senior 档案到当前低年级基础的可达性。optional repo 检查六文件哈希全部一致。

300 项确定性计算全部通过，涉及 232 个不同知识点；包括数与运算、几何测量、利率/比例、三角、微积分、概率统计和复数残差。数值核验只检查显式表达式，不是对所有 454 道题的定性推理、所有符号恒等式或完整评分效度的机器证明。

高中数学和高中统计进行了交叉独立阅读审查：复核微积分、复数、SSA、线性规划、网络、置信区间、bootstrap、randomisation、分布和组合计数。修正了拐点处连续性、FTC 有效区间、复数 locus 退化条件、内点/端点连续性、零系数、参数二阶导数、critical-path backward pass，以及整数规划不能仅四舍五入实数最优点等问题；统计保留 sharp null、空交集互斥、percentile interval 和分布参数条件。该过程是研究团队的独立复核，未伪称外部教师 moderation。

## 10. 尚未完成的具体工作与来源限制

| 优先级 | 具体事项 | 本次处理与下一步 |
| --- | --- | --- |
| 内容补全 | Year 6 的 solar/lunar calendars、maramataka Māori、Chinese calendar 比较 | `f_req_0077` 保留 partial，内部历法组件 gap；已提供公历算术，需另查这些历法的可靠教学资料并制作比较活动 |
| 评估校准 | AS91946 完整非专业媒体材料及跨数/代数/测量/几何/统计应用，A/M/E 证据边界 | `req_component_0269` 保留 partial；已有子方法和原创短题，未完成全套 authentic integrated task 与 exemplar 对照 |
| 映射精度 | NZC Level 6 circle properties 的具体定理清单 | `r_req_l6_circle_geometry` 保留 partial/medium；课程目标不枚举唯一必教定理列表，所选圆周角/弦/切线细分是教学对应 |
| 身份合并 | 一般图像求解与旧 quadratic/linear graph skill；其他既有重叠 | `merge-plan.json` 10 组、24 ID；新增候选只 1 个需要身份决定，其余为旧图谱整理 |
| 来源访问 | 部分 NZQA clarification/exemplar 页面返回 403 | 已用当前标准 PDF、规格、已读评估报告/部分评分材料和教学指南；没有把受阻页说成已读，没有穷尽所有历年试卷 |
| 未来课程 | Phase 5 全文微技能和新资格标准 | HTML 状态已读，嵌入全文 PDF 未完整取得；没有 future 内容逐点覆盖或新资格标准编号 |
| 高阶独立路径 | NZ Scholarship 的完整 Mathematics/Calculus/Statistics 要求与任务 | 未完成专门标准/规格研究；不把当前 33 AS 目录覆盖当作 Scholarship 覆盖 |
| 其他资格 | Cambridge、IB、全部职业 unit standards 与其他特殊课程 | 主图只含国家课程、当前 school AS 和两项已核实 US 的限定映射；未做这些路径的独立完整包 |
| 教学广度 | 每个官方 bullet、数字范围、图示/操作/语言模态与每个复合情境 | 当前以可诊断内容分组覆盖，未建立原表逐 bullet 的严格机器同构；需教师逐条复核及更多原创题 |
| 实际教学 | 发音、真实课堂可用性、年级特定难度、大型 bootstrap/调查数据及软件操作 | 本包提供短活动与 progressive hints；未完成儿童实测、音频评估或整套软件工作流 |
| 工程运行 | 生产站点与 MCP 查询、目标仓库新 commit 后的兼容性 | 未改线上；固定基线的结构与数据验证已执行，开发者应用 adapter 后仍需运行目标服务的正常验证 |

上述工作没有以 TODO、空节点或编造映射冒充完成。低年级源表确切空栏与这些真正缺口分开处理。所有无证据日期使用 null，细节放在 null_reasons 和 sources.reading_evidence。

### 10.1 阅读中发现的内容冲突

当前 junior 共用 glossary 的提取文本把 √4 列作 irrational，也把 relative frequency 的分母写成可能结果数；教学表本身在相对频率处使用实际试验次数。本包采用正确数学：√4=2 为有理数，相对频率分母为实际 trial 数，竖直斜率为 undefined。来源定位：[r_nzc_current](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---mathematics-and-statistics-phases-1-4-years-0-10/5637289330.p)，Glossary / Irrational number、Relative frequency。不能因来自官方网页就复制数学错误；如需外部反馈，应再核对原版排版。

2026 Level 3 Calculus specifications 的 AS91579 credits 写为 5，而实际 achievement standard 与目录为 6；本包没有 credits 字段以避免传播冲突。若开发者加学分，应采用核实后的标准/目录并保留异常记录。依据：[m_specs_l3_2026](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91578-spc-2026.pdf)；[m_as91579](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91579.pdf)；[m_index_l3](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=03&query=mathematics&view=all)。

统计辅助 glossary 的 margin-of-error 例子有计数/百分比不一致，randomisation 文字例出现算术不一致；本包未照抄这些数值，所有采用的原创数字独立计算。日历中 52×7=364，不把 52 周当作精确一年；完整 4/100/400 闰年规则另由 NIST 核实。依据：[s_moe](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Glossary/Glossary-page-M)；[s_randomisation](https://newzealandcurriculum.tahurangi.education.govt.nz/randomisation/5637219728.p)；[f_nist_leap_year](https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z/time-and-frequency-z-l)。

## 11. 给开发者的合并与 MCP 实施说明

### 11.1 推荐的数据保留方式

将本包作为版本化补充层导入。保留原 Topic 的 ID 和非新西兰元数据，以 `topic-enrichments.json` 为可审查教学扩展，不自动覆盖所有原 evidence 或 standards。`topics.json` 是新候选数组，`baseline-index.json` 和 `baseline-dependencies.json` 只用于本次验证，不能再次 append 到已包含这些记录的生产图。

课程、标准、资格政策和来源均为独立实体。学生是否掌握一个 topic、是否满足某个 mapping 的局部 scope、是否达到一个 official standard，应是三个不同判断。不能因为答对一次短题就写“已获 AS91578”，也不能因数学概念映射到 Year 10 就要求该节点更高难度的所有诊断。

### 11.2 顺序明确的导入步骤

1. 对照 `repository-snapshot.json` 核实目标 commit 与六文件哈希。发生变动时复核真实 ID、描述与受影响依赖；不要自动重新生成同义 ID。
2. 读取 schema、sources、curriculum-frameworks、standards。将 source/standard/framework 引用建立为可查询关系，保留定位和日期精度。
3. 为 225 个现有 ID 增加映射，其中 152 个应用本包完整教学扩展；73 个只增映射。保留上游年龄和海外标准原值，不作 school-year-to-age 推断。
4. 处理一般图像求解的身份决定。若合并入既有 ID，重定向其 mappings、dependencies、requirements、math-checks、merge refs 和 profile 缓存后重新验证；不能只删 topic 记录。
5. 加入其他新 ID。对 812 条补充边，61 条已有同端点对按 merge-plan 更新 metadata/必要 strength，751 条为新端点对。保留三组 existing direction review，不悄悄删旧边。不要把 helpful 变成 hard。
6. 上游 soft 的语义保存在 reference 文件中为 legacy_soft；由适配器明确解释后再决定其展示/排序，不能不说明便把整个旧图重新解释。
7. 按映射语义键检查重复：topic、framework、year/phase、curriculum/qualification level、standard、status、effective dates。mapping ID 在此发布包内唯一；未来生成时即使编号变化也应先按语义键判断更新。
8. 重新计算派生 `standard_ids`、`curriculum_mapping_ids`，不要让缓存与独立映射表分叉。再次验证完整目标图 hard DAG，而不仅验证新增数组。
9. 在实际 MCP 适配器中加课程范围和证据响应，再运行该仓库本身要求的验证流程。本包没有修改生产代码或完成部署。

### 11.3 建议的查询能力（为开发设计，不宣称已存在）

| 能力 | 最低返回数据/行为 |
| --- | --- |
| 按 topic 查询 | 完整英文教学档案，适用映射及 scope，已有/新增身份，review_status |
| 按阶段/标准查询 | 独立 framework、status、effective dates 与 qualification/curriculum level；允许多条路径 |
| 诊断与提示 | 按适用范围挑选 question，先用分层提示，依据 understanding_evidence 与误解解释反馈；答案与官方评分地位分开 |
| 查询前置 | directed hard/helpful 边、逐条 reason、basis、confidence、source locator；不要只返回一个年级数字 |
| 规划路径 | 从目标 hard 祖先集合扣除已展示理解的范围，给出后续节点；helpful 作为备选支持，遇到未确认映射显示事实而非编造 |
| 覆盖与来源查询 | 按 requirement/standard/topic 找出 supported/partial/gap 及原来源定位，让 AI 能明确说出未覆盖内容 |

若沿用旧字段，`understanding_evidence` 和某个 selected diagnostic 可作为 evidence/assessmentPrompt 的显示适配，但原数组、答案/提示和 scope 仍须可访问。中央性不应编造静态值；若服务依赖它，应在实际新图上重新计算。全部教学档案 `review_status=research_draft`，该标签描述内容审查进度，不涉及用户账号、收费或访问权限。

## 12. 归属、许可与可复现性

基线名称、描述与依赖摘录来自固定上游仓库及其 Marble-derived graph，保留原 PROVENANCE 对 ODbL 1.0 数据库和 CC BY-SA 4.0 内容的要求。本包原创教学文字以 CC BY-SA 4.0、数据库补充以 ODbL 1.0 提供以便兼容；官方材料仍按其原权利状态处理。本包只记录标题、定位和自写数学说明，没有重新分发整份标准、试卷或教材。许可记录见 `repository-snapshot.json`，来源：[r_repo](https://github.com/maxazure/nz-learning-graph/tree/8daa98f84e3cc18de29e6033083a561a512987f3)，PROVENANCE.md。

执行 `python3 validate.py` 可在离线解压目录重跑结构、引用、DAG、计算和覆盖检查；`python3 validate.py --repo /path/to/nz-learning-graph` 另比对真实 checkout。脚本不会修改目标仓库。来源目录保留研究时访问日期与阅读证据，未确认的出版日为 null。下载包内的 `SHA256SUMS.txt` 用于核对文件传输完整性；当前执行结果不是未来仓库或未来政策状态的保证。

---

## 附录 A：高级数学标准的详细组件表

以下摘录中 `m_` source_id 均可在附录 C 与 sources.json 定位。表述是对已读内容的自写归纳；方法家族不被解释为每个学生的必修标准组合。

### A.1 通常 Year 12：八组数学标准及其细化

| 标准 | 实際覆盖的数学组件 | 真实来源 |
| --- | --- | --- |
| AS91256 — Apply co-ordinate geometry methods in solving problems | 两点距离、中点、梯度、由点/梯度构造直线方程、平行与垂直关系、交点与坐标几何论证。坐标距离复用已有 Pythagoras 节点 `mt_1VmTUxBrNd` | `m_as91256`，p. 2，EN4 |
| AS91257 — Apply graphical methods in solving problems | 线性/二次、指数、倒数、三次、对数、周期和分段关系的图像特征；方程参数、平移伸缩、定义域值域、表示转换与交点求解。函数家族是依据课程和数学结构细化，不是声称标准逐一列出全部家族 | `m_as91257`，p. 2，EN4；`m_nzc_senior`，Level 7 / Patterns and relationships |
| AS91258 — Apply sequences and series in solving problems | 算术与几何通项、有限和、收敛几何级数无穷和、首项/公差/公比恢复、项数与阈值、需要时采用对数求解 | `m_as91258`，p. 2，EN4–5 |
| AS91259 — Apply trigonometric relationships in solving problems | 弧度、弧长、扇形、正弦定理及歧义、余弦定理、三角形面积、二维到三维的三角建模 | `m_as91259`，p. 1，EN1；p. 2，EN4 |
| AS91260 — Apply network methods in solving problems | 网络表示、最短路径、可遍历性、最小生成树；区分不同优化目标 | `m_as91260`，p. 2，EN4 |
| AS91261 — Apply algebraic methods in solving problems | 有理代数式与定义域、正负及分数指数、根式、配方、二次公式、判别式、指数方程、对数及其规律、方程建模 | `m_as91261`，p. 2，EN4；`m_specs_l2_2026`，AS91261 |
| AS91262 — Apply calculus methods in solving problems | 平均/瞬时变化率、多项式导数、函数与导数图像、点处梯度、切线、驻点及性质、多项式反导数与常数、运动和优化情境 | `m_as91262`，p. 2，EN4；`m_specs_l2_2026`，AS91262 |
| AS91269 — Apply systems of equations in solving problems | 一条线性和一条非线性方程联立、线性不等式组、可行区域、代数/图像表示连接及情境解释 | `m_as91269`，p. 2，EN4 |

### A.2 通常 Year 13：八组数学标准与课程独立要求

| 标准 | 实际覆盖的数学组件 | 真实来源 |
| --- | --- | --- |
| AS91573 — Apply the geometry of conic sections in solving problems | 圆、抛物线、椭圆、双曲线；方程与图像、焦点/准线及几何性质、直角与参数表示、切线和法线 | `m_as91573`，p. 2，EN4 |
| AS91574 — Apply linear programming methods in solving problems | 建立线性目标与约束、可行区域、顶点和边界优化、整数条件、不可行、无界和多重最优的解释 | `m_as91574`，p. 2，EN4 |
| AS91575 — Apply trigonometric methods in solving problems | 单位圆与周期参数、倒数三角函数、勾股/和差/倍角恒等式、恒等证明、区间解、通解、通过恒等式和因式分解求方程全部分支 | `m_as91575`，p. 2，EN4 |
| AS91576 — Use critical path analysis in solving problems | 先后关系表、网络构造、最早时间正推、最迟时间反推、关键路径、任务调度及浮动时间 | `m_as91576`，p. 2，EN4 |
| AS91577 — Apply the algebra of complex numbers in solving problems | 复数四则与共轭、Argand 图、模与辐角、极形式、De Moivre、全部 n 次根、复根二次/三次方程、因式余式与共轭根关系、复平面轨迹及退化条件 | `m_as91577`，p. 2，EN4；`m_l3_report_2025`，pp. 3–5 |
| AS91578 — Apply differentiation methods in solving problems | 一般幂、指数对数、三角及倒数三角函数；链式/乘积/商法则；参数一阶与二阶导数；极限、连续、可微、凹凸及拐点；法线、相关变化率与建模优化 | `m_as91578`，p. 2，EN4；`m_specs_l3_2026`；`m_l3_report_2025`，pp. 5–8 |
| AS91579 — Apply integration methods in solving problems | 幂、多项式、自然指数、三角与有理积分；反链式及恒等变形；定积分和有符号累积、曲线间面积、运动总路程；矩形/梯形数值法；初值、可分离微分方程、增长衰减及牛顿冷却 | `m_as91579`，p. 2，EN4；`m_specs_l3_2026`；`m_l3_report_2025`，pp. 8–10 |
| AS91587 — Apply systems of simultaneous equations in solving problems | 三元一次系统的建模与求解、唯一/无解/无穷多解及情境解释 | `m_as91587`，pp. 1–2，EN1、EN4 |

NZC Level 8 的 Mathematics 目标还直接要求反函数/倒数函数图像、排列组合、曲线拟合与对数建模、分析和数值微积分。不能仅按上述八项数学标准标题建图，否则会遗漏课程要求。数据因此独立提供 `nzm_inverse_functions`、`nzm_inverse_reciprocal_comparison`、`nzm_log_linearisation_models` 和 `nzm_numerical_differentiation`；排列组合与统计拟合通过统计分包的已确认节点联接，没有创造不存在的排列组合标准编号。来源：`m_nzc_senior`，Level 8 / Mathematics。


## 附录 B：可按真实 ID 查询的高级诊断示例

这些示例说明数据粒度；完整 416 档案和 454 诊断在 JSON 中，不以示例代替数据。

### Finding all nth roots of a complex number

ID：`nzm_complex_nth_roots`；standards：91577。

**Diagnostic:** Find all cube roots of 8.

**Reference answer:** 2, −1+√3 i, −1−√3 i.

**Explanation:** The modulus is 2 and arguments are 0,2π/3,4π/3; these give three distinct roots.

**Progressive hints:** Write 8 as 8 cis(0+2kπ). → Take cube roots of the modulus and divide each permitted angle by 3.

实际 hard 前置：`nzm_de_moivre_powers`, `nzm_complex_polar_form`。

来源：[m_as91577](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91577.pdf)。

### Second derivatives of parametric curves

ID：`nzm_parametric_second_derivatives`；standards：91578。

**Diagnostic:** For x=t²+1 and y=t³, find d²y/dx² at t=2.

**Reference answer:** 3/8.

**Explanation:** dy/dx=3t/2; its t derivative is 3/2. Divide by dx/dt=2t to get 3/(4t), then set t=2.

**Progressive hints:** Begin with the first derivative dy/dx expressed in t. → Its t derivative must be converted back to an x derivative by dividing by dx/dt.

实际 hard 前置：`nzm_parametric_derivatives`, `nzm_chain_rule`。

来源：[m_as91578](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91578.pdf)；[m_l3_report_2025](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2025/91578-report-2025.pdf)。

### Solving separable differential equations

ID：`nzm_separable_differential_equations`；standards：91579。

**Diagnostic:** Solve dy/dx=2xy with y(0)=3.

**Reference answer:** y=3e^(x²).

**Explanation:** For this positive solution, dy/y=2x dx gives ln|y|=x²+C. Thus y=Ae^(x²), and y(0)=3 sets A=3. y=0 also solves the differential equation but not this initial condition.

**Progressive hints:** Move the y factor to the side containing dy. → Integrate both sides, then use the initial condition to determine the multiplier after exponentiating.

实际 hard 前置：`nzm_power_antiderivatives`, `nzm_exponential_equations`, `mt_3qrCtdoVAU`。

来源：[m_as91579](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91579.pdf)。

### Build a percentile bootstrap interval for a group difference

ID：`nzm_bootstrap_difference_interval`；standards：91582。

**Diagnostic:** A−B bootstrap differences have 2.5th and 97.5th percentiles 3 and 8 minutes. State the interval and what it estimates.

**Reference answer:** The percentile interval is [3,8] minutes for the population difference A−B in the selected summary, for example mean journey time, under the sampling and bootstrap assumptions.

**Explanation:** The distribution contains repeated estimates of one difference. Pooling and shuffling instead imposes a no-group-link model used in randomisation testing.

**Progressive hints:** Identify the statistic computed on each resample. → Take percentiles of that single difference distribution and name the population parameter.

实际 hard 前置：`nzm_bootstrap_resampling`, `nzm_confidence_interval_meaning`。

来源：[s_nzc_senior](https://newzealandcurriculum.tahurangi.education.govt.nz/the-new-zealand-curriculum---mathematics-and-statistics/5637209905.p)；[s_as91582](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91582.pdf)；[s_bootstrap_glossary](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Glossary/Glossary-page-B)；[s_bootstrap_practice](https://new.censusatschool.org.nz/resource/as-3-10-what-matters-most/)；[s_bootstrap_transcript](https://flexiblelearning.auckland.ac.nz/data-to-insight/8/1/files/illustrated-6.2_bootstrap-re-sampling.pdf)。

## 附录 C：来源目录索引

完整访问日、出版日、阅读方法、状态和细定位以 sources.json 为准。以下列出所有 source_id；同一 URL 的不同阅读记录保留独立引用身份。

| source_id | 标题与准确 URL | 发布机构 |
| --- | --- | --- |
| f_phase1 | [NZC – Mathematics and Statistics Phase 1 (Years 0–3)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289331.p) | New Zealand Ministry of Education / Tāhūrangi |
| f_phase2 | [NZC – Mathematics and Statistics Phase 2 (Years 4–6)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289332.p) | New Zealand Ministry of Education / Tāhūrangi |
| f_phase3 | [NZC – Mathematics and Statistics Phase 3 (Years 7–8)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289333.p) | New Zealand Ministry of Education / Tāhūrangi |
| f_phase4 | [NZC – Mathematics and Statistics Phase 4 (Years 9–10)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637291579.p) | New Zealand Ministry of Education / Tāhūrangi |
| f_overview | [NZC – Mathematics and statistics Phases 1–4 (Years 0–10)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289330.p) | New Zealand Ministry of Education / Tāhūrangi |
| f_nist_leap_year | [Time and Frequency from A to Z, L](https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z/time-and-frequency-z-l) | National Institute of Standards and Technology (NIST) |
| f_te_reo_counting | [Ka Mau te Wehi! Unit 4 - Waea mai - Ring me](https://tahurangi.education.govt.nz/ka-mau-te-wehi-unit-4---waea-mai---ring-me/5637169343.p?domain=newzealandcurriculum.tahurangi.education.govt.nz) | New Zealand Ministry of Education / Tāhūrangi |
| m_as91256 | [AS91256: Apply co-ordinate geometry methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91256.pdf) | New Zealand Qualifications Authority |
| m_as91257 | [AS91257: Apply graphical methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91257.pdf) | New Zealand Qualifications Authority |
| m_as91258 | [AS91258: Apply sequences and series in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91258.pdf) | New Zealand Qualifications Authority |
| m_as91259 | [AS91259: Apply trigonometric relationships in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91259.pdf) | New Zealand Qualifications Authority |
| m_as91260 | [AS91260: Apply network methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91260.pdf) | New Zealand Qualifications Authority |
| m_as91261 | [AS91261: Apply algebraic methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91261.pdf) | New Zealand Qualifications Authority |
| m_as91262 | [AS91262: Apply calculus methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91262.pdf) | New Zealand Qualifications Authority |
| m_as91269 | [AS91269: Apply systems of equations in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91269.pdf) | New Zealand Qualifications Authority |
| m_as91573 | [AS91573: Apply the geometry of conic sections in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91573.pdf) | New Zealand Qualifications Authority |
| m_as91574 | [AS91574: Apply linear programming methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91574.pdf) | New Zealand Qualifications Authority |
| m_as91575 | [AS91575: Apply trigonometric methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91575.pdf) | New Zealand Qualifications Authority |
| m_as91576 | [AS91576: Use critical path analysis in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91576.pdf) | New Zealand Qualifications Authority |
| m_as91577 | [AS91577: Apply the algebra of complex numbers in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91577.pdf) | New Zealand Qualifications Authority |
| m_as91578 | [AS91578: Apply differentiation methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91578.pdf) | New Zealand Qualifications Authority |
| m_as91579 | [AS91579: Apply integration methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91579.pdf) | New Zealand Qualifications Authority |
| m_as91587 | [AS91587: Apply systems of simultaneous equations in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91587.pdf) | New Zealand Qualifications Authority |
| m_index_l2 | [NZQA Mathematics Level 2 current achievement-standard catalogue](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=02&query=mathematics&view=all) | New Zealand Qualifications Authority |
| m_index_l3 | [NZQA Mathematics Level 3 current achievement-standard catalogue](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=03&query=mathematics&view=all) | New Zealand Qualifications Authority |
| m_specs_l2_2026 | [Level 2 Mathematics and Statistics 2026 Assessment Specifications](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91261-spc-2026.pdf) | New Zealand Qualifications Authority |
| m_specs_l3_2026 | [Level 3 Calculus 2026 Assessment Specifications](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91578-spc-2026.pdf) | New Zealand Qualifications Authority |
| m_specs_l1_2026 | [Level 1 Mathematics and Statistics 2026 Assessment Specifications](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91946-spc-2026.pdf) | New Zealand Qualifications Authority |
| m_l1_outcomes | [Mathematics and Statistics NCEA NZC Level 1: Subject Learning Outcomes, Version 4](https://ncea-live-3-storagestack-53q-assetstorages3bucket-2o21xte0r81u.s3.amazonaws.com/s3fs-public/2026-01/MS%20NCEA%20Level%201%20Subject%20Learning%20Outcomes.pdf?VersionId=w7R4QClh24XNIfDtPq46oauOYzTBAv7E) | Ministry of Education |
| m_l3_report_2025 | [NCEA Level 3 Calculus 2025 Assessment Report](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2025/91578-report-2025.pdf) | New Zealand Qualifications Authority |
| m_nzc_senior | [The New Zealand Curriculum – Mathematics and statistics (current senior Levels 6–8)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637209905.p) | Ministry of Education |
| s_nzc_senior | [The New Zealand Curriculum – Mathematics and statistics](https://newzealandcurriculum.tahurangi.education.govt.nz/the-new-zealand-curriculum---mathematics-and-statistics/5637209905.p) | Ministry of Education |
| s_phase4 | [NZC – Mathematics and Statistics Phase 4 (Years 9–10)](https://newzealandcurriculum.tahurangi.education.govt.nz/5637291579.p) | Ministry of Education |
| s_catalog_l1 | [NZQA current Mathematics and Statistics assessment catalogue, Level 1](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=01&query=mathematics&view=all) | New Zealand Qualifications Authority |
| s_catalog_l2 | [NZQA current Mathematics and Statistics assessment catalogue, Level 2](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=02&query=mathematics&view=all) | New Zealand Qualifications Authority |
| s_catalog_l3 | [NZQA current Mathematics and Statistics assessment catalogue, Level 3](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=03&query=math&view=files) | New Zealand Qualifications Authority |
| s_as91944 | [AS91944 v4 – Explore data using a statistical enquiry process](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91944.pdf) | New Zealand Qualifications Authority |
| s_as91946 | [AS91946 v3 – Interpret and apply mathematical and statistical information in context](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91946.pdf) | New Zealand Qualifications Authority |
| s_as91263 | [AS91263 v3 – Design a questionnaire](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91263.pdf) | New Zealand Qualifications Authority |
| s_as91264 | [AS91264 v3 – Use statistical methods to make an inference](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91264.pdf) | New Zealand Qualifications Authority |
| s_as91265 | [AS91265 v3 – Conduct an experiment to investigate a situation using statistical methods](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91265.pdf) | New Zealand Qualifications Authority |
| s_as91266 | [AS91266 v3 – Evaluate a statistically based report](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91266.pdf) | New Zealand Qualifications Authority |
| s_as91267 | [AS91267 v3 – Apply probability methods in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91267.pdf) | New Zealand Qualifications Authority |
| s_as91268 | [AS91268 v3 – Investigate a situation involving elements of chance using a simulation](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91268.pdf) | New Zealand Qualifications Authority |
| s_as91580 | [AS91580 v2 – Investigate time series data](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91580.pdf) | New Zealand Qualifications Authority |
| s_as91581 | [AS91581 v2 – Investigate bivariate measurement data](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91581.pdf) | New Zealand Qualifications Authority |
| s_as91582 | [AS91582 v2 – Use statistical methods to make a formal inference](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91582.pdf) | New Zealand Qualifications Authority |
| s_as91583 | [AS91583 v2 – Conduct an experiment to investigate a situation using experimental design principles](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91583.pdf) | New Zealand Qualifications Authority |
| s_as91584 | [AS91584 v2 – Evaluate statistically based reports](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91584.pdf) | New Zealand Qualifications Authority |
| s_as91585 | [AS91585 v2 – Apply probability concepts in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91585.pdf) | New Zealand Qualifications Authority |
| s_as91586 | [AS91586 v2 – Apply probability distributions in solving problems](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2019/as91586.pdf) | New Zealand Qualifications Authority |
| s_spec_l1_2026 | [2026 Assessment Specifications – Level 1 Mathematics and Statistics](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91947-spc-2026.pdf) | New Zealand Qualifications Authority |
| s_spec_l2_2026 | [2026 Assessment Specifications – Level 2 Mathematics and Statistics](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91267-spc-2026.pdf) | New Zealand Qualifications Authority |
| s_spec_l3_2026 | [2026 Assessment Specifications – Level 3 Statistics](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91586-spc-2026.pdf) | New Zealand Qualifications Authority |
| s_l1_slo | [Mathematics and Statistics NCEA NZC Level 1 Subject Learning Outcomes for Assessment, Version 4](https://ncea-live-3-storagestack-53q-assetstorages3bucket-2o21xte0r81u.s3.amazonaws.com/s3fs-public/2026-01/MS%20NCEA%20Level%201%20Subject%20Learning%20Outcomes.pdf?VersionId=w7R4QClh24XNIfDtPq46oauOYzTBAv7E) | Ministry of Education |
| s_s7_inference | [Achievement objective S7-2 – Senior Secondary teaching and learning guide](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Achievement-objectives/AOs-by-level/AO-S7-2) | Ministry of Education |
| s_clt | [Central limit theorem](https://newzealandcurriculum.tahurangi.education.govt.nz/central-limit-theorem/5637219747.p) | Ministry of Education |
| s_moe | [Glossary page M – Margin of error](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Glossary/Glossary-page-M) | Ministry of Education |
| s_bootstrap | [Confidence Intervals from Bootstrap Resampling](https://new.censusatschool.org.nz/resource/cis-from-bootstrap/) | CensusAtSchool New Zealand / Chris Wild |
| s_bootstrap_practice | [Inference AS 3.10 – What matters most?](https://new.censusatschool.org.nz/resource/as-3-10-what-matters-most/) | CensusAtSchool New Zealand / Michelle Dalrymple |
| s_inference_progression | [How do I correctly pose a comparison investigative question for Kiwi Kapers 3 and state my conclusions when making an inference about the population?](https://new.censusatschool.org.nz/faq/posing-a-comparison-investigative-question-and-conclusions-for-kiwi-kapers-3-and-state/) | CensusAtSchool New Zealand / Pip Arnold |
| s_timeseries | [Describing the trend in a time series (2016)](https://new.censusatschool.org.nz/resource/describing-the-trend-in-a-time-series/) | CensusAtSchool New Zealand / Mathematics and Statistics Facilitators / NZSA Education Committee |
| s_examreport_2025 | [NCEA Level 3 Statistics 2025 Assessment Report](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2025/91586-report-2025.pdf) | New Zealand Qualifications Authority |
| s_schedule_91586_2025 | [2025 Assessment Schedule – Apply probability distributions in solving problems (91586)](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2025/91586-ass-2025.pdf) | New Zealand Qualifications Authority |
| s_design_principles | [Experimental design principles](https://newzealandcurriculum.tahurangi.education.govt.nz/5637219735.p) | Ministry of Education |
| s_randomisation | [Randomisation](https://newzealandcurriculum.tahurangi.education.govt.nz/randomisation/5637219728.p) | Ministry of Education |
| s_bootstrap_glossary | [Glossary page B – Bootstrap confidence interval, bootstrap distribution and bootstrapping](https://seniorsecondary.tki.org.nz/Mathematics-and-statistics/Glossary/Glossary-page-B) | Ministry of Education |
| s_bootstrap_transcript | [Data to Insight – Confidence Intervals from Bootstrap Re-sampling](https://flexiblelearning.auckland.ac.nz/data-to-insight/8/1/files/illustrated-6.2_bootstrap-re-sampling.pdf) | University of Auckland / Chris Wild |
| r_nzc_current | [NZC - Mathematics and statistics Phases 1–4 (Years 0–10)](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---mathematics-and-statistics-phases-1-4-years-0-10/5637289330.p) | Ministry of Education |
| r_nzc_senior | [The New Zealand Curriculum - Mathematics and statistics](https://newzealandcurriculum.tahurangi.education.govt.nz/5637209905.p) | Ministry of Education |
| r_l1_index | [Search Standards & Assessment: Mathematics, Level 1](https://www.nzqa.govt.nz/ncea/assessment/search.do?level=01&query=mathematics&view=all) | New Zealand Qualifications Authority |
| r_as91945 | [AS 91945: Use mathematical methods to explore problems that relate to life in Aotearoa New Zealand or the Pacific](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91945.pdf) | New Zealand Qualifications Authority |
| r_as91946 | [AS 91946: Interpret and apply mathematical and statistical information in context](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91946.pdf) | New Zealand Qualifications Authority |
| r_as91947 | [AS 91947: Demonstrate mathematical reasoning](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/2024/as91947.pdf) | New Zealand Qualifications Authority |
| r_l1_spec2026 | [Level 1 Mathematics and Statistics 2026: Assessment Specifications](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91947-spc-2026.pdf) | New Zealand Qualifications Authority |
| r_l1_slo_v4 | [Mathematics and Statistics NCEA NZC Level 1: Subject Learning Outcomes for Assessment, Version 4](https://ncea-live-3-storagestack-53q-assetstorages3bucket-2o21xte0r81u.s3.amazonaws.com/s3fs-public/2026-01/MS%20NCEA%20Level%201%20Subject%20Learning%20Outcomes.pdf?VersionId=w7R4QClh24XNIfDtPq46oauOYzTBAv7E) | Ministry of Education |
| r_us32406 | [US 32406: Apply mathematics and statistics in a range of everyday situations](https://www.nzqa.govt.nz/nqfdocs/units/pdf/32406.pdf) | New Zealand Qualifications Authority |
| r_us32406_index | [Framework search results: Unit Standard 32406](https://www.nzqa.govt.nz/ncea/assessment/search.do?query=32406) | New Zealand Qualifications Authority |
| r_us5236 | [US 5236: Use Pythagoras' theorem and trigonometry to solve problems related to right-angled triangles in the workplace](https://www.nzqa.govt.nz/nqfdocs/units/pdf/5236.pdf) | New Zealand Qualifications Authority |
| r_phase5_proposed | [NZC - Mathematics and Statistics Phase 5 (Years 11–13)](https://newzealandcurriculum.tahurangi.education.govt.nz/new-zealand-curriculum-online/nzc---mathematics-and-statistics-phase-5/5637326079.p) | Ministry of Education |
| r_rollout | [The National Curriculum: Our Story](https://tahurangi.education.govt.nz/our-story) | Ministry of Education |
| r_qualification_decision | [Details of NCEA replacement confirmed](https://www.beehive.govt.nz/release/details-ncea-replacement-confirmed) | New Zealand Government |
| r_tekura_paths | [Mathematics and Statistics: Learning Programmes](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics) | Te Aho o Te Kura Pounamu |
| r_tekura_mx3000 | [MX 3000 - Calculus - NCEA Level 3](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics/mx3000) | Te Aho o Te Kura Pounamu |
| r_tekura_ms3000 | [MS 3000 - Statistics - NCEA Level 3](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics/ms3000) | Te Aho o Te Kura Pounamu |
| r_tekura_mz3000 | [MZ 3000 - Mathematics - NCEA Level 3](https://www.tekura.school.nz/lp/learning-programmes/mathematics-and-statistics/mz3000) | Te Aho o Te Kura Pounamu |
| r_auckland_2027 | [MATHS 108 - General Mathematics 1, Summer Semester 2027](https://study.auckland.ac.nz/ords/r/uoa/catalogue/course?p0_catalogue_term=Summer&p0_catalogue_year=2027&p6_code=MATHS+108) | University of Auckland |
| r_repo | [nz-learning-graph: inspected repository snapshot](https://github.com/maxazure/nz-learning-graph/tree/8daa98f84e3cc18de29e6033083a561a512987f3) | maxazure/nz-learning-graph contributors |
| r_ncea_levels | [About NCEA](https://ncea.education.govt.nz/about-ncea) | Ministry of Education |
