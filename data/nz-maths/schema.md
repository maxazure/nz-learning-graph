# 结构化数据合同与字段说明

版本：1.0.0；研究快照：2026-10-18。教学文字使用英文，工程说明可使用中文。所有 JSON 采用 UTF-8，根值一般为数组；merge-plan、repository-snapshot、validation-results、schema 为对象。CSV 使用 UTF-8、首行字段名、标准双引号转义和逗号分隔。

## 1. 验证与通用规则

`schema.json` 使用 JSON Schema Draft 2020–12。根对象的 `x-file-schemas` 将文件名映射到对应 `$defs` 的 JSON Pointer；例如 `topics.json` 对应 `#/$defs/topics.json`。本文件说明语义；机器结构以 JSON Schema 为准，跨文件不变量由 `validate.py` 补充。

验证器实现本包实际使用的 `$ref`、type、enum、required、properties、additionalProperties、items、minItems、uniqueItems、minLength、minimum、maximum、format=date 等关键字。它不是任意 JSON Schema 的通用引擎；若以后加入其他关键字，应更新验证器或使用完整标准实现。

### 1.1 基本类型

| 类型/约定 | 定义 |
| --- | --- |
| ID | 非空字符串，大小写敏感；不从显示名称动态重新生成 |
| 日期 | `YYYY-MM-DD`；不完整出版年/月不能伪装成准确日期，使用 null 并在 notes 中保留已知精度 |
| 日期时间 | validation `executed_at`、snapshot `commit_date` 为 ISO 8601 日期时间，保留时区 |
| 空数组 | 已知没有关系或没有该类内容，例如 curriculum-only topic 的 standard_ids；不是未知内容的占位符 |
| null | 字段不适用或没有确认；映射和实体的 `null_reasons` 应逐字段解释 |
| confidence | `high`、`medium`、`low`，是证据/教学对应把握程度，不是学生能力概率 |
| 英文数学文字 | 可包含 Unicode 数学符号、普通公式及上下标；所有 JSON 字符串均为实际完整内容 |
| 额外字段 | Schema 对部分对象允许扩展。使用本包已定义字段时仍须符合类型和引用规则，不得覆盖其既有语义 |

### 1.2 引用完整性

新 topic ID 在 `topics.json`；已存在 ID 在 `baseline-index.json`。教学补充必须引用其中真实既有 ID。所有 `topic_id`、`prerequisite_id`、topic 列表、merge 候选和前后方向 ID 都应存在。

`source_id`/`source_ids` 引用 `sources.json`；`standard_id`/`standard_ids` 引用 `standards.json`；`framework`/`framework_ids` 引用 `curriculum-frameworks.json`；`mapping_ids`/`curriculum_mapping_ids` 引用 `curriculum-mappings.json`。`retired_draft_id` 明确属于已退役草稿别名，不是待导入节点，不能作为有效依赖端点。

source_id 表示一次有定位的来源记录。同一精确 URL 可有多个稳定 source_id，以保留独立阅读和不同定位；不能把来源记录数等同于独立文档数。局部 locator 的字符串不是网页 ref_id；最终引用应解析为 sources.url 加定位。

## 2. topics.json 与 topic-enrichments.json

两者使用同一种完整教学档案结构。前者只含新候选 ID；后者只含已验证的既有 ID。新增不等于已经进入生产仓库。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| id | string | 稳定知识点身份；新增使用 `nzm_` 语义名称，复用保留真实 `mt_`/`nz_` ID |
| name | string | 英文可读名称 |
| node_type | enum | `concept` 数学概念、`skill` 方法/技能、`practice` 跨内容调查/建模/问题解决 |
| subject | enum | `Mathematics` 或 `Statistics` |
| domain | enum | Number、Algebra、Functions、Measurement、Geometry、Trigonometry、Calculus、Probability、Statistics、Mathematical practices |
| subdomain | string | 细分领域，采用一致的英文语义标签，不宣称都是官方栏目名称 |
| description | string | 概念/方法的英文说明，保留条件、公式、单位和限制 |
| learning_objectives | nonempty string[] | 可执行、可观察的学习目标 |
| understanding_evidence | nonempty string[] | 可以据学生回答/操作观察到的理解证据 |
| common_misconceptions | nonempty string[] | 具体易错观念或程序错误 |
| diagnostic_questions | nonempty Diagnostic[] | 原创诊断、答案、解释、分层提示与适用范围 |
| short_activity | Activity | 家长或 AI 可引导的短活动，不等于完整官方 assessment |
| year_placement | Placement | 便于检索的范围；独立映射表才是精确课程依据 |
| standard_ids | string[] | 从独立映射派生的标准索引，可为空；不得手工维护出分叉 |
| curriculum_mapping_ids | nonempty string[] | 该 topic 在独立表中的全部映射 ID 缓存 |
| source_ids | nonempty string[] | 档案直接内容来源 |
| source_locators | nonempty Locator[] | 该内容的具体页码/条款/栏目定位 |
| merge | TopicMerge | 原身份、候选身份及建议 |
| review_status | enum | 本发布均为 `research_draft`，不表示教师已审核 |
| alternative_explanations | optional string[] | 合并独立稿时保留的不同解释，不创建新身份 |
| additional_activities | optional Activity[] | 合并时保留的活动；可附 years 检索范围 |

