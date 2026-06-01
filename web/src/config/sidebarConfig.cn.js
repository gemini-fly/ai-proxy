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
  token: '/console/token',
  topup: '/console/topup',
  user: '/console/user',
  log: '/console/log',
  about: '/about',
  detail: '/console',
  pricing: '/pricing',
  personal: '/console/personal',
  security: '/console/security',
  contract: '/console/contract',
};

export const footerHiddenPaths = [
  '/console/log',
  '/console/user',
  '/console/token',
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

export const getAdminItems = (t, { isAdminUser }) => [
  {
    text: t('用户管理'),
    itemKey: 'user',
    to: '/user',
    className: isAdminUser ? '' : 'tableHiddle',
  },
];

export const getChatMenuItems = () => [];

export const getSidebarSettingSections = (t) => [
  {
    key: 'console',
    title: t('控制台区域'),
    description: t('数据管理和日志查看'),
    modules: [
      { key: 'detail', title: t('数据看板'), description: t('系统数据统计') },
      { key: 'token', title: t('令牌管理'), description: t('API令牌管理') },
      { key: 'log', title: t('使用日志'), description: t('API使用记录') },
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
      { key: 'user', title: t('用户管理'), description: t('用户账户管理') },
    ],
  },
];
