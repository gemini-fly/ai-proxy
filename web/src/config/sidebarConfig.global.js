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

export const routerMap = {
  home: '/',
  channel: '/console/channel',
  token: '/console/token',
  redemption: '/console/redemption',
  topup: '/console/topup',
  user: '/console/user',
  log: '/console/log',
  midjourney: '/console/midjourney',
  setting: '/console/setting',
  about: '/about',
  detail: '/console',
  pricing: '/pricing',
  task: '/console/task',
  models: '/console/models',
  deployment: '/console/deployment',
  playground: '/console/playground',
  personal: '/console/personal',
  security: '/console/security',
  contract: '/console/contract',
};

export const footerHiddenPaths = [
  '/console/channel',
  '/console/log',
  '/console/redemption',
  '/console/user',
  '/console/token',
  '/console/midjourney',
  '/console/task',
  '/console/models',
  '/pricing',
];

export const getWorkspaceItems = (t) => [
  {
    text: t('数据看板'),
    itemKey: 'detail',
    to: '/detail',
    className:
      localStorage.getItem('enable_data_export') === 'true'
        ? ''
        : 'tableHiddle',
  },
  {
    text: t('令牌管理'),
    itemKey: 'token',
    to: '/token',
  },
  {
    text: t('使用日志'),
    itemKey: 'log',
    to: '/log',
  },
  {
    text: t('绘图日志'),
    itemKey: 'midjourney',
    iconKey: 'image',
    to: '/midjourney',
    className:
      localStorage.getItem('enable_drawing') === 'true' ? '' : 'tableHiddle',
  },
  {
    text: t('任务日志'),
    itemKey: 'task',
    to: '/task',
    className:
      localStorage.getItem('enable_task') === 'true' ? '' : 'tableHiddle',
  },
];

export const getFinanceItems = (t) => [
  {
    text: t('钱包管理'),
    itemKey: 'topup',
    to: '/topup',
  },
  {
    text: t('个人设置'),
    itemKey: 'personal',
    to: '/personal',
  },
  {
    text: t('安全设置'),
    itemKey: 'security',
    to: '/security',
  },
  {
    text: t('我的合同'),
    itemKey: 'contract',
    to: '/contract',
  },
];

export const getAdminItems = (t, { isAdminUser, isRootUser }) => [
  {
    text: t('渠道管理'),
    itemKey: 'channel',
    to: '/channel',
    className: isAdminUser ? '' : 'tableHiddle',
  },
  {
    text: t('模型管理'),
    itemKey: 'models',
    to: '/console/models',
    className: isAdminUser ? '' : 'tableHiddle',
  },
  {
    text: t('模型部署'),
    itemKey: 'deployment',
    to: '/deployment',
    className: isAdminUser ? '' : 'tableHiddle',
  },
  {
    text: t('用户管理'),
    itemKey: 'user',
    to: '/user',
    className: isAdminUser ? '' : 'tableHiddle',
  },
  {
    text: t('系统设置'),
    itemKey: 'setting',
    to: '/setting',
    className: isRootUser ? '' : 'tableHiddle',
  },
];

export const getChatMenuItems = (t, chatItems) => [
  {
    text: t('操练场'),
    itemKey: 'playground',
    to: '/playground',
  },
  {
    text: t('聊天'),
    itemKey: 'chat',
    items: chatItems,
  },
];

export const getSidebarSettingSections = (t) => [
  {
    key: 'chat',
    title: t('聊天区域'),
    description: t('操练场和聊天功能'),
    modules: [
      {
        key: 'playground',
        title: t('操练场'),
        description: t('AI模型测试环境'),
      },
      { key: 'chat', title: t('聊天'), description: t('聊天会话管理') },
    ],
  },
  {
    key: 'console',
    title: t('控制台区域'),
    description: t('数据管理和日志查看'),
    modules: [
      { key: 'detail', title: t('数据看板'), description: t('系统数据统计') },
      { key: 'token', title: t('令牌管理'), description: t('API令牌管理') },
      { key: 'log', title: t('使用日志'), description: t('API使用记录') },
      {
        key: 'midjourney',
        title: t('绘图日志'),
        description: t('绘图任务记录'),
      },
      { key: 'task', title: t('任务日志'), description: t('系统任务记录') },
    ],
  },
  {
    key: 'personal',
    title: t('个人中心区域'),
    description: t('用户个人功能'),
    modules: [
      { key: 'topup', title: t('钱包管理'), description: t('余额充值管理') },
      {
        key: 'personal',
        title: t('个人设置'),
        description: t('个人信息设置'),
      },
      {
        key: 'security',
        title: t('安全设置'),
        description: t('账户安全管理'),
      },
      {
        key: 'contract',
        title: t('我的合同'),
        description: t('合同信息查看'),
      },
    ],
  },
  {
    key: 'admin',
    title: t('管理区域'),
    description: t('管理员功能'),
    modules: [
      { key: 'channel', title: t('渠道管理'), description: t('渠道配置管理') },
      { key: 'models', title: t('模型管理'), description: t('模型配置管理') },
      { key: 'deployment', title: t('模型部署'), description: t('模型部署管理') },
      { key: 'redemption', title: t('兑换码'), description: t('兑换码管理') },
      { key: 'user', title: t('用户管理'), description: t('用户账户管理') },
      { key: 'setting', title: t('系统设置'), description: t('系统配置管理') },
    ],
  },
];
