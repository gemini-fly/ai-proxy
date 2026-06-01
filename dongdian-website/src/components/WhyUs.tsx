import styles from './WhyUs.module.css'

const reasons = [
  {
    icon: '/assets/ops-platform.svg',
    title: '极低延迟',
    desc: '国内 BGP 多线接入，平均响应延迟 < 200ms，无需 VPN，开箱即用。',
  },
  {
    icon: '/assets/brand/shanyu-logo-final.png',
    title: '安全可靠',
    desc: 'API Key 全程加密存储，HTTPS 传输，IP 白名单，您的数据不离开您的视线。',
  },
  {
    icon: '/assets/ldap-directory.svg',
    title: '价格透明',
    desc: '官方汇率结算，无隐藏溢价，按实际消耗计费，账单清晰可查。',
  },
  {
    icon: '/assets/ops-ldap-suite.svg',
    title: '接入简单',
    desc: '与 OpenAI 官方 SDK 完全兼容，只需替换 base_url，5 分钟完成接入。',
  },
  {
    icon: '/assets/brand/shanyu-logo-final.png',
    title: '专属支持',
    desc: '专属微信群，企业客户 7×24 技术响应，技术问题快速解决，不让您等待。',
  },
  {
    icon: '/assets/ops-platform.svg',
    title: '多模型支持',
    desc: '统一 API 入口，同时接入 OpenAI、Anthropic、Google 等主流模型，一个 Key 搞定一切。',
  },
  {
    icon: '/assets/ldap-directory.svg',
    title: '弹性扩容',
    desc: '从个人开发者到千人企业，弹性配额，按需扩容，业务增长无需担忧 Token 上限。',
  },
  {
    icon: '/assets/ops-ldap-suite.svg',
    title: '合规经营',
    desc: '北京注册企业，签订正式合同，出具正规发票，满足企业财务与法务合规要求。',
  },
]

export default function WhyUs() {
  return (
    <section className={styles.section} id="why-us">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.sectionTag}>为何选择我们</span>
          <h2 className={styles.sectionTitle}>
            闪域科技的差异化优势<br />
            <span className="gradient-text">每一点都是真实价值</span>
          </h2>
          <p className={styles.sectionDesc}>
            我们深耕 AI 服务领域，用专业换取您的信任，以稳定赢得您的长期合作。
          </p>
        </div>

        <div className={styles.grid}>
          {reasons.map((r, i) => (
            <div key={i} className={styles.item}>
              <img className={styles.itemIcon} src={r.icon} alt="" />
              <div>
                <div className={styles.itemTitle}>{r.title}</div>
                <div className={styles.itemDesc}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
