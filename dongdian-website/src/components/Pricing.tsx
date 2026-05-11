import styles from './Pricing.module.css'

const plans = [
  {
    name: '个人开发者',
    desc: '适合个人项目与 API 探索',
    price: '按量',
    unit: '计费',
    featured: false,
    badge: '',
    features: [
      '接入 OpenAI / Claude / Gemini',
      '国内直连低延迟',
      '实时用量统计',
      '邮件支持',
      '无月费，充值即用',
    ],
    cta: '立即开始',
  },
  {
    name: '企业标准版',
    desc: '适合中小企业团队使用',
    price: '面议',
    unit: '/月起',
    featured: true,
    badge: '最受欢迎',
    features: [
      '包含个人版全部功能',
      '多子账号 / 团队管理',
      '按部门用量分摊报表',
      'API Key 统一管控',
      '专属微信群技术支持',
      'SLA 99.9% 保障',
    ],
    cta: '联系我们',
  },
  {
    name: '企业旗舰版',
    desc: '适合大型企业与特殊需求',
    price: '定制',
    unit: '方案',
    featured: false,
    badge: '',
    features: [
      '包含标准版全部功能',
      '私有化部署支持',
      '专属模型渠道资源',
      '定制化数据报表',
      '专属客户成功经理',
      '7×24 优先响应',
    ],
    cta: '联系我们',
  },
]

export default function Pricing() {
  return (
    <section className={styles.section} id="pricing">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.sectionTag}>价格方案</span>
          <h2 className={styles.sectionTitle}>
            透明定价，按需付费<br />
            <span className="gradient-text">没有隐藏费用</span>
          </h2>
          <p className={styles.sectionDesc}>
            我们提供灵活的计费方式，个人开发者无月费门槛，企业客户可按需定制专属方案。
          </p>
        </div>

        <div className={styles.plans}>
          {plans.map((p, i) => (
            <div
              key={i}
              className={`${styles.plan} ${p.featured ? styles.planFeatured : ''}`}
            >
              {p.badge && <div className={styles.planBadge}>{p.badge}</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planDesc}>{p.desc}</div>
              <div className={styles.planPrice}>
                <span className={styles.planPriceNum}>{p.price}</span>
                <span className={styles.planPriceUnit}>{p.unit}</span>
              </div>
              <ul className={styles.planFeatures}>
                {p.features.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`${styles.planBtn} ${p.featured ? styles.planBtnPrimary : styles.planBtnDefault}`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <p className={styles.note}>
          价格以实际成交为准，如有疑问请联系我们获取报价 · 企业可申请免费试用
        </p>
      </div>
    </section>
  )
}
