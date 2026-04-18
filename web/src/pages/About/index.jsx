import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/* ── Design tokens (same as Home) ─────────────────────── */
const C = {
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

/* ── Highlights shown when admin hasn't set custom content ─ */
const HIGHLIGHTS = [
  { icon: '🌐', color: '#06d6a0', title: '30+ 大模型全覆盖',
    desc: '国内文心、星火、通义、GLM、混元，国际 OpenAI、Claude、Gemini、Grok，一站全搞定。' },
  { icon: '⚡', color: '#ffd166', title: '统一 OpenAI 接口',
    desc: '零代码改造，仅替换 Base URL，兼容所有 OpenAI SDK、LangChain、AutoGen 等工具链。' },
  { icon: '👥', color: '#a78bfa', title: '企业级团队管理',
    desc: '为每个员工颁发独立 API Key，设置用量上限，一键查看团队全员的实时调用与费用明细。' },
  { icon: '🔒', color: '#fb923c', title: '安全可靠',
    desc: '全链路 HTTPS，Key 加密存储，访问日志完整记录，企业数据不出域。' },
];

/* ── Default About page ─────────────────────────────────── */
const DefaultAbout = () => {
  const currentYear = new Date().getFullYear();

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
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 40, marginBottom: 24,
            border: `1px solid ${C.primaryDim}`, background: C.primaryDim,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>AI API 代理平台</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1,
            marginBottom: 16, letterSpacing: '-0.025em' }}>
            <span style={{ fontFamily: 'ui-monospace,monospace', color: C.primary }}>懂点</span>
            <span style={{ fontFamily: 'ui-monospace,monospace' }}>Code</span>
          </h1>

          <p style={{ fontSize: 18, color: C.text1, maxWidth: 520, margin: '0 auto',
            lineHeight: 1.75 }}>
            专为开发者和企业团队打造的国内外 AI 大模型统一接入平台，
            让每一次 AI 调用都简单、透明、可控。
          </p>
        </div>

        {/* ── Feature grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16,
          marginBottom: 56 }}>
          {HIGHLIGHTS.map((f) => (
            <div key={f.title} className='ddcode-feature-card' style={{
              padding: '24px 28px', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 14,
            }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{f.icon}</div>
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
            { label: '联系邮箱', value: 'support@ddcode.ai', href: 'mailto:support@ddcode.ai' },
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
            © {currentYear} 懂点Code. 保留所有权利。
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