### Diagnostic

必填 `question`、`answer`、`explanation` 为非空英文字符串；`hints` 为至少两个非空字符串，按从较少帮助到较强帮助排序。`applicability` 包含 `years`（0–13 整数数组）、`standard_ids`、`notes`。它是选择诊断的编辑信息，不是 NZQA 提供的官方题目标签，也不能替代独立 mapping scope。

同一宽节点可能同时有早期单项诊断和后期综合诊断。不要仅按 year_placement 最小值把其全部题目给低龄学生。参考答案可用于 AI 判断证据；引导时应先选择适用题和渐进提示。

### Activity

`instructions` 为完整活动指令；`materials` 为所需材料的字符串数组；`estimated_minutes` 为正整数。合并保留的额外活动可有 `years` 数组。时间是设计估计，没有宣称实测。活动可使用计算器/电子表格，不应把高中公式和建模情境改成与内容不相符的幼龄操作。

### Placement

`years` 为 0–13 的整数数组，可表达范围、多路径或留空；`phase` 为阶段文字或 null；`precision` 为 `source_explicit`、`editorial_range`、`unconfirmed`；`rationale` 解释范围和限制；`source_ids` 指向证据。

Phase 1 的官方实体是 schooling duration；其整数 school-year 检索值使用 editorial_range。NCEA Level 1/2/3 的通常 Year 11/12/13 不是固定对应。跨年级的局部映射不能自动变成整个 topic 的掌握要求。

### TopicMerge

`action` 为 `add_new`、`reuse_existing`、`manual_review`。`existing_topic_id` 为真实既有 ID 或 null；`candidate_existing_ids` 为待比较的真实既有 ID 数组；`reason` 为具体数学/身份理由。候选列表既可记录宽基础，也可记录可能同义；以 reason 和顶层 merge-plan 决定处理，不能一见候选就自动合并。

## 3. dependencies.json

根为 Dependency 数组，唯一身份是 `(prerequisite_id, topic_id)`。同端点对不能重复；不允许自依赖。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| prerequisite_id | string | 前置节点 |
| topic_id | string | 目标节点；方向恒为 prerequisite → target |
| strength | enum | `hard` 或 `helpful` |
| reason | string | 解释哪个数学对象/操作支持哪个目标；不能仅写“上一年级” |
| basis | enum | `source_explicit` 或 `pedagogical_inference` |
| source_ids | string[] | 支持内容或显式关系的来源；应与 reason/basis 一起解释 |
| source_locators | Locator[] | 精确位置及 supports 说明 |
| confidence | enum | high / medium / low |

hard 必须在实际合并后的图中组成 DAG。helpful 可形成学习联想或复习路径，算法不可当作强制拓扑前置。本发布的所有补充边均为 pedagogical_inference；有 source_ids 不表示官方规定了这些端点的次序。source_explicit 只有在定位明确支持该学习关系时可使用，验证器要求其有定位来源。

没有在该文件存放 related/similar/alias/application 关系。相似/身份问题进入 merge-plan 的审查列表，避免用双向 hard 关系表示同义。

## 4. curriculum-mappings.json

