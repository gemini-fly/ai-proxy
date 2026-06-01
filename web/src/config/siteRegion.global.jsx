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
import { Avatar } from '@douyinfe/semi-ui';
import * as LobeIcons from '@lobehub/icons';
import {
  OpenAI,
  Claude,
  Gemini,
  Moonshot,
  Zhipu,
  Qwen,
  DeepSeek,
  Minimax,
  Wenxin,
  Spark,
  Midjourney,
  Hunyuan,
  Cohere,
  Cloudflare,
  Ai360,
  Yi,
  Jina,
  Mistral,
  XAI,
  Ollama,
  Doubao,
  Suno,
  Xinference,
  OpenRouter,
  Dify,
  Coze,
  SiliconCloud,
  FastGPT,
  Kling,
  Jimeng,
  Perplexity,
  Replicate,
} from '@lobehub/icons';

export const siteRegion = 'global';
export const isGlobalSite = true;
export const enforcedBranding = {
  enabled: false,
  systemName: '闪域',
  logo: '/logo.png',
  footerHTML: undefined,
};
export const allowCustomMarketingContent = true;

export const isConsoleModuleEnabled = () => true;
export const isHeaderNavModuleEnabled = () => true;

export const CHANNEL_OPTIONS = [
  { value: 1, color: 'green', label: 'OpenAI' },
  { value: 2, color: 'light-blue', label: 'Midjourney Proxy' },
  { value: 5, color: 'blue', label: 'Midjourney Proxy Plus' },
  { value: 36, color: 'purple', label: 'Suno API' },
  { value: 4, color: 'grey', label: 'Ollama' },
  { value: 14, color: 'indigo', label: 'Anthropic Claude' },
  { value: 33, color: 'indigo', label: 'AWS Claude' },
  { value: 41, color: 'blue', label: 'Vertex AI' },
  { value: 3, color: 'teal', label: 'Azure OpenAI' },
  { value: 34, color: 'purple', label: 'Cohere' },
  { value: 39, color: 'grey', label: 'Cloudflare' },
  { value: 43, color: 'blue', label: 'DeepSeek' },
  { value: 15, color: 'blue', label: '百度文心千帆' },
  { value: 46, color: 'blue', label: '百度文心千帆V2' },
  { value: 17, color: 'orange', label: '阿里通义千问' },
  { value: 18, color: 'blue', label: '讯飞星火认知' },
  { value: 16, color: 'violet', label: '智谱 ChatGLM（已经弃用，请使用智谱 GLM-4V）' },
  { value: 26, color: 'purple', label: '智谱 GLM-4V' },
  { value: 27, color: 'blue', label: 'Perplexity' },
  { value: 24, color: 'orange', label: 'Google Gemini' },
  { value: 11, color: 'orange', label: 'Google PaLM2' },
  { value: 47, color: 'blue', label: 'Xinference' },
  { value: 25, color: 'green', label: 'Moonshot' },
  { value: 20, color: 'green', label: 'OpenRouter' },
  { value: 19, color: 'blue', label: '360 智脑' },
  { value: 23, color: 'teal', label: '腾讯混元' },
  { value: 31, color: 'green', label: '零一万物' },
  { value: 35, color: 'green', label: 'MiniMax' },
  { value: 37, color: 'teal', label: 'Dify' },
  { value: 38, color: 'blue', label: 'Jina' },
  { value: 40, color: 'purple', label: 'SiliconCloud' },
  { value: 42, color: 'blue', label: 'Mistral AI' },
  { value: 8, color: 'pink', label: '自定义渠道' },
  { value: 22, color: 'blue', label: '知识库：FastGPT' },
  { value: 21, color: 'purple', label: '知识库：AI Proxy' },
  { value: 44, color: 'purple', label: '嵌入模型：MokaAI M3E' },
  { value: 45, color: 'blue', label: '字节火山方舟、豆包通用' },
  { value: 48, color: 'blue', label: 'xAI' },
  { value: 49, color: 'blue', label: 'Coze' },
  { value: 50, color: 'green', label: '可灵' },
  { value: 51, color: 'blue', label: '即梦' },
  { value: 52, color: 'purple', label: 'Vidu' },
  { value: 53, color: 'blue', label: 'SubModel' },
  { value: 54, color: 'blue', label: '豆包视频' },
  { value: 55, color: 'green', label: 'Sora' },
  { value: 56, color: 'blue', label: 'Replicate' },
  { value: 57, color: 'blue', label: 'Codex (OpenAI OAuth)' },
];

