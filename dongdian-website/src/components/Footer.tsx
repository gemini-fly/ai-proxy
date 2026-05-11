import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div>
            <div className={styles.brand}>
              <span className={styles.brandIcon}>◈</span>
              <span className="gradient-text">懂点科技</span>
            </div>
            <p className={styles.brandDesc}>
              北京懂点科技有限公司专注于企业级 AI 服务，提供稳定、安全、经济的 Token 代理与 GPT 代充解决方案，让每家企业都能轻松接入 AI 时代。
            </p>
            <p className={styles.icp}>
              © {year} 北京懂点科技有限公司 · 京ICP备XXXXXXXX号
            </p>
          </div>

          <div className={styles.col}>
            <h4>服务</h4>
            <ul>
              <li><a href="#services">AI Token 代理</a></li>
              <li><a href="#services">GPT 账号代充</a></li>
              <li><a href="#services">企业定制接入</a></li>
              <li><a href="#services">模型负载均衡</a></li>
              <li><a href="#services">用量分析报表</a></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>公司</h4>
            <ul>
              <li><a href="#why-us">关于我们</a></li>
              <li><a href="#pricing">价格方案</a></li>
              <li><a href="#contact">联系我们</a></li>
              <li><a href="https://www.DongdianNow.com" target="_blank" rel="noreferrer">官方网站</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            www.DongdianNow.com · 北京懂点科技有限公司
          </span>
          <div className={styles.bottomLinks}>
            <a href="#contact">隐私政策</a>
            <a href="#contact">服务条款</a>
            <a href="#contact">联系我们</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
