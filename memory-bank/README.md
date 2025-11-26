# Memory Bank - 项目知识库

这个文件夹包含了 FE 刷题平台项目的所有核心规划和设计文档。新的开发者或 Claude Code 实例应该从这里开始了解项目。

## 文件导览

### 📋 按阅读顺序（推荐）

1. **architecture.md** ← 从这里开始
   - 快速了解项目整体结构
   - 理解数据库设计
   - 了解关键的数据流
   - 约 30 分钟阅读

2. **design.md**
   - 理解产品需求和功能设计
   - 了解 MVP 范围和优先级
   - 约 20 分钟阅读

3. **tech-stack.md**
   - 了解技术选型的理由
   - 参考具体的实现策略
   - 约 20 分钟阅读

4. **design-decisions.md** ⭐ **新增 - 最重要的澄清**
   - 10 个关键设计决策的详细说明
   - RLS 策略、做题记录、番茄钟数据模型、时区定义等
   - **开发前必读**
   - 约 45 分钟阅读

5. **database-schema.md** ⭐ **新增 - 完整数据库定义**
   - 所有表的完整 SQL 语句
   - 包含索引和 RLS 策略
   - 业务查询示例
   - 作为 implementation-plan 的补充参考

6. **implementation-plan.md**
   - 开发时的详细指南
   - 逐步执行的步骤清单（47 步）
   - 每步包含验证测试
   - **已补充 design-decisions.md 的引用**
   - 约 40 分钟通读，开发时重复查阅

7. **progress.md**
   - 跟踪项目进度
   - 标记已完成的步骤
   - 实时更新

---

## 快速导航

### "我想快速了解这个项目"
→ 阅读 `architecture.md` 的"项目结构说明"和"数据库表设计说明"部分

### "某个关键设计决策是什么（如 RLS、时区、做题记录）"
→ 查看 `design-decisions.md` 的对应章节
- RLS 策略 → 第 1 节
- 做题记录设计 → 第 2 节
- 番茄钟数据模型 → 第 3 节
- 时区定义 → 第 4 节

### "我要开始开发了，不知道从哪里开始"
→ **先读 `design-decisions.md`**，然后按顺序查看 `implementation-plan.md` 的"阶段 1"步骤

### "我需要数据库的完整 SQL"
→ 查看 `database-schema.md`，包含所有表定义、索引、RLS 策略和业务查询示例

### "某个功能怎么实现"
→ 在 `implementation-plan.md` 中搜索功能名称，找到对应步骤，并参考 `design-decisions.md` 了解相关决策

### "我需要理解某个文件的用途"
→ 查看 `architecture.md` 的"前端项目结构说明"部分

### "我忘记了某张表的结构或字段"
→ 查看 `database-schema.md` 中的表定义，或 `architecture.md` 的"数据库表设计说明"

### "项目现在进度如何"
→ 查看 `progress.md`，看哪些 checkbox 已勾选

### "为什么选择这个技术"
→ 查看 `tech-stack.md` 的"详细选型说明"部分

---

## 使用提示

1. **标记进度**：在 `progress.md` 中完成每个步骤后，标记对应的 checkbox 为 ✓

2. **记录阻碍**：如果遇到问题，在 `progress.md` 中对应步骤下方添加备注

3. **更新文档**：如果设计或实现出现变化，及时更新对应的文档

4. **保持同步**：确保这 5 个文件始终代表最新的项目状态

---

## 文档更新历史

- **2024-11-24**：初始创建，包含完整的 MVP 设计和实施计划

---

## 如何添加新功能（超出 MVP）

如果要添加 MVP 之外的新功能：

1. 在 `design.md` 中添加功能描述
2. 在 `tech-stack.md` 中更新相关的数据库 schema 或技术方案
3. 在 `implementation-plan.md` 中添加实施步骤
4. 在 `architecture.md` 中更新相关的结构说明
5. 在 `progress.md` 中添加新的 checklist 项

---

## 关键链接

- **Supabase 官方文档**：https://supabase.com/docs
- **Next.js 官方文档**：https://nextjs.org/docs
- **Tailwind CSS 文档**：https://tailwindcss.com/docs
- **Zustand GitHub**：https://github.com/pmndrs/zustand

---