根为 Mapping 数组。一条记录连接一个 topic 与一个明确框架/范围。一个标准对应多条 topic 映射，一个 topic 可有多个标准和课程位置。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| id | string | 本发布中唯一映射 ID |
| topic_id | string | 被映射知识点 |
| framework | enum/reference | NZC_2025_Y0_10、NZC_2007_L6_8、NCEA_current、NCEA_numeracy_corequisite、NZQA_vocational_unit_standard |
| year_or_phase | string/null | 精确教学年/在校时长或 NZC Level 文字；NCEA 记录唯一 school year 为 null |
| curriculum_level | optional integer/null | senior NZC 6/7/8；不是 qualification_level；NCEA 记录可省略，由独立 NZC 行表达 |
| qualification_level | integer/null | 对应资格的 level；school curriculum 行为 null |
| standard_id | string/null | 官方数字编号，按字符串保存；没有标准时 null，不使用虚构 code |
| standard_title | string/null | 准确标准标题，应与 registry 一致 |
| standard_version | optional integer/null | 已核实版本；可以从 standards.version 读取；不能由 URL 年份推断 |
| status | enum | current、future_published、superseded、consultation、unconfirmed、published_proposed_not_in_force；本发布微技能映射均 current |
| effective_from | date/null | 已核实的起始适用日；基础当前映射固定 2026-01-01 |
| effective_to | date/null | 已核实最终适用日；没有证据时 null，不用 review date 代替 |
| source_ids | nonempty string[] | 支持该具体内容对应的来源 |
| source_locators | nonempty Locator[] | 年列/栏目/EN/页码和 scope |
| mapping_basis | enum | source_explicit 或 editorial_alignment |
| mapping_confidence | enum | high / medium / low |
| notes | string | 内容子范围、方法路线、评估限制、典型路径和其他必要解释 |
| null_reasons | object of strings | 以为 null 的字段名为键，解释不适用或未确认原因 |

本发布全部 mapping_basis 为 editorial_alignment：官方课程/标准内容是实际来源，项目中的 topic ID 和微技能拆分是研究者的对应。high 不是官方发布了该项目 ID 的声明。

去重语义键为 topic_id、framework、year_or_phase、qualification_level、curriculum_level、standard_id、status、effective_from、effective_to。标准 title/version 与 registry 交叉核对。不能将 framework 字段写成两个框架拼接的伪 ID。

null 与省略不同：规范的最低字段始终存在；扩展字段 curriculum_level/standard_version 可省略。对于必需日期、标准及阶段字段，null 必须有 null_reasons。published_on 出版日、version 修订日、planned review、最后 assessment 日不是同一含义。

## 5. sources.json 与 Locator

根为 Source 数组；source_id 唯一。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| source_id | string | 本包稳定来源键 |
| title | string | 所读来源标题 |
| url | string | 实际准确 URL，可保留查询参数；不是编造的下载路径 |
| publisher | string | 主管部门、NZQA、学校/大学/资源作者或仓库贡献者 |
| source_type | enum | curriculum、achievement_standard、unit_standard、assessment_specification、assessment_material、guidance、policy、pathway、repository、research、technical_reference、teaching_resource |
| accessed_on | date | 本次实际研究访问日 |
| published_on | date/null | 已核实准确出版/修订日；仅年份或月份已知则 null，并记入 notes |
| status_as_of_access | string | 当时适用状态和边界，可区分 current 内容、旧辅助教学资源或未来政策 |
| locators | nonempty object[] | 来源内部位置索引，每项 id、locator、description 均为字符串 |
| reading_evidence | object | method 和 what_was_read；明确真实读到的范围 |
| notes | string | 版本、重定向、精度、限制或来源异常；可为空字符串 |

reading_evidence.method 为 web_open、web_find、pdf_text、repository_fetch。不会给返回 403 的未读正文生成虚假“已读”记录。此目录不包含整份官方标准/评估文件正文。

通用 Locator 对象有 `source_id`、`locator`、可选 `supports`。locator 用明确字符串描述页码、Explanatory Note、官方栏目、year/time-in-school 列或已核实仓库路径；supports 说明其支持内容、评估对应还是学习关系。它无需等于 source.locators[].id； source 层可定位整段，mapping 层进一步细化。

## 6. standards.json

标准实体并非 topic。根为数组，standard_id 唯一；本包包括 33 school achievement standards 和 2 unit standards。

| 字段 | 类型/语义 |
| --- | --- |
| standard_id、standard_title | 字符串官方编号及标题 |
| standard_type | achievement_standard / unit_standard |
| framework | 独立评估框架 ID |
| qualification_level | 整数，不是 NZC curriculum level |
| version | 整数或 null；本发布各实体均已核实版本 |
| status | 字符串状态；本发布均 current |
| effective_from、effective_to | 日期或 null；null_reasons 解释 |
| assessment_type | internal / external；本包按已读标准/目录/规格分类 |
| source_ids、source_locators | 来源与精确定位 |
| topic_ids | 从独立映射派生的贡献技能索引，不是获得标准的充分条件 |
| notes | 标准与短诊断/完整评估的边界 |
| null_reasons | 逐字段 null 解释 |

未提供 credits 字段：AS91579 的 2026 specifications 与标准/目录存在学分冲突，已记录在报告中。不要从旧目录行号或文件年份生成版本/生效日期。