export const filterRegionModels = (models = []) => models || [];
export const filterRegionChats = (chats = []) => chats || [];
export const isRegionModelName = () => true;

export const getModelCategories = (() => {
  let categoriesCache = null;
  let lastLocale = null;

  return (t) => {
    const currentLocale = globalThis.localStorage?.getItem('i18nextLng') || 'zh';
    if (categoriesCache && lastLocale === currentLocale) {
      return categoriesCache;
    }

    categoriesCache = {
      all: { label: t('全部模型'), icon: null, filter: () => true },
      openai: {
        label: 'OpenAI',
        icon: <OpenAI />,
        filter: (model) =>
          /gpt|dall-e|whisper|tts-1|text-embedding-3|text-moderation|babbage|davinci|curie|ada|o1|o3|o4/i.test(
            model.model_name,
          ),
      },
      anthropic: {
        label: 'Anthropic',
        icon: <Claude.Color />,
        filter: (model) => /claude/i.test(model.model_name),
      },
      gemini: {
        label: 'Gemini',
        icon: <Gemini.Color />,
        filter: (model) =>
          /gemini|gemma|learnlm|^embedding-|text-embedding-004|imagen-4|veo-|aqa/i.test(
            model.model_name,
          ),
      },
      moonshot: {
        label: 'Moonshot',
        icon: <Moonshot />,
        filter: (model) => /moonshot|kimi/i.test(model.model_name),
      },
      zhipu: {
        label: t('智谱'),
        icon: <Zhipu.Color />,
        filter: (model) => /chatglm|glm-|cogview|cogvideo/i.test(model.model_name),
      },
      qwen: {
        label: t('通义千问'),
        icon: <Qwen.Color />,
        filter: (model) => /qwen/i.test(model.model_name),
      },
      deepseek: {
        label: 'DeepSeek',
        icon: <DeepSeek.Color />,
        filter: (model) => /deepseek/i.test(model.model_name),
      },
      minimax: {
        label: 'MiniMax',
        icon: <Minimax.Color />,
        filter: (model) => /abab|minimax/i.test(model.model_name),
      },
      baidu: {
        label: t('文心一言'),
        icon: <Wenxin.Color />,
        filter: (model) => /ernie/i.test(model.model_name),
      },
      xunfei: {
        label: t('讯飞星火'),
        icon: <Spark.Color />,
        filter: (model) => /spark/i.test(model.model_name),
      },
      midjourney: {
        label: 'Midjourney',
        icon: <Midjourney />,
        filter: (model) => /mj_/i.test(model.model_name),
      },
      tencent: {
        label: t('腾讯混元'),
        icon: <Hunyuan.Color />,
        filter: (model) => /hunyuan/i.test(model.model_name),
      },
      cohere: {
        label: 'Cohere',
        icon: <Cohere.Color />,
        filter: (model) => /command|c4ai-|embed-/i.test(model.model_name),
      },
      cloudflare: {
        label: 'Cloudflare',
        icon: <Cloudflare.Color />,
        filter: (model) => /@cf\//i.test(model.model_name),
      },
      ai360: {
        label: t('360智脑'),
        icon: <Ai360.Color />,
        filter: (model) => /360/i.test(model.model_name),
      },
      jina: {
        label: 'Jina',
        icon: <Jina />,
        filter: (model) => /jina/i.test(model.model_name),
      },
      mistral: {
        label: 'Mistral AI',
        icon: <Mistral.Color />,
        filter: (model) =>
          /mistral|codestral|pixtral|voxtral|magistral/i.test(model.model_name),
      },
      xai: {
        label: 'xAI',
        icon: <XAI />,
        filter: (model) => /grok/i.test(model.model_name),
      },
      llama: {
        label: 'Llama',
        icon: <Ollama />,
        filter: (model) => /llama/i.test(model.model_name),
      },
      doubao: {
        label: t('豆包'),
        icon: <Doubao.Color />,
        filter: (model) => /doubao/i.test(model.model_name),
      },
      yi: {
        label: t('零一万物'),
        icon: <Yi.Color />,
        filter: (model) => /yi/i.test(model.model_name),
      },
    };

    lastLocale = currentLocale;
    return categoriesCache;
  };
})();

