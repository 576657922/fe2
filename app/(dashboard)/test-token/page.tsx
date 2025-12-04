"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestTokenPage() {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [curlCommand, setCurlCommand] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [sqlScript, setSqlScript] = useState<string>("");

  useEffect(() => {
    async function getToken() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("获取会话失败:", error);
        setLoading(false);
        return;
      }

      if (session?.access_token) {
        setToken(session.access_token);
        const uid = session.user.id;
        setUserId(uid);
        setCurlCommand(
          `curl -X GET http://localhost:3000/api/wrong-questions -H "authorization: Bearer ${session.access_token}"`
        );

        // 生成 SQL 插入脚本
        const sql = `-- 步骤 1: 查看可用的题目 ID
SELECT id, year, category, question_number, content
FROM questions
LIMIT 10;

-- 步骤 2: 复制上面查询结果中的 3 个题目 ID，替换下面的 'question_id_1' 等

-- 步骤 3: 执行插入语句创建错题记录
INSERT INTO user_progress (
  user_id,
  question_id,
  user_answer,
  is_correct,
  attempt_count,
  consecutive_correct_count,
  status,
  last_attempt_at,
  created_at
) VALUES
(
  '${uid}',
  'question_id_1',  -- 替换为实际的题目 ID
  'A',
  false,
  2,
  0,
  'wrong_book',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '2 days'
),
(
  '${uid}',
  'question_id_2',  -- 替换为实际的题目 ID
  'C',
  false,
  1,
  0,
  'wrong_book',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 day'
),
(
  '${uid}',
  'question_id_3',  -- 替换为实际的题目 ID
  'B',
  false,
  3,
  0,
  'wrong_book',
  NOW() - INTERVAL '10 minutes',
  NOW()
);

-- 步骤 4: 验证插入成功
SELECT COUNT(*) as wrong_count
FROM user_progress
WHERE user_id = '${uid}' AND status = 'wrong_book';`;

        setSqlScript(sql);
      }
      setLoading(false);
    }

    getToken();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已复制到剪贴板！");
  };

  if (loading) {
    return (
      <div className="p-8">
        <p>正在获取 Token...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            ❌ 未找到有效会话
          </h2>
          <p className="text-red-600">请先登录账户</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔑 API 测试工具</h1>

      {/* 用户 ID */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          当前用户 ID:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={userId}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(userId)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            📋 复制
          </button>
        </div>
      </div>

      {/* Token 显示 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bearer Token:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={token}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(token)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            📋 复制
          </button>
        </div>
      </div>

      {/* cURL 命令 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          cURL 测试命令:
        </label>
        <div className="relative">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
            {curlCommand}
          </pre>
          <button
            onClick={() => copyToClipboard(curlCommand)}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
          >
            📋 复制
          </button>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="mb-6">
        <button
          onClick={async () => {
            try {
              const response = await fetch("/api/wrong-questions", {
                headers: {
                  authorization: `Bearer ${token}`,
                },
              });
              const result = await response.json();
              console.log("API 响应:", result);

              if (result.count === 0) {
                alert(
                  `✅ API 调用成功！\n\n❗ 错题数量: 0\n\n您还没有错题记录。\n请先做题并答错，或使用下方的 SQL 脚本插入测试数据。\n\n详情请查看浏览器控制台`
                );
              } else {
                alert(
                  `✅ API 调用成功！\n\n错题数量: ${result.count}\n\n详情请查看浏览器控制台`
                );
              }
            } catch (error) {
              console.error("API 调用失败:", error);
              alert("❌ API 调用失败，详情请查看浏览器控制台");
            }
          }}
          className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
        >
          🧪 测试 /api/wrong-questions
        </button>
      </div>

      {/* SQL 脚本 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📊 SQL 测试数据插入脚本（Supabase SQL Editor）:
        </label>
        <div className="relative">
          <pre className="bg-gray-900 text-cyan-400 p-4 rounded-md overflow-x-auto text-xs max-h-96">
            {sqlScript}
          </pre>
          <button
            onClick={() => copyToClipboard(sqlScript)}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
          >
            📋 复制 SQL
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-blue-800 mb-2">📝 测试步骤</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>
            <strong>方式 A（真实测试）</strong>：访问 /dashboard/questions，做题并故意答错 3-5 次
          </li>
          <li>
            <strong>方式 B（快速测试）</strong>：
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>复制上方的 SQL 脚本</li>
              <li>访问 Supabase Dashboard → SQL Editor</li>
              <li>粘贴脚本，先执行步骤 1 查看题目 ID</li>
              <li>将 question_id_1/2/3 替换为真实的题目 ID</li>
              <li>执行插入语句（步骤 3）</li>
              <li>执行验证查询（步骤 4）</li>
            </ul>
          </li>
          <li>点击上方"🧪 测试 API"按钮，验证返回数据</li>
        </ol>
      </div>

      {/* Token 信息 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">ℹ️ Token 信息</h3>
        <p className="text-sm text-gray-600">
          Token 长度: {token.length} 字符
        </p>
        <p className="text-sm text-gray-600">
          有效期: 约 1 小时（自动刷新）
        </p>
      </div>
    </div>
  );
}
