# 澄清总结 - 所有 10 个问题的完整解决方案

本文档总结了初次阅读 implementation-plan.md 时发现的 10 个问题，以及如何在文档中完整解决的方案。

---

## ✅ 问题 1：RLS 策略具体要怎么设计？

**状态**: ✅ **完全澄清**

**解决方案**:
- **文档**: `design-decisions.md` 第 1 节（1.1 - 1.4）
- **SQL 参考**: `database-schema.md` 各表的 RLS 部分
- **总结**：
  - `profiles` 表：SELECT 公开（支持排行榜），UPDATE/DELETE 仅自己
  - `user_progress` 表：完全私有，仅本人可访问
  - `bookmarks` 表：同 user_progress，完全私有
  - `question_attempts` 表：同 user_progress，完全私有
  - `questions` 表：无 RLS（所有人可见）

**实施位置**：
- implementation-plan.md 步骤 1.6 - 已更新，引用 design-decisions.md 第 1.1 节
- implementation-plan.md 步骤 1.8 - 已更新，引用 design-decisions.md 第 1.2 节
- implementation-plan.md 步骤 1.8b - 已更新，引用 design-decisions.md 第 1.2 节

---

## ✅ 问题 2：答对题目要不要存进 user_progress？

**状态**: ✅ **完全澄清**

**解决方案**:
- **决策**：**是的，所有做过的题都要记录**，无论对错
- **文档**: `design-decisions.md` 第 2.1 节
- **理由**：便于统计、分析用户进度，避免统计困难
- **初始状态**：答对 → status = 'normal'，答错 → status = 'wrong_book'

**实施位置**：
- implementation-plan.md 步骤 1.8 - 已更新，包含重要设计决策说明
- implementation-plan.md 步骤 2.12 - 已详细说明答题逻辑

---

## ✅ 问题 3：同一题多次作答如何处理？

**状态**: ✅ **完全澄清**

**解决方案**:
- **设计**：双表设计
  - `question_attempts` - 历史表，每次作答都新增一条记录
  - `user_progress` - 汇总表，每题一条记录，存储最新状态
- **文档**: `design-decisions.md` 第 2.2 节
- **更新策略**：
  - 每次作答都插入 question_attempts 历史记录
  - 同时更新 user_progress 的汇总信息（attempt_count、last_attempt_at、is_correct 等）

**实施位置**：
- implementation-plan.md 步骤 1.8b - 新增 question_attempts 表创建步骤
- implementation-plan.md 步骤 2.12 - 详细说明双表更新流程（5 步 API 逻辑）
- database-schema.md - 完整的 SQL 定义和索引

---

## ✅ 问题 4：连续答对次数如何追踪？

**状态**: ✅ **完全澄清**

**解决方案**:
- **方案**：在 `user_progress` 表中添加 `consecutive_correct_count` 字段
- **文档**: `design-decisions.md` 第 2.3 节
- **规则**：
  - 答对 → `consecutive_correct_count += 1`
  - 答错 → `consecutive_correct_count = 0`
  - 达到 3 次 + status='wrong_book' → 自动变为 'mastered'
- **实现位置**：后端 API，不在前端计算

**实施位置**：
- implementation-plan.md 步骤 1.8 - 新增 `consecutive_correct_count` 字段
- implementation-plan.md 步骤 2.12 - 详细说明连续答对的追踪和状态变更逻辑
- database-schema.md - SQL 字段定义

---

## ✅ 问题 5：番茄钟与做题如何关联？

**状态**: ✅ **完全澄清**

**解决方案**:
- **定义**：`questions_completed` = 在番茄时间段内成功提交答案的题目数量
- **方案**：后端统计（Option B），而不是前端计数
- **文档**: `design-decisions.md` 第 3.1 - 3.2 节
- **关联**：
  - 每次做题时，question_attempts 记录 `pomodoro_session_id`
  - 番茄结束时，API 查询该 session 的所有 question_attempts，统计数量