## 7. curriculum-frameworks.json

根为 Framework 数组，包含课程、评估框架和资格政策的适用状态。

| 字段 | 类型/语义 |
| --- | --- |
| framework_id | 字符串稳定实体 ID |
| name | 可读实体名称 |
| entity_type | curriculum / assessment_framework / qualification_policy |
| status | current / superseded / published_proposed_not_in_force / announced_future_policy |
| research_as_of | 本次核实日 |
| applicability_scope | 学校体系、年级、课程或资格适用范围 |
| effective_from、effective_to | 日期或 null；拟议日期必须结合 status 阅读 |
| announced_implementation_years | 对象，award 名称 → 整数年份；没有此内容时空对象 |
| source_ids、source_locators | 状态、范围和时间的证据 |
| notes、null_reasons | 法律/规划状态、尚未读取的未来全文及日期边界 |

未来 Phase 5 按 Year 11、12、13 分别登记；新资格仅用已宣布名称，不编造 NZQA 注册 ID。框架登记不代表已经有全部 future topic mappings。

## 8. curriculum-requirements.json 与 coverage-matrix.csv

Requirement 是研究者从来源归纳的可审查内容组。`requirement_id` 是本包内部审计 ID，绝不能解释为官方标准编号。

| 字段 | 类型/语义 |
| --- | --- |
| requirement_id | 唯一字符串 |
| framework | 主要分类的合法框架 ID |
| framework_ids | 非空合法框架数组；跨课程/评估审计保留多个，不拼成新官方框架 |
| year_or_phase | 真实教学阶段或典型 Year 11/12/13；配合 framework/notes 解释 |
| domain、subdomain | 审计领域及具体子领域；可比 topic domain 更宽，不强行套 topic 枚举 |
| requirement_summary | 对已读内容的自写概括 |
| standard_ids、topic_ids | 对应实体列表，可为空 |
| source_ids、source_locators | 非空来源与定位 |
| coverage_status | covered / partial / gap / not_applicable |
| remaining_gaps | 具体缺口字符串，无缺口可为空 |
| notes | 分组范围、是否只是目录出现、典型年级及判断边界 |
| audit_kind | 下表六种审计层之一 |
| components | 可选组成部分数组，用于来源教学表的层级核对 |
| not_applicable_in_source | 可选 boolean；明确源表该列为空 |

components 每项必需 `requirement`、`topic_ids`、`status`；可有 `same_stage_mapped_topic_ids` 与 `supporting_topic_ids_without_same_stage_mapping`。status 为 covered、partial 或 gap。parent partial 可以含 gap 子组件。实际语言解释比单一计数更重要。

| audit_kind | 含义 |
| --- | --- |
| teaching_sequence_component | Years 0–10 官方年列/要素的内容分组 |
| curriculum_objective | 当前 senior NZC 目标内容组 |
| assessment_component | 标准条款中的方法/说明组成部分 |
| curriculum_objective_component | 高中数学目标的进一步组件分解 |
| diagnostic_skill_family | 细分技能或实践及其诊断表示 |
| standard_catalogue_presence | 官方目录中的标准是否有映射；不是整标准 attainment |

CSV 每行与一个 requirement_id 对应；字段为 requirement_id、audit_kind、year_or_phase、framework、framework_ids、domain、subdomain、coverage_status、topic_count、topic_ids、standard_ids、source_ids、source_locators、remaining_gaps、notes。ID 数组用英文分号分隔；source_locators 平铺为带 source_id 的文本，精确结构仍从 JSON 读取。topic_count 是该行不同 topic_id 的数量。

不同 audit_kind 会重叠，不能求和为全课程分母。covered 只指本行归纳的组件已表示；源表空列 not_applicable 不等于学生不可以提前探索。没有把来源没有列出的项目强行填到唯一年级。

## 9. merge-plan.json

根为对象。`schema_version` 是数据合同版本；`baseline_commit` 是已研究上游版本；`integration_steps` 是有顺序的操作说明；`notes` 说明工程边界。其他字段如下。

