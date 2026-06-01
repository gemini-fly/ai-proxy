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

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useActualTheme } from '../../context/Theme';
import { siteContent } from '@siteContent';

/* ── Design tokens (same as Home) ─────────────────────── */
const DARK_C = {
  bg:         '#06080f',
  surface:    '#0d1117',
  border:     'rgba(255,255,255,0.07)',
  primary:    '#06d6a0',
  primaryDim: 'rgba(6,214,160,0.10)',
  accent:     '#ffd166',
  text0:      '#f0f6fc',
  text1:      '#8b949e',
  text2:      '#3d444d',
};
const LIGHT_C = {
  bg:         '#ffffff',
  surface:    '#f6f8fa',
  border:     'rgba(0,0,0,0.08)',
  primary:    '#06d6a0',
  primaryDim: 'rgba(6,214,160,0.10)',
  accent:     '#ffd166',
  text0:      '#1c1c1e',
  text1:      '#636366',
  text2:      '#8a8a8e',
};

const BRAND_LOGO = '/logo.png';
const ASSETS = {
  suite: '/shanview-assets/ops-ldap-suite.svg',
  platform: '/shanview-assets/ops-platform.svg',
  directory: '/shanview-assets/ldap-directory.svg',
};

/* ── Highlights shown when admin hasn't set custom content ─ */
const HIGHLIGHTS = [
  { icon: ASSETS.suite, color: '#06d6a0', ...siteContent.about.coverageFeature },
  { icon: ASSETS.platform, color: '#ffd166', ...siteContent.about.apiFeature },
  { icon: ASSETS.directory, color: '#a78bfa', title: '企业级团队管理',
    desc: '为每个员工颁发独立 API Key，设置用量上限，一键查看团队全员的实时调用与费用明细。' },
  { icon: BRAND_LOGO, color: '#fb923c', title: '安全可靠',
    desc: '全链路 HTTPS，Key 加密存储，访问日志完整记录，企业数据不出域。' },
];

const FeatureIcon = ({ src, color }) => (
  <span style={{
    width: 44, height: 44, display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: 12, marginBottom: 12,
    background: 'rgba(255,255,255,0.94)', border: `1px solid ${color}33`,
    boxShadow: `0 10px 24px ${color}1f`,
  }}>
    <img src={src} alt='' style={{ width: 32, height: 32, objectFit: 'contain' }} />
  </span>
);

/* ── Default About page ─────────────────────────────────── */
const DefaultAbout = () => {
  const currentYear = new Date().getFullYear();
  const actualTheme = useActualTheme();
  const C = actualTheme === 'dark' ? DARK_C : LIGHT_C;

  return (
    <div style={{ background: C.bg, minHeight: 'calc(100vh - 60px)', color: C.text0,
      paddingTop: 60 }}>

      {/* glow */}
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle,rgba(6,214,160,0.08) 0%,transparent 70%)',
        filter: 'blur(60px)' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 80px',
        position: 'relative', zIndex: 1 }}>

        {/* ── Brand Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <img src={BRAND_LOGO} alt='' style={{
            width: 72, height: 72, objectFit: 'contain', borderRadius: 18,
            margin: '0 auto 20px', boxShadow: '0 14px 34px rgba(3,158,252,0.18)',
          }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 40, marginBottom: 24,
            border: `1px solid ${C.primaryDim}`, background: C.primaryDim,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>AI API 代理平台</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1,
            marginBottom: 16, letterSpacing: 0 }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', color: C.primary }}>闪域</span>
          </h1>

          <p style={{ fontSize: 18, color: C.text1, maxWidth: 520, margin: '0 auto',
            lineHeight: 1.75 }}>
            {siteContent.about.intro}
          </p>
        </div>

        {/* ── Feature grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16,
          marginBottom: 56 }}>
          {HIGHLIGHTS.map((f) => (
            <div key={f.title} className='shanview-feature-card' style={{
              padding: '24px 28px', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 14,
            }}>
              <FeatureIcon src={f.icon} color={f.color} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: f.color, marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.75, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: C.border, marginBottom: 48 }} />

        {/* ── Contact / Info ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24,
          marginBottom: 56, textAlign: 'center' }}>
          {[
            { label: '联系邮箱', value: 'contactus@shanview.cn', href: 'mailto:contactus@shanview.cn' },
            { label: '服务状态', value: '99.9% 可用性',      href: null },
            { label: '开始使用', value: '免费注册',           href: '/register', internal: true },
          ].map((item) => (
            <div key={item.label} style={{ padding: '20px 16px', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: C.text2, textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 8, fontWeight: 600 }}>
                {item.label}
              </div>
              {item.internal ? (
                <Link to={item.href}>
                  <span style={{ fontSize: 15, color: C.primary, fontWeight: 700,
                    cursor: 'pointer' }}>
                    {item.value} →
                  </span>
                </Link>
              ) : item.href ? (
                <a href={item.href} style={{ fontSize: 15, color: C.primary, fontWeight: 700 }}>
                  {item.value}
                </a>
              ) : (
                <span style={{ fontSize: 15, color: C.text0, fontWeight: 700 }}>
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Copyright ── */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: C.text2 }}>
            © {currentYear} 闪域. 保留所有权利。
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Main About component ───────────────────────────────── */
const About = () => {
  const { t } = useTranslation();
  const [about, setAbout]           = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let aboutContent = data;
      if (!data.startsWith('https://')) {
        aboutContent = marked.parse(data);
      }
      setAbout(aboutContent);
      localStorage.setItem('about', aboutContent);
    } else {
      showError(message);
      setAbout(t('加载关于内容失败...'));
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  if (!aboutLoaded) return null;

  if (about === '') {
    return <DefaultAbout />;
  }

  if (about.startsWith('https://')) {
    return (
      <div className='mt-[60px]'>
        <iframe src={about} style={{ width: '100%', height: '100vh', border: 'none' }} />
      </div>
    );
  }

  return (
    <div className='mt-[60px] px-4 py-8 max-w-4xl mx-auto'>
      <div style={{ fontSize: 'larger' }} dangerouslySetInnerHTML={{ __html: about }} />
    </div>
  );
};

export default About;
