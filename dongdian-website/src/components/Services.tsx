import styles from './Services.module.css'

const services = [
  {
    icon: '/assets/ops-platform.svg',
    title: 'AI Token 代理',
    desc: '提供 OpenAI、Claude、Gemini 等主流 AI 模型的 API Token 代理服务，无需境外账号，国内直连，低延迟稳定访问。',
    tags: ['OpenAI GPT-4o', 'Claude 3.5', 'Gemini Pro', '国内直连'],
  },
  {
    icon: '/assets/ldap-directory.svg',
    title: 'GPT 账号代充',
    desc: '专业 ChatGPT Plus、Team、Enterprise 账号充值服务。支持信用卡充值、订阅升级，全程陪同操作，安全有保障。',
    tags: ['ChatGPT Plus', 'Team 版', 'Enterprise', '官方渠道'],
  },
  {
    icon: '/assets/brand/shanyu-logo-final.png',
    title: '企业定制接入',
    desc: '为企业提供定制化 AI API 接入方案，统一管理 API 密钥，按团队计费，支持用量统计、限额控制，满足合规需求。',
    tags: ['统一管理', '按量计费', '用量监控', '权限隔离'],
  },
  {
    icon: '/assets/ops-ldap-suite.svg',
    title: '模型负载均衡',
    desc: '多渠道智能路由，自动故障切换，保障服务连续性。支持主流模型无缝切换，业务中断时间降至最低。',
    tags: ['智能路由', '故障切换', '多模型支持', 'SLA 保障'],
  },
  {
    icon: '/assets/ops-platform.svg',
    title: '用量分析报表',
    desc: '实时 Token 消耗统计、成本分析、部门分摊报表，帮助企业优化 AI 使用成本，提升投入产出比。',
    tags: ['实时统计', '成本分析', '导出报表', '邮件通知'],
  },
  {
    icon: '/assets/brand/shanyu-logo-final.png',
    title: '安全合规保障',
    desc: '全链路 HTTPS 加密传输，API Key 密文存储，支持 IP 白名单、请求审计日志，满足企业数据安全要求。',
    tags: ['HTTPS 加密', '审计日志', 'IP 白名单', '数据脱敏'],
  },
]

export default function Services() {
  return (
    <section className={styles.section} id="services">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.sectionTag}>我们的服务</span>
          <h2 className={styles.sectionTitle}>
            一站式 AI 能力接入<br />
            <span className="gradient-text">让企业轻松用上 AI</span>
          </h2>
          <p className={styles.sectionDesc}>
            从 API 代理到账号管理，从用量监控到安全合规，闪域科技为您提供全方位的 AI 服务支持。
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((s, i) => (
            <div key={i} className={styles.card}>
              <img className={styles.cardIcon} src={s.icon} alt="" />
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.desc}</p>
              <div className={styles.cardTags}>
                {s.tags.map((tag, j) => (
                  <span key={j} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
