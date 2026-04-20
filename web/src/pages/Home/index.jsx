import React, { useContext, useEffect, useState } from 'react';
import { Button, Input, ScrollList, ScrollItem } from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { IconCopy } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot, OpenAI, XAI, Zhipu, Volcengine, Cohere, Claude, Gemini,
  Suno, Minimax, Wenxin, Spark, Qingyan, DeepSeek, Qwen, Midjourney,
  Grok, AzureAI, Hunyuan, Xinference,
} from '@lobehub/icons';

/* ── Design tokens ─────────────────────────────────────────── */
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
  gridLine:   'rgba(255,255,255,0.025)',
  termShadow: '0 32px 96px rgba(0,0,0,0.7)',
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
  gridLine:   'rgba(0,0,0,0.04)',
  termShadow: '0 8px 40px rgba(0,0,0,0.12)',
};

/* ── Static data ───────────────────────────────────────────── */
const FEATURES = [
  { icon: '🌐', color: '#06d6a0', title: '国内外全覆盖',
    desc: '30+ 主流大模型一站接入，OpenAI、Claude、Gemini 到文心、星火、通义千问，统统搞定。' },
  { icon: '⚡', color: '#ffd166', title: '统一 OpenAI 接口',
    desc: '无需改代码，更换 Base URL 即可切换任意模型，完全兼容 OpenAI SDK 及所有工具链。' },
  { icon: '👥', color: '#a78bfa', title: '企业团队管理',
    desc: '按员工分配独立 API Key，设置用量限额，实时查看每个成员的消费与调用明细。' },
  { icon: '💰', color: '#fb923c', title: '透明按量计费',
    desc: '无月费无套餐，实时额度统计，充值即用。个人开发者与企业团队均可灵活使用。' },
];

const INTL = [
  { icon: <OpenAI size={26} />,          name: 'OpenAI' },
  { icon: <Claude.Color size={26} />,    name: 'Claude' },
  { icon: <Gemini.Color size={26} />,    name: 'Gemini' },
  { icon: <Grok size={26} />,            name: 'Grok' },
  { icon: <AzureAI.Color size={26} />,   name: 'Azure AI' },
  { icon: <DeepSeek.Color size={26} />,  name: 'DeepSeek' },
  { icon: <Cohere.Color size={26} />,    name: 'Cohere' },
  { icon: <Midjourney size={26} />,      name: 'Midjourney' },
  { icon: <Suno size={26} />,            name: 'Suno' },
  { icon: <XAI size={26} />,             name: 'xAI' },
];

const CN = [
  { icon: <Qwen.Color size={26} />,       name: '通义千问' },
  { icon: <Wenxin.Color size={26} />,     name: '文心一言' },
  { icon: <Spark.Color size={26} />,      name: '讯飞星火' },
  { icon: <Zhipu.Color size={26} />,      name: '智谱 GLM' },
  { icon: <Hunyuan.Color size={26} />,    name: '腾讯混元' },
  { icon: <Volcengine.Color size={26} />, name: '字节豆包' },
  { icon: <Minimax.Color size={26} />,    name: 'MiniMax' },
  { icon: <Moonshot size={26} />,         name: 'Moonshot' },
  { icon: <Qingyan.Color size={26} />,    name: '清言' },
  { icon: <Xinference.Color size={26} />, name: 'Xinference' },
];

const TERMINAL = [
  { p: '$', t: 'curl https://api.ddcode.ai/v1/chat/completions \\',  c: '#8b949e' },
  { p: ' ', t: '  -H "Authorization: Bearer sk-dd••••••••ua" \\',   c: '#79c0ff' },
  { p: ' ', t: "  -d '{\"model\":\"gpt-4o\",\"messages\":[...]}'",   c: '#8b949e' },
  { p: '>', t: 'HTTP/2 200  ✓',                                      c: '#06d6a0' },
  { p: ' ', t: '"content": "当然，让我来帮你解答..."',               c: '#ffd166' },
  { p: '>', t: 'tokens: 1,243  cost: $0.0037  latency: 1.2s',        c: '#3d444d' },
];

/* ── Sub-components ─────────────────────────────────────────── */
const ModelChip = ({ icon, name, C: colors }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 16px',
    background: colors?.surface ?? 'rgba(255,255,255,0.04)',
    border: `1px solid ${colors?.border ?? 'rgba(255,255,255,0.07)'}`,
    borderRadius: 40, whiteSpace: 'nowrap', marginRight: 12,
  }}>
    {icon}
    <span style={{ fontSize: 13, color: colors?.text1 ?? '#8b949e', fontWeight: 500 }}>{name}</span>
  </div>
);

