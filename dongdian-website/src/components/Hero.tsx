import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* 背景光效 */}
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className={`container ${styles.content}`}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          北京闪域科技有限公司
        </div>

        <h1 className={styles.title}>
          专业 AI 服务平台<br />
          <span className="gradient-text">懂你所需，点到为止</span>
        </h1>

        <p className={styles.subtitle}>
          提供企业级 AI Token 代理、GPT 账号代充服务<br />
          稳定可靠 · 价格透明 · 全天候支持
        </p>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>99.9%</span>
            <span className={styles.statLabel}>服务可用率</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>50+</span>
            <span className={styles.statLabel}>企业客户</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>24/7</span>
            <span className={styles.statLabel}>技术支持</span>
          </div>
        </div>

        <div className={styles.actions}>
          <a href="#contact" className={styles.btnPrimary}>
            免费咨询
            <span>→</span>
          </a>
          <a href="#services" className={styles.btnSecondary}>
            了解服务
          </a>
        </div>
      </div>
    </section>
  )
}