**实施位置**：
- implementation-plan.md 步骤 1.8b - question_attempts 表添加 pomodoro_session_id 字段
- implementation-plan.md 步骤 1.9b - 新增 focus_sessions 表创建步骤
- implementation-plan.md 步骤 4.4 - 番茄记录 API 使用后端统计方案
- database-schema.md - 完整的表关联和查询示例

---

## ✅ 问题 6：每日统计中"今日"如何定义？

**状态**: ✅ **完全澄清**

**解决方案**:
- **时区**：日本时区（Asia/Tokyo）
- **定义**：当天 00:00:00 ～ 23:59:59（日本时间）
- **计算基准**：question_attempts 的 created_at 字段
- **文档**: `design-decisions.md` 第 4.1 - 4.2 节
- **SQL 示例**：使用 `AT TIME ZONE 'Asia/Tokyo'` 进行时区转换

**实施位置**：
- implementation-plan.md 步骤 4.5 - 已更新，包含时区说明和验证测试
- database-schema.md - 提供完整的 SQL 查询示例

---

## ✅ 问题 7：RLS 与 API 鉴权会不会重复？

**状态**: ✅ **完全澄清**

**解决方案**:
- **答案**：不是冗余，而是**互补的两层防护**
  - **应用层（API）**：友好的错误提示、业务逻辑检查、流程控制
  - **数据库层（RLS）**：最终安全底线，防止绕过、SQL 注入等
- **文档**: `design-decisions.md` 第 5.1 - 5.2 节
- **实践**：API 鉴权快速 fail，RLS 作为最后防线

**实施位置**：
- design-decisions.md 第 5 节有详细说明和代码示例
- implementation-plan.md 各个 API 步骤都遵循这个原则

---

## ✅ 问题 8：页面未登录时如何保护？

**状态**: ✅ **完全澄清**

**解决方案**:
- **首选**：Server-side 鉴权（在 page 或 layout Server Component 中检查 session）
- **流程**：无 session → 直接 redirect 到 /login
- **文档**: `design-decisions.md` 第 6.1 - 6.2 节
- **Client-side Hook**：作为 UI 辅助，不负责安全

**实施位置**：
- implementation-plan.md 步骤 2.9 - 仪表板基础页面，强调了保护逻辑
- design-decisions.md 第 6 节有详细的实现建议

---

## ✅ 问题 9：筛选题目列表用 Server 还是 Client？

**状态**: ✅ **完全澄清**

**解决方案**:
- **首次加载**：Server Component（更快首屏）
- **用户交互**（筛选、排序）：Client 组件 + API 调用
- **文档**: `design-decisions.md` 第 7.1 节
- **优势**：快速加载 + 顺滑体验

**实施位置**：
- design-decisions.md 第 7 节有完整的实现流程图和代码示例
- implementation-plan.md 步骤 2.10 - 题目浏览页面

---

## ✅ 问题 10：国际化范围与优先级？

**状态**: ✅ **完全澄清**

**解决方案**:
- **第一阶段**：
  - UI 文本双语（中文 + 日文），但无语言切换入口
  - 题目内容保留日文
  - 解析可中文优先，日文后补
- **文档**: `design-decisions.md` 第 8.1 - 8.2 节
- **长期**：可扩展支持语言切换

**实施位置**：
- implementation-plan.md 步骤 4.9 - i18n 实现
- design-decisions.md 第 8 节详细说明优先级

---

## 📊 所有澄清的落实情况

