# New Zealand Year 0–13 Mathematics Graph Supplement

研究日：**2026-10-18**。教学内容为英文；研究和工程说明为中文。该包用于扩充 `maxazure/nz-learning-graph` 的知识内容和 MCP 查询，未修改网站或生产仓库。

## 先看什么

先阅读 `research-report.md` 的版本、覆盖边界和高中结论，再按 `merge-plan.json` 决定导入。`schema.md` 解释数据合同；`validation-report.md` 区分实际执行与尚未完成的检查。不要将本包 JSON 直接覆盖上游同名文件。

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

## 实际课程范围

- 当前 Years 0–10：2025 Mathematics and Statistics curriculum statement，自 2026-01-01 实施，Phases 1–4 六领域；Phase 1 保留实际 schooling-duration 列。
- 当前 senior：保留适用的 NZC Levels 6–8；当前 4 项 Level 1、14 项 Level 2、15 项 Level 3 school achievement standards，以及相应已读 2026 specifications。
- 另有 US32406 numeracy co-requisite 和 US5236 workplace mathematics 的限定组成技能映射，不是两项标准的完整课程/评估包。
- Phase 5 未来规划和新资格政策只作独立状态登记；不混入 current mappings。Cambridge、IB、Scholarship 未形成独立完整数据包。

依据见 `sources.json` 和 `curriculum-frameworks.json`。NCEA level、NZC level、school year 是三个字段。通常 Year 11/12/13 不是固定对应；不使用 school year + 5 推导年龄。

## 文件清单

| 文件 | 用途 |
| --- | --- |
| README.md | 入口、数量和导入步骤 |
| research-report.md | 中文实质研究、版本判断、高中组件和具体缺口 |
| topics.json | 264 个新 ID 候选的完整英文教学档案 |
| topic-enrichments.json | 152 个真实既有 ID 的完整教学补充 |
| dependencies.json | 812 条逐条有理由及证据属性的 directed dependencies |
| curriculum-mappings.json | 1,287 条独立课程/评估映射 |
| curriculum-frameworks.json | 10 个当前、已替代、拟议或未来政策实体 |
| standards.json | 33 AS + 2 US 的独立实体与 topic 索引 |
| sources.json | 89 条实际阅读来源记录、81 个不同精确 URL |
| curriculum-requirements.json | 534 行覆盖需求和来源组件审计 |
| coverage-matrix.csv | 同一审计的可筛选平面视图；Year 11/12/13 单列 |
| merge-plan.json | 复用、新增、十组身份复核、依赖 metadata 与方向审查 |
| schema.json | Draft 2020–12 JSON Schema；x-file-schemas 选择文件定义 |
| schema.md | 所有文件及字段的人类可读约定、枚举和引用规则 |
| validate.py | Python 3.10+ 标准库验证器，不需联网 |
| math-checks.json | 300 项可重复算式与预期值/容差 |
| validation-results.json | 实际执行的机器结果、counts、拓扑哈希及计算明细 |
| validation-report.md | 已执行检查、修正、证据限制及导入后的检查责任 |
| baseline-index.json | 固定上游 1,606 个节点的引用索引；仅供验证 |
| baseline-dependencies.json | 固定上游 3,253 条归一化依赖；仅供验证 |
| repository-snapshot.json | 六份已读文件的 commit、URL、SHA-256/Git blob SHA-1 及归属 |
| SHA256SUMS.txt | 包内其余交付文件的 SHA-256 校验清单 |

ZIP 名称为 `nz-maths-year0-13-supplement-2026-10-18.zip`，内部以 `nz-maths-supplement/` 为根目录，包含上述全部文件。数学题均为自写诊断；没有打包官方试卷全文或整份标准 PDF。

## 本地验证

需要 Python 3.10 或更新版本，只使用标准库。解压后在包目录运行：

```bash
python3 validate.py
```

另比对目标仓库是否仍与本次研究快照一致：

```bash
python3 validate.py --repo /path/to/nz-learning-graph
```

验证器默认把本次结果写入包内 `validation-results.json`；若要保留交付时的结果和 SHA256SUMS，请指定另一输出位置：

```bash
python3 validate.py --repo /path/to/nz-learning-graph --output /tmp/nz-maths-validation.json
```

默认退出码 0 表示结构/数学检查没有 error；1 表示失败。仓库哈希不一致是 warning，需要复核新 commit 的语义差异。通过不等于生产服务已经集成，也不等于全部教学或 assessment 被外部 moderation。`sha256sum -c SHA256SUMS.txt` 可核对传输完整性；重跑后覆盖了结果文件，旧清单自然不再匹配该文件。

## 安全而具体的合并顺序

1. 锁定目标基线。已研究 commit 是 `8daa98f84e3cc18de29e6033083a561a512987f3`；六份实际文件的摘要在 snapshot 中。
2. 读取独立 sources、frameworks、standards 和 schema。先建立引用索引，不把标准建为 topic。
3. 复用 225 个已核实 ID：152 个应用完整教学补充；73 个只添加 mappings。保留原始 provenance、其他国家 standards 和 age 元数据。
4. 解决 `nzm_graphical_equation_solutions` 的身份选择。其余 263 个候选按 add_new 建立；如需重定向，所有边、映射、需求、计算检查和缓存必须一起更新。
5. 合并依赖端点对：751 个新端点对，61 个既有端点对更新 metadata/strength；三组旧方向问题单独保留审查记录。hard/helpful 及 inference 元数据不得丢失。
6. 上游 soft 保留为 legacy_soft 供适配器解释。避免旧 overlay 逻辑把全部 prerequisiteIds 强制转为 hard。
7. 同步 profile 的 `standard_ids` 与 `curriculum_mapping_ids` 缓存，再跑完整图 DAG、引用和映射范围检查。
8. 接入 search/getTopic/prerequisites/learningPath 时返回 scope、status、source locators 和 progressive hints；按当前映射选择诊断，避免把局部映射当成完整 topic mastery。

`baseline-index.json` 与 `baseline-dependencies.json` 是验证引用，不是额外待导入的数据；重复追加会污染计数和 ID。`merge-plan.json` 的十组身份审查包含 24 个不同 ID，但并非 24 个新增节点；其中只有一个是本包的新 ID 候选，其余是既有图谱的整理事项。

## 覆盖状态怎么解释

534 行分别检查教学序列分组、senior objectives、assessment components、诊断技能与标准目录。各层有重叠；不能把 525/534 宣称为国家课程完成率。完整数据有 3 个 partial 父行，其中 Year 6 历法比较含 gap 组件；另有 6 个源表空栏为 not_applicable。

具体尚需工作：Year 6 太阳历/阴历、maramataka Māori/Chinese calendar 比较；AS91946 全套综合媒体任务和 grade-boundary 校准；Level 6 圆几何定理清单的解释性映射；未来 Phase 5 全文；Scholarship/Cambridge/IB 与完整职业路径；每个官方 bullet、表示和题型的进一步逐项复核。部分 NZQA clarification/exemplar 页读取受阻。报告完整列出这些边界，没有用未实现占位记录宣称覆盖。

## 许可与归属

基线摘录保留上游 Marble-derived ODbL 1.0 数据库、CC BY-SA 4.0 内容和 PROVENANCE 归属；本包原创教学文字以 CC BY-SA 4.0、数据库补充以 ODbL 1.0 提供以保持兼容。官方来源保留各自权利。具体归属 URL 见 `repository-snapshot.json`，报告来源索引提供准确官方链接。
