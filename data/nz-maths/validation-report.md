# 验证报告

研究快照：2026-10-18。实际机器验证时间：**2026-10-18T04:04:48.442824+00:00**；Python：**3.12.14**。结果：**passed，0 errors，0 warnings**。

## 1. 实际运行及可复现范围

交付前实际运行：

```bash
python3 nz-maths-supplement/validate.py --repo repo-reference
```

验证对象是已读取的固定仓库快照与最终独立补充包，不是空造基线或只检查分包。参考 commit 为 `8daa98f84e3cc18de29e6033083a561a512987f3`。本报告由实际 `validation-results.json` 生成，不将未运行项目写成通过。

解压后可在包目录使用 `python3 validate.py`，也可加 `--repo` 比对实际 checkout。`--output /tmp/nz-maths-validation.json` 可避免覆盖本次交付结果。代码只读取目标仓库；本包未进行生产站点或 MCP 部署。

## 2. 已执行检查

| 检查 | 结果 | 实际依据 |
| --- | --- | --- |
| JSON 与字段合同 | 通过 | 完整解析；重复对象 key/非有限数字拒绝；必需字段、类型、枚举、日期、至少两级提示等 |
| topic/source/mapping/standard/framework ID | 通过 | 所有 ID 唯一；新 ID 不与基线重名；补充档案均指向既有真实 ID；引用存在 |
| 派生索引与标准一致 | 通过 | curriculum_mapping_ids、standard_ids 与独立表一致；title/version/qualification level 与标准 registry 一致 |
| 重复边与自依赖 | 通过 | 812 个不同有向端点对，无自边；既有同端点对按 merge-plan 记录更新 |
| 基线 hard DAG | 通过 | 1,606 个全学科基线节点全部完成拓扑排序 |
| 补充 hard DAG | 通过 | 1,870 个有效节点上的补充 hard 边无环 |
| 完整合并 hard DAG | 通过 | 3,253 既有边按端点对应用 812 条补充后为 4,004 对；1,870 节点全部排序 |
| 高级内容基础连接 | 通过 | 265/265 senior 完整档案存在 hard 路径到当前 Years 0–10，或自身已有当前基础映射 |
| 课程、资格与日期 | 通过 | current 不使用未来生效日；当前 Years 0–10 为 2026-01-01；NZC 与 NCEA level 字段分离 |
| 当前 AS 目录与考试边界 | 通过 | 4 + 14 + 15 = 33 项；11 项 external AS 目录；AS91584 为 external；Probability 没有映射到 AS91947 |
| 覆盖矩阵 | 通过 | 534 行的 topic_count、topic/source/framework 引用一致；Year 11、12、13 各有独立行 |
| 数学数值 | 通过 | 300 项确定性计算涉及 232 个不同知识点，全部在指定容差内 |
| 固定仓库六文件 | 通过 | 实际参考文件 SHA-256 全部匹配；研究取得时六份 Git blob SHA-1 又在 pinned commit 确认 |

Schema 验证器只使用 Python 标准库，实现本包 Schema 所使用的全部关键字；它不是任意 JSON Schema 的通用验证库。JSON Schema 文档仍按 Draft 2020–12 编写，可由开发者用完整实现独立检查。

## 3. 实际数据数量

| 项目 | 数量 |
| --- | ---: |
| 新 ID 候选 | 264 |
| 其中可按 add_new 新增 / 待身份决定 | 263 / 1 |
| 既有 ID 完整教学扩充 | 152 |
| 既有 ID 仅补映射 | 73 |
| 复用既有 ID 合计 | 225 |
| 完整教学档案 / 原创诊断 | 416 / 454 |
| 补充边 hard / helpful | 698 / 114 |
| 补充边合计 | 812 |
| 其中既有端点对更新 / 新端点对 | 61 / 751 |
| 课程/评估映射 / 被映射不同 ID | 1,287 / 489 |
| source_id / 不同精确 URL | 89 / 81 |
| achievement standards / unit standards | 33 / 2 |
| framework/policy 实体 | 10 |
| 覆盖行 covered / partial / not_applicable | 525 / 3 / 6 |
| 数值检查 / 涉及不同 topic | 300 / 232 |

数量不是完全覆盖的充分证据。各审计层、年级范围、标准和同义审查会重复引用同一节点，不能将它们的行数直接相加为独立内容数量。

## 4. 拓扑验证与已修正问题

完整合并图 hard 拓扑顺序的 SHA-256 为：

`9c13b8b7f8a8739f201d07ef0f8dd8ce2a906d60593ed23d0001904ab4ba2465`

Kahn 算法对 hard 子图进行排序，blocked_nodes 为空。基线含其他学科，仍完整计入引用和无环检查；没有为了让新增数学图通过而丢弃旧边。

整合曾发现三组 foundation 建议方向与实际上游 hard 方向相反：scatter 构造/预测、relative frequency/long-run behaviour、mirror symmetry/grid transformations。对反向建议按具体目标修为 helpful，并保留旧方向及 rationale 到 `existing_dependency_direction_reviews`。没有仅因检测到环就随机删除边。

坐标距离、单位平方/立方转换、复合增长公式的等价草稿已重定向，产生的身份自边消除。无平方/立方单位的重复新 ID；没有伪造上游不存在的 ID。

补充了加法到网络权重累积、乘法到排列计数、除法到组合/重复排列、函数复合到链式法则等具体基础连接；把不严格必要的广泛实践/某条几何应用降为 helpful。当前所有 265 senior 档案有 hard 路径或直接 current foundation 映射。该检查证明有合理基础入口，但不自动证明每个目标的全部先修集合已经穷尽。

## 5. 去重和内容审阅