/* ── Main component ─────────────────────────────────────────── */
const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const C = actualTheme === 'dark' ? DARK_C : LIGHT_C;
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent]             = useState('');
  const [noticeVisible, setNoticeVisible]                 = useState(false);
  const isMobile      = useIsMobile();
  const serverAddress = statusState?.status?.server_address || window.location.origin;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [termIdx, setTermIdx]             = useState(0);

  /* load custom home page content */
  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) content = marked.parse(data);
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopy = async () => {
    if (await copy(serverAddress)) showSuccess(t('已复制到剪切板'));
  };

  useEffect(() => {
    (async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      if (lastCloseDate !== new Date().toDateString()) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data?.trim()) setNoticeVisible(true);
        } catch (_) {}
      }
    })();
  }, []);

  useEffect(() => { displayHomePageContent(); }, []);

  useEffect(() => {
    const t = setInterval(() => setEndpointIndex((p) => (p + 1) % endpointItems.length), 3000);
    return () => clearInterval(t);
  }, [endpointItems.length]);

  /* animate terminal lines */
  useEffect(() => {
    if (!homePageContentLoaded || homePageContent !== '') return;
    const t = setInterval(() => setTermIdx((p) => (p + 1) % (TERMINAL.length + 4)), 700);
    return () => clearInterval(t);
  }, [homePageContentLoaded, homePageContent]);

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text0 }}>
      <NoticeModal visible={noticeVisible} onClose={() => setNoticeVisible(false)} isMobile={isMobile} />

      {homePageContentLoaded && homePageContent === '' ? (
        <>
          {/* ═══════════════ HERO ═══════════════ */}
          <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
            position: 'relative', overflow: 'hidden', paddingTop: 60 }}>

            {/* grid bg */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: `linear-gradient(${C.gridLine} 1px,transparent 1px),
                                linear-gradient(90deg,${C.gridLine} 1px,transparent 1px)`,

              backgroundSize: '52px 52px' }} />

            {/* glow blobs */}
            <div style={{ position: 'absolute', top: '15%', left: '5%', width: 480, height: 480,
              borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle,rgba(6,214,160,0.13) 0%,transparent 70%)',
              filter: 'blur(48px)' }} />
            <div style={{ position: 'absolute', bottom: '5%', right: '2%', width: 520, height: 520,
              borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle,rgba(255,209,102,0.08) 0%,transparent 70%)',
              filter: 'blur(60px)' }} />

            <div style={{
              maxWidth: 1200, margin: '0 auto', width: '100%',
              padding: isMobile ? '48px 20px' : '80px 48px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? 48 : 72, alignItems: 'center',
              position: 'relative',
            }}>

              {/* ─── Left copy ─────────────────── */}
              <div>
                {/* badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '5px 14px', borderRadius: 40, marginBottom: 28,
                  border: `1px solid ${C.primaryDim}`, background: C.primaryDim,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary }} />
                  <span style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>
                    30+ AI 模型 · 随时可用
                  </span>
                </div>

                {/* headline */}
                <h1 style={{ fontSize: isMobile ? 48 : 68, fontWeight: 800,
                  lineHeight: 1.08, marginBottom: 20, letterSpacing: '-0.025em' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', color: C.primary }}>懂点</span>
                  <span style={{ fontFamily: 'ui-monospace,monospace' }}>Code</span>
                  <br />
                  <span style={{ fontSize: isMobile ? 22 : 32, fontWeight: 400, color: C.text1, letterSpacing: 0 }}>
                    AI API 代理平台
                  </span>
                </h1>

                <p style={{ fontSize: isMobile ? 15 : 17, color: C.text1, lineHeight: 1.75,
                  marginBottom: 36, maxWidth: 460 }}>
                  一个 Key 接入国内外 30+ 主流大模型。无缝兼容 OpenAI SDK，
                  企业可按员工分配用量，实时监控消费，开箱即用。
                </p>

                {/* URL input */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 11, color: C.text2, marginBottom: 8,
                    textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    接口地址
                  </div>
                  <Input
                    readonly
                    value={serverAddress}
                    style={{ background: C.surface, borderColor: C.border,
                      borderRadius: 12, fontFamily: 'ui-monospace,monospace', fontSize: 13 }}
                    size='large'
                    suffix={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ScrollList bodyHeight={28} style={{ border: 'none', boxShadow: 'none' }}>
                          <ScrollItem mode='wheel' cycled list={endpointItems}
                            selectedIndex={endpointIndex}
                            onSelect={({ index }) => setEndpointIndex(index)} />
                        </ScrollList>
                        <Button size='small' onClick={handleCopy} icon={<IconCopy />}
                          style={{ borderRadius: 8, background: C.primary,
                            border: 'none', color: '#060810', fontWeight: 700 }} />
                      </div>
                    }
                  />
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to='/register'>
                    <button style={{
                      padding: isMobile ? '11px 24px' : '13px 32px',
                      background: C.primary, color: '#060810',
                      border: 'none', borderRadius: 10,
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      letterSpacing: '-0.01em',
                    }}>
                      免费注册 →
                    </button>
                  </Link>
                  <Link to='/console'>
                    <button style={{
                      padding: isMobile ? '11px 22px' : '13px 28px',
                      background: 'transparent', color: C.text0,
                      border: `1px solid ${C.border}`, borderRadius: 10,
                      fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    }}>
                      进入控制台
                    </button>
                  </Link>
                </div>
              </div>

              {/* ─── Right terminal ────────────── */}
              {!isMobile && (
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: C.termShadow,
                }}>
                  {/* title bar */}
                  <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', gap: 8 }}>
                    {['#f85149','#ffd166','#3fb950'].map((c) => (
                      <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                    ))}
                    <span style={{ marginLeft: 10, fontSize: 12, color: C.text2,
                      fontFamily: 'ui-monospace,monospace' }}>
                      dongdiancode ~ api-gateway
                    </span>
                  </div>

                  {/* terminal body */}
                  <div style={{ padding: '20px 24px', fontFamily: 'ui-monospace,monospace',
                    fontSize: 13, lineHeight: 1.9 }}>
                    {TERMINAL.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14,
                        opacity: termIdx > i ? 1 : 0, transition: 'opacity 0.35s' }}>
                        <span style={{ color: C.text2, userSelect: 'none', minWidth: 12 }}>{line.p}</span>
                        <span style={{ color: line.c }}>{line.t}</span>
                      </div>
                    ))}
                    {/* cursor */}
                    <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                      <span style={{ color: C.text2 }}>$</span>
                      <span className='ddcode-cursor' style={{
                        display: 'inline-block', width: 8, height: 16,
                        background: C.primary, verticalAlign: 'middle',
                      }} />
                    </div>

                    {/* stats */}
                    <div style={{
                      marginTop: 20, padding: '14px 16px',
                      background: 'rgba(6,214,160,0.07)', borderRadius: 10,
                      border: `1px solid rgba(6,214,160,0.15)`,
                      display: 'flex', gap: 28,
                      opacity: termIdx > TERMINAL.length ? 1 : 0,
                      transition: 'opacity 0.5s',
                    }}>
                      {[
                        { label: '今日调用', value: '4,721' },
                        { label: '消耗额度', value: '$2.83' },
                        { label: '成功率',   value: '99.8%' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div style={{ fontSize: 11, color: C.text2 }}>{s.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: C.primary }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ═══════════════ FEATURES ═══════════════ */}
          <section style={{ padding: isMobile ? '64px 20px' : '100px 48px',
            maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                为什么选择懂点Code
              </div>
              <h2 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 800,
                marginBottom: 14, letterSpacing: '-0.02em' }}>
                一站式 AI 接口管理
              </h2>
              <p style={{ color: C.text1, fontSize: 16, maxWidth: 440, margin: '0 auto' }}>
                从个人开发者到企业团队，满足不同规模的 AI 接入需求
              </p>
            </div>

            <div style={{ display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 18 }}>
              {FEATURES.map((f) => (
                <div key={f.title} className='ddcode-feature-card' style={{
                  padding: '28px 30px', background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 16,
                }}>
                  <div style={{ fontSize: 34, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: f.color }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.8, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════ MODELS MARQUEE ═══════════════ */}
          <section style={{ overflow: 'hidden', padding: '60px 0',
            borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ textAlign: 'center', marginBottom: 32, padding: '0 20px' }}>
              <span style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>
                国内外主流大模型，全部覆盖
              </span>
            </div>

            {/* row 1 → left */}
            <div style={{ overflow: 'hidden', marginBottom: 14 }}>
              <div className='ddcode-marquee-left' style={{ display: 'flex', width: 'max-content' }}>
                {[...INTL, ...INTL].map((m, i) => <ModelChip key={i} icon={m.icon} name={m.name} C={C} />)}
              </div>
            </div>

            {/* row 2 → right */}
            <div style={{ overflow: 'hidden' }}>
              <div className='ddcode-marquee-right' style={{ display: 'flex', width: 'max-content' }}>
                {[...CN, ...CN].map((m, i) => <ModelChip key={i} icon={m.icon} name={m.name} C={C} />)}
              </div>
            </div>
          </section>

          {/* ═══════════════ CTA ═══════════════ */}
          <section style={{ padding: isMobile ? '80px 20px' : '120px 48px',
            textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)', width: 640, height: 640,
              borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle,rgba(6,214,160,0.07) 0%,transparent 70%)',
              filter: 'blur(48px)' }} />

            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: isMobile ? 30 : 48, fontWeight: 800,
                marginBottom: 16, letterSpacing: '-0.02em' }}>
                开始使用<span style={{ color: C.primary, fontFamily: 'ui-monospace,monospace' }}>懂点Code</span>
              </h2>
              <p style={{ color: C.text1, fontSize: 16, maxWidth: 380,
                margin: '0 auto 36px', lineHeight: 1.7 }}>
                注册即可获得 API Key，接入任意大模型，按量计费，随时充值
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to='/register'>
                  <button style={{ padding: '14px 40px', background: C.primary,
                    color: '#060810', border: 'none', borderRadius: 12,
                    fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
                    免费注册
                  </button>
                </Link>
                <Link to='/pricing'>
                  <button style={{ padding: '14px 32px', background: 'transparent',
                    color: C.text0, border: `1px solid ${C.border}`, borderRadius: 12,
                    fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                    查看价格
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe src={homePageContent} className='w-full h-screen border-none' />
          ) : (
            <div className='mt-[60px]' dangerouslySetInnerHTML={{ __html: homePageContent }} />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
