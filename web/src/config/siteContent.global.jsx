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
import {
  OpenAI,
  XAI,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
} from '@lobehub/icons';

export const siteContent = {
  home: {
    badge: '阿里 / 豆包 / 海外主流模型 · 随时可用',
    heroDescription:
      '一个 Key 接入阿里、豆包系和海外主流大模型。无缝兼容 OpenAI SDK，企业可按员工分配用量，实时监控消费，开箱即用。',
    coverageFeature: {
      title: '国内外全覆盖',
      desc: '聚焦阿里通义、Qwen、豆包、火山方舟，以及 OpenAI、Claude、Gemini 等海外主流模型。',
    },
    apiFeature: {
      title: '统一 OpenAI 接口',
      desc: '无需改代码，更换 Base URL 即可切换任意模型，完全兼容 OpenAI SDK 及所有工具链。',
    },
    modelSectionLabel: '阿里、豆包系与海外主流大模型',
    modelRows: [
      [
        { icon: <OpenAI size={26} />, name: 'OpenAI' },
        { icon: <Claude.Color size={26} />, name: 'Claude' },
        { icon: <Gemini.Color size={26} />, name: 'Gemini' },
        { icon: <Grok size={26} />, name: 'Grok' },
        { icon: <AzureAI.Color size={26} />, name: 'Azure AI' },
        { icon: <Cohere.Color size={26} />, name: 'Cohere' },
        { icon: <Midjourney size={26} />, name: 'Midjourney' },
        { icon: <Suno size={26} />, name: 'Suno' },
        { icon: <XAI size={26} />, name: 'xAI' },
      ],
      [
        { icon: <Qwen.Color size={26} />, name: '阿里通义' },
        { icon: <Qwen.Color size={26} />, name: '通义千问' },
        { icon: <Qwen.Color size={26} />, name: 'Qwen Coder' },
        { icon: <Volcengine.Color size={26} />, name: '字节豆包' },
        { icon: <Volcengine.Color size={26} />, name: '火山方舟' },
        { icon: <Volcengine.Color size={26} />, name: '豆包视频' },
      ],
    ],
    terminal: [
      { p: '$', t: 'curl https://api.shanview.cn/v1/chat/completions \\', c: '#8b949e' },
      { p: ' ', t: '  -H "Authorization: Bearer sk-sv........cn" \\', c: '#79c0ff' },
      { p: ' ', t: "  -d '{\"model\":\"gpt-4o\",\"messages\":[...]}'", c: '#8b949e' },
      { p: '>', t: 'HTTP/2 200  ok', c: '#06d6a0' },
      { p: ' ', t: '"content": "当然，让我来帮你解答..."', c: '#ffd166' },
      { p: '>', t: 'tokens: 1,243  cost: $0.0037  latency: 1.2s', c: '#3d444d' },
    ],
  },
  about: {
    intro:
      '专为开发者和企业团队打造的国内外 AI 大模型统一接入平台，让每一次 AI 调用都简单、透明、可控。',
    coverageFeature: {
      title: '国内外主流模型覆盖',
      desc: '国内聚焦阿里通义、Qwen、豆包、火山方舟，海外覆盖 OpenAI、Claude、Gemini、Grok 等主流模型。',
    },
    apiFeature: {
      title: '统一 OpenAI 接口',
      desc: '零代码改造，仅替换 Base URL，兼容所有 OpenAI SDK、LangChain、AutoGen 等工具链。',
    },
  },
};
