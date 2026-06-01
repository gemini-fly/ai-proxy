/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';

const iconToneMap = {
  qwen: {
    background: '#eef2ff',
    color: '#3451d1',
  },
  doubao: {
    background: '#ecfeff',
    color: '#087f8c',
  },
};

function ProviderBadge({ label, tone = 'qwen' }) {
  const toneStyle = iconToneMap[tone] || iconToneMap.qwen;

  return (
    <span
      aria-hidden='true'
      style={{
        alignItems: 'center',
        background: toneStyle.background,
        borderRadius: '50%',
        color: toneStyle.color,
        display: 'inline-flex',
        fontSize: 12,
        fontWeight: 700,
        height: 26,
        justifyContent: 'center',
        lineHeight: 1,
        width: 26,
      }}
    >
      {label}
    </span>
  );
}

export const siteContent = {
  home: {
    badge: '阿里 / 豆包模型 · 随时可用',
    heroDescription:
      '一个 Key 接入阿里、豆包系主流大模型。兼容常见调用方式，企业可按员工分配用量，实时监控消费，开箱即用。',
    coverageFeature: {
      title: '国内模型聚焦',
      desc: '聚焦阿里通义、Qwen、豆包、火山方舟，覆盖国内高频 AI API 接入场景。',
    },
    apiFeature: {
      title: '统一兼容接口',
      desc: '无需改代码，更换 Base URL 即可切换国内主流模型，兼容常见 SDK 及工具链。',
    },
    modelSectionLabel: '阿里与豆包系主流大模型',
    modelRows: [
      [
        { icon: <ProviderBadge label='通' tone='qwen' />, name: '阿里通义' },
        { icon: <ProviderBadge label='千' tone='qwen' />, name: '通义千问' },
        { icon: <ProviderBadge label='Q' tone='qwen' />, name: 'Qwen Coder' },
        { icon: <ProviderBadge label='豆' tone='doubao' />, name: '字节豆包' },
        { icon: <ProviderBadge label='火' tone='doubao' />, name: '火山方舟' },
        { icon: <ProviderBadge label='视' tone='doubao' />, name: '豆包视频' },
      ],
    ],
    terminal: [
      { p: '$', t: 'curl https://api.shanview.cn/v1/chat/completions \\', c: '#8b949e' },
      { p: ' ', t: '  -H "Authorization: Bearer sk-sv........cn" \\', c: '#79c0ff' },
      { p: ' ', t: "  -d '{\"model\":\"qwen-plus\",\"messages\":[...]}'", c: '#8b949e' },
      { p: '>', t: 'HTTP/2 200  ok', c: '#06d6a0' },
      { p: ' ', t: '"content": "当然，让我来帮你解答..."', c: '#ffd166' },
      { p: '>', t: 'tokens: 1,243  cost: 0.0037  latency: 1.2s', c: '#3d444d' },
    ],
  },
  about: {
    intro:
      '专为开发者和企业团队打造的国内 AI 大模型统一接入平台，让每一次 AI 调用都简单、透明、可控。',
    coverageFeature: {
      title: '国内主流模型覆盖',
      desc: '面向国内业务场景，聚焦阿里通义、Qwen、豆包、火山方舟等高频模型能力。',
    },
    apiFeature: {
      title: '统一兼容接口',
      desc: '零代码改造，仅替换 Base URL，兼容常见 SDK、自动化框架和业务工具链。',
    },
  },
};