完整数学描述索引含 512 个已核实既有记录。去重结合概念、方法、表示和诊断目标；名称相似度只是候选筛查。九个名称相似对已读上下文并说明为什么保留不同；正态已知参数求 cutoff 与恢复未知参数的重叠已通过收紧 cutoff 档案范围解决。

仍有十组 review、24 个不同 ID，其中仅 `nzm_graphical_equation_solutions` 是本包新 ID 候选。其余是既有图谱的概率刻度/补事件、四象限、分数等值、角和、变换、比、scatter 和 quadratic graph 等整理事项。merge-plan 保留具体理由及既有候选；不宣称全部同义项已自动裁决。

高中数学与统计作者互相独立审阅了关键方法：复数根、SSA、LP、网络、微积分定义域/端点/拐点、参数二阶导数、置信区间、bootstrap、randomisation、分布与计数。实施的修正包括 FTC 区间条件、复数 locus 退化情形、非零系数、关键路径反推、整数规划可行解搜索、CLT 非零有限方差、互斥空交集、percentile bootstrap 术语和 sharp null。

所有这些是研究审阅和显式算式校验，没有把它描述为外部学校教师审查、正式 NZQA moderation 或真实学生测试。

## 6. 数学检查能证明什么

300 个表达式实际运行，实际值与 expected/tolerance 逐项保留在 JSON 结果中。复数以代入多项式后的绝对残差等形式检查；概率正态计算使用标准库函数；没有依赖不可见的 Excel 结果或未安装的符号系统。

检查内容覆盖基础运算、数值范围修订、比例/利率、测量、坐标/三角、微积分算式和应用、概率/分布/统计计算。它不穷尽 454 个诊断的所有定性理由、不证明任意表达式恒等、不验证所有真实情境的统计模型假设，也不自动认证某一道短题的年级/评分等级效度。诊断的 applicability 和映射 notes 必须一起读。

## 7. 政策与来源核对的实际边界

当前低年级课程与仍适用的 senior Levels 6–8 已分开；已发布的 Phase 5 规划日期和新资格未来政策只作框架记录。未将 planned review date 当作 last assessment，未把版权年或 PDF 文件夹年份等同生效日。NCEA qualification level 与学校年级分离，US32406 的 Level 1 与 Year 8/9 benchmark 关系明确记录。

官方材料中的可疑文字没有直接复制：junior glossary 的 √4/相对频率错误、垂直梯度用词、统计教学例子的算术矛盾均按数学结构核对。AS91579 的 2026 specification 学分 5 与标准/目录 6 冲突，本包省略 credits 并保留异常。AS91584 在 2026 Statistics specification 为 external，最终标准 registry 已按此校正并进入外部标准集合检查。

来源共 89 个记录、81 个精确 URL。部分引用是同一文件不同定位，不能写成 89 份独立文件。sources 包含每条 title、publisher、URL、accessed_on、阅读证据和 locator；未知 published_on 用 null，没有从网页动态日期伪造出版日。

## 8. 未解决问题与没有执行的工作

| 项目 | 具体状态 |
| --- | --- |
| f_req_0077 / Year 6 Measurement | 太阳历/阴历、maramataka Māori/Chinese calendar 的独立比较研究与活动缺失；公历日期算术已补，父行 partial |
| r_req_l6_circle_geometry | 官方 broad objective 不给唯一圆定理枚举；所选微技能是 medium editorial alignment，保留 partial |
| req_component_0269 / AS91946 | 子技能已映射，但完整媒体任务与跨内容 A/M/E 证据校准未穷尽，保留 partial |
| 每条官方 bullet 与教学模态 | 130 行/273 基础内容组及其他 senior 审计不是原表逐 bullet 同构；不宣称严格 100% 覆盖 |
| NZQA 受阻页 | 若干 www2 clarification/exemplar 页返回 403；未把未读页当作已读。未阅读全部历年试卷和完整样例 |
| 未来 Phase 5 全文 | 已读 HTML 状态/拟实施日期；嵌入 PDF 未完整读取，无未来微技能覆盖声明 |
| Scholarship 与其他资格 | 未完成独立全量 NZ Scholarship、Cambridge、IB、职业 unit standard 目录/内容映射 |
| 大型真实活动 | 未制作整套真实统计数据调查、软件操作任务或完整试卷集；短活动用于局部诊断 |
| 外部实测与 moderation | 未进行课堂/学生实测、语音发音评价或外部教师评分校准 |
| 生产系统 | 未运行公开站点/MCP 端到端测试、未修改生产仓库或部署；需开发者完成适配后按仓库门禁验证 |
| 未来目标仓库 | 固定 commit 之后的更改不在本次已验证范围；--repo 出现 warning 后需重新核对真实 ID 与语义 |

## 9. 导入后应执行的检查

这些是开发者应用实际改动后需要运行的步骤，**本次没有冒充已经执行**：

1. 在目标 checkout 应用独立 schema adapter 和确认后的 ID/依赖变更，保留原 provenance 与非 NZ 元数据。
2. 若人工合并新候选到既有 ID，统一重定向所有引用与派生缓存，再在真实完整图重跑无环、引用及语义去重。
3. 根据旧服务对 soft 的真实语义决定 legacy_soft 适配，不将本包 helpful 强制转成 hard。
4. 运行仓库自身构建与既有验证门禁，测试 getTopic、searchTopics、prerequisites 和 learningPath 是否返回正确 scope、状态、来源、答案/提示及前置理由。
5. 为低年级局部映射选择合适题目，人工复核未校准的真实情境和三项 partial，按来源日期维护后续课程变化。

结构完整、hard DAG 和数值通过是可以复现的工程结论；目录覆盖、课堂教学完整性和官方评估效度是不同结论。研究报告、覆盖矩阵和本报告共同保留了这些界限。
