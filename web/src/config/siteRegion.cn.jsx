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

export const siteRegion = 'cn';
export const isGlobalSite = false;
export const enforcedBranding = {
  enabled: true,
  systemName: '闪域',
  logo: '/logo.png',
  footerHTML: '',
};
export const allowCustomMarketingContent = false;

const disabledConsoleModules = new Set([
  'channel',
  'models',
  'deployment',
  'setting',
  'playground',
  'task',
]);

const disabledHeaderNavModules = new Set(['pricing']);

export const isConsoleModuleEnabled = (key) => !disabledConsoleModules.has(key);
export const isHeaderNavModuleEnabled = (key) =>
  !disabledHeaderNavModules.has(key);

export const CHANNEL_OPTIONS = [
  { value: 17, color: 'orange', label: '阿里通义千问' },
  { value: 45, color: 'blue', label: '字节火山方舟、豆包通用' },
  { value: 54, color: 'blue', label: '豆包视频' },
  { value: 8, color: 'pink', label: '自定义渠道' },
];

const domesticModelPatterns = [
  /qwen/i,
  /qwq/i,
  /qvq/i,
  /tongyi/i,
  /通义/,
  /千问/,
  /doubao/i,
  /豆包/,
  /volc/i,
  /火山/,
  /方舟/,
];

export const isRegionModelName = (modelName = '') =>
  domesticModelPatterns.some((pattern) => pattern.test(String(modelName)));

export const filterRegionModels = (models = []) =>
  (models || []).filter((model) => {
    const name =
      typeof model === 'string'
        ? model
        : model?.model_name || model?.name || model?.value || '';
    return isRegionModelName(name);
  });

export const filterRegionChats = () => [];

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

function DomesticProviderIcon({ label, size = 18, tone = 'qwen' }) {
  const numberSize = Number(size) || 18;
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
        fontSize: Math.max(10, Math.floor(numberSize * 0.48)),
        fontWeight: 700,
        height: numberSize,
        justifyContent: 'center',
        lineHeight: 1,
        width: numberSize,
      }}
    >
      {label}
    </span>
  );
}

export const getModelCategories = (t) => ({
  all: {
    label: t('全部模型'),
    icon: null,
    filter: () => true,
  },
  qwen: {
    label: '阿里通义',
    icon: <DomesticProviderIcon label='Q' tone='qwen' />,
    filter: (model) =>
      /qwen|qwq|qvq|tongyi|通义|千问/i.test(model.model_name || ''),
  },
  doubao: {
    label: '豆包',
    icon: <DomesticProviderIcon label='豆' tone='doubao' />,
    filter: (model) =>
      /doubao|豆包|volc|火山|方舟/i.test(model.model_name || ''),
  },
});

export function getChannelIcon(channelType) {
  const iconSize = 14;
  switch (channelType) {
    case 17:
      return <DomesticProviderIcon label='Q' size={iconSize} tone='qwen' />;
    case 45:
    case 54:
      return <DomesticProviderIcon label='豆' size={iconSize} tone='doubao' />;
    default:
      return null;
  }
}

export function getLobeHubIcon(iconName, size = 14) {
  const normalized = String(iconName || '').toLowerCase();
  if (normalized.includes('qwen') || normalized.includes('tongyi')) {
    return <DomesticProviderIcon label='Q' size={size} tone='qwen' />;
  }
  if (normalized.includes('doubao') || normalized.includes('volcengine')) {
    return <DomesticProviderIcon label='豆' size={size} tone='doubao' />;
  }
  const firstLetter = String(iconName || '?').charAt(0).toUpperCase() || '?';
  return <Avatar size='extra-extra-small'>{firstLetter}</Avatar>;
}