| 问题 | design-decisions.md | implementation-plan.md | database-schema.md | 状态 |
|------|-------------------|----------------------|-------------------|------|
| 1. RLS | 第 1 节 ✓ | 步骤 1.6, 1.8, 1.8b ✓ | 各表 RLS ✓ | ✅ |
| 2. 做题记录 | 第 2.1 节 ✓ | 步骤 1.8, 2.12 ✓ | 表定义 ✓ | ✅ |
| 3. 多次作答 | 第 2.2 节 ✓ | 步骤 1.8b, 2.12 ✓ | 双表 SQL ✓ | ✅ |
| 4. 连续答对 | 第 2.3 节 ✓ | 步骤 1.8, 2.12 ✓ | 字段定义 ✓ | ✅ |
| 5. 番茄关联 | 第 3.1-3.2 节 ✓ | 步骤 1.8b, 1.9b, 4.4 ✓ | 表关联 ✓ | ✅ |
| 6. 时区定义 | 第 4.1-4.2 节 ✓ | 步骤 4.5 ✓ | SQL 示例 ✓ | ✅ |
| 7. RLS + API | 第 5 节 ✓ | 所有 API 步骤 ✓ | - | ✅ |
| 8. 页面保护 | 第 6 节 ✓ | 步骤 2.9 ✓ | - | ✅ |
| 9. 筛选方案 | 第 7 节 ✓ | 步骤 2.10 ✓ | - | ✅ |
| 10. i18n | 第 8 节 ✓ | 步骤 4.9 ✓ | - | ✅ |

---

## 📚 文档体系现状总结

**总行数**：3,277 行 Markdown

**文档清单**：
1. **README.md** - 导航和使用指南（已更新）
2. **architecture.md** - 项目架构和文件结构说明
3. **design.md** - 产品需求文档
4. **tech-stack.md** - 技术选型方案
5. **design-decisions.md** ⭐ **新增** - 10 个关键设计决策的详细说明
6. **database-schema.md** ⭐ **新增** - 完整数据库 SQL 和查询示例
7. **implementation-plan.md** ✅ **已更新** - 新增表定义步骤，补充设计决策引用
8. **progress.md** - 进度跟踪 checklist

---

## 🎯 开发前的必读清单

**在开始开发前，务必按以下顺序阅读**：

- [ ] **第 1 天**：architecture.md + design.md（快速上手）
- [ ] **第 2 天**：design-decisions.md（理解关键决策）
- [ ] **第 3 天**：database-schema.md（掌握数据库设计）
- [ ] **第 4 天**：implementation-plan.md 阶段 1（开始编码）

**预计总学习时间**：约 3-4 小时

---

## 💡 后续建议

1. **创建 Supabase 初始化脚本**
   - 将 database-schema.md 中的 SQL 整合成一个 `init.sql` 文件
   - 放在项目根目录 `/database/migrations/` 下

2. **为 implementation-plan.md 添加"常见陷阱"部分**
   - 记录开发中可能遇到的问题和解决方案

3. **创建"开发检查清单"**
   - 每个功能完成后的验收要点

4. **定期更新 design-decisions.md**
   - 如果在开发中发现需要调整的决策，及时记录

---

## 🔍 澄清的关键成果

✅ **100% 明确的设计决策**
- RLS 策略：3 种不同的应对
- 数据表：从 5 张扩展到 7 张（含历史和会话表）
- 做题逻辑：清晰的双表双流程
- 时区：统一日本时区
- 番茄钟：后端统计方案
- 国际化：有明确的 MVP 范围

✅ **实施计划完全可执行**
- 47 个步骤都有明确的背景说明
- 每个涉及澄清的步骤都加了引用和说明
- 新增了 2 个表创建步骤（1.8b、1.9b）
- 新增了 2 个新的系统文档（design-decisions.md、database-schema.md）

✅ **文档体系完整**
- 从高层设计 → 中层决策 → 低层实现的完整链条
- 相互引用清晰，便于查阅和维护

---

## 📞 如有其他疑问

如果在开发过程中有新的疑问，建议：

1. 先在 design-decisions.md 中查找是否已解答
2. 在对应的 implementation-plan.md 步骤的"验证测试"中确认是否有遗漏
3. 查阅 database-schema.md 的 SQL 和业务查询示例
4. 更新 progress.md 中的问题记录，供后续参考

---
