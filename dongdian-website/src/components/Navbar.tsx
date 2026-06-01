import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.logo}>
          <img className={styles.logoIcon} src="/assets/brand/shanyu-logo-final.png" alt="" />
          <span className="gradient-text">闪域科技</span>
        </div>
        <ul className={styles.links}>
          <li><a href="#services">服务</a></li>
          <li><a href="#pricing">价格</a></li>
          <li><a href="#why-us">为何选择我们</a></li>
          <li><a href="#contact">联系我们</a></li>
        </ul>
        <a href="#contact" className={styles.cta}>
          立即咨询
        </a>
      </div>
    </nav>
  )
}