| 字段 | 每项的实际子字段及语义 |
| --- | --- |
| reuse_existing | topic_id、existing_name、proposed_name、pedagogy_action（apply_enrichment/mapping_only）、mapping_ids、source_ids、reason |
| add_new | topic_id、name、domain、node_type、recommended_action（add_new/hold_identity_decision_for_review）、reason |
| manual_review | review_id、kind（possible_overlap/existing_overlap）、topic_id 或 topic_ids、candidate_existing_ids、可选 preferred_reuse_id、recommended_action、reason；同一 ID 可跨组出现 |
| existing_dependency_changes | prerequisite_id、topic_id、action（replace_metadata/review_strength_change）、previous_strength、proposed_strength、previous_reason、proposed_reason、basis、source_ids、reason；已有端点对替换一次，不能重复 append |
| existing_dependency_direction_reviews | action、existing_prerequisite_id、existing_topic_id、proposed_prerequisite_id、proposed_topic_id、proposed_strength、reason、original_pedagogical_reason、source_ids、notes；记录方向冲突及已选 helpful 路线，未静默移除上游 |
| resolved_identity_consolidations | retired_draft_id、topic_id、reason；草稿 ID 已消失，引用已重定向 |
| collapsed_identity_edges | topic_id、reason；身份合并后成为自边的草稿关系被消除，本发布数组可以为空 |
| profile_merges | topic_id、incoming_shard、decision；独立编写档案按同一身份合并的审计记录 |
| reviewed_scope_distinctions | topic_ids、decision（retain_distinct）、reason；名称相似但对象/方法/表示不同 |
| dedup_method | complete_existing_mathematics_records_reviewed；name_similarity_screen（method、candidate_pairs_reviewed）；scope_review，说明筛查和语义判断的区别 |

manual_review 的“建议复核”是数据合并事项，不是用户账号或访问权限设计。merge-plan 中复用、待审和方向审查是不同维度，数量不能相加成独立知识点总数。

## 10. 基线与仓库快照

### baseline-index.json

每项为 id、name、subject、domain、origin_file；数学引用另保留 description。包含全学科 1,606 个 ID，以便对真实 combined graph 检查。它不是整份 upstream topics 的替代，也不包括全部原始字段，不能据此覆盖生产知识库。

### baseline-dependencies.json

每项 prerequisite_id、topic_id、strength、original_strength、reason、origin_file。strength 为 hard 或 legacy_soft；original_strength 保留旧语义（含 graph.ts 从 overlay 生成 hard 的说明）。这些是已有关系的引用快照，不是待重复追加的补充边。

### repository-snapshot.json

repository_url、reference_commit、commit_date、accessed_on、retrieval_method 描述实际取得方式。files 中每项 path、byte_count、sha256、git_blob_sha1、pinned_ref_blob_verified、source_url。counts 分别列 original_topics、overlay_topics、mathematics_topics_reviewed、baseline_topics、original_dependencies、overlay_generated_dependencies、baseline_dependencies。licensing 中 source、notice、upstream_provenance_url 保留归属与兼容许可。

Git blob SHA-1 包含 Git blob 头的算法；SHA-256 为文件原始 bytes 摘要。不要用经过格式化的 JSON 与固定原始哈希直接比较。

## 11. math-checks.json 与 validation-results.json

math-checks 每项包含 topic_id、expression、expected、tolerance，可有 purpose。expression 是可重复计算的 Python 数值表达式字符串，expected 为有限数值，tolerance 为非负数值。验证器使用 AST 白名单，只允许数字、算术、列表/元组及指定 math 函数/常数；不会执行任意文件/网络/导入。复数检查用 complex 构造后取 abs 残差，输出仍为可比较有限实数。

validation-results 根字段：executed_at、research_as_of、python_version、checks、counts、errors、warnings、passed。errors/warnings 是字符串数组；passed 表示没有 error，不表示不存在报告中的教学缺口。counts 记录新增/补充/基线节点、依赖、映射、来源、标准、覆盖及计算数。

checks 包含 JSON/Schema、引用与语义不变量；baseline/supplement/combined hard DAG（acyclic、ordered_nodes、blocked_nodes、topological_order_sha256）；senior_foundation_paths（检查范围数量、存在 hard 路径或直接基础映射、无 hard/any 路径 ID 和解释）；numeric_examples（passed、check_count、distinct_topics、每项 topic_id/expression/actual/expected/passed、limitation）；coverage_matrix（行数和状态数）；可选 repository comparison（matching_snapshot、different_or_missing_files）。

运行脚本可重写结果文件，也可用 --output 写入另一个位置。计算检查覆盖显式算式，不是完整符号证明；可达性是必要的连通性核验，不是自动证明所有数学前置都穷尽。检查未来新仓库时应同时阅读 warnings。

## 12. 其他交付文件

research-report.md、README.md、validation-report.md 是人类可读说明，不是导入为 topic 的内容。SHA256SUMS.txt 每行由 64 位十六进制 SHA-256、两个空格、相对文件名组成；不包含它自身及外部 ZIP，避免循环摘要。ZIP 包含完整目录，不包含 scratch 作者中间稿或官方材料全文。