export function getChannelIcon(channelType) {
  const iconSize = 14;
  switch (channelType) {
    case 1:
    case 3:
    case 57:
      return <OpenAI size={iconSize} />;
    case 2:
    case 5:
      return <Midjourney size={iconSize} />;
    case 36:
      return <Suno size={iconSize} />;
    case 4:
      return <Ollama size={iconSize} />;
    case 14:
    case 33:
      return <Claude.Color size={iconSize} />;
    case 41:
    case 24:
    case 11:
      return <Gemini.Color size={iconSize} />;
    case 34:
      return <Cohere.Color size={iconSize} />;
    case 39:
      return <Cloudflare.Color size={iconSize} />;
    case 43:
      return <DeepSeek.Color size={iconSize} />;
    case 15:
    case 46:
      return <Wenxin.Color size={iconSize} />;
    case 17:
      return <Qwen.Color size={iconSize} />;
    case 18:
      return <Spark.Color size={iconSize} />;
    case 16:
    case 26:
      return <Zhipu.Color size={iconSize} />;
    case 47:
      return <Xinference.Color size={iconSize} />;
    case 25:
      return <Moonshot size={iconSize} />;
    case 27:
      return <Perplexity.Color size={iconSize} />;
    case 20:
      return <OpenRouter size={iconSize} />;
    case 19:
      return <Ai360.Color size={iconSize} />;
    case 23:
      return <Hunyuan.Color size={iconSize} />;
    case 31:
      return <Yi.Color size={iconSize} />;
    case 35:
      return <Minimax.Color size={iconSize} />;
    case 37:
      return <Dify.Color size={iconSize} />;
    case 38:
      return <Jina size={iconSize} />;
    case 40:
      return <SiliconCloud.Color size={iconSize} />;
    case 42:
      return <Mistral.Color size={iconSize} />;
    case 45:
    case 54:
      return <Doubao.Color size={iconSize} />;
    case 48:
      return <XAI size={iconSize} />;
    case 49:
      return <Coze size={iconSize} />;
    case 50:
      return <Kling.Color size={iconSize} />;
    case 51:
      return <Jimeng.Color size={iconSize} />;
    case 56:
      return <Replicate size={iconSize} />;
    case 22:
      return <FastGPT.Color size={iconSize} />;
    default:
      return null;
  }
}

export function getLobeHubIcon(iconName, size = 14) {
  if (typeof iconName === 'string') iconName = iconName.trim();
  if (!iconName) {
    return <Avatar size='extra-extra-small'>?</Avatar>;
  }

  const segments = String(iconName).split('.');
  const baseKey = segments[0];
  const BaseIcon = LobeIcons[baseKey];
  let IconComponent = undefined;
  let propStartIndex = 1;

  if (BaseIcon && segments.length > 1 && BaseIcon[segments[1]]) {
    IconComponent = BaseIcon[segments[1]];
    propStartIndex = 2;
  } else {
    IconComponent = LobeIcons[baseKey];
    propStartIndex = 1;
  }

  if (
    !IconComponent ||
    (typeof IconComponent !== 'function' && typeof IconComponent !== 'object')
  ) {
    const firstLetter = String(iconName).charAt(0).toUpperCase();
    return <Avatar size='extra-extra-small'>{firstLetter}</Avatar>;
  }

  const props = {};
  const parseValue = (raw) => {
    if (raw == null) return true;
    let value = String(raw).trim();
    if (value.startsWith('{') && value.endsWith('}')) {
      value = value.slice(1, -1).trim();
    }
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
    return value;
  };

  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;
    const eqIdx = seg.indexOf('=');
    if (eqIdx === -1) {
      props[seg.trim()] = true;
      continue;
    }
    const key = seg.slice(0, eqIdx).trim();
    const valRaw = seg.slice(eqIdx + 1).trim();
    props[key] = parseValue(valRaw);
  }

  if (props.size == null && size != null) props.size = size;
  return <IconComponent {...props} />;
}
