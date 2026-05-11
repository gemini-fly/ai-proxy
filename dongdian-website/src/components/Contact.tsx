import { useState } from 'react'
import styles from './Contact.module.css'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', phone: '', service: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 实际部署时替换为真实的提交逻辑（如后端 API / 邮件服务）
    console.log('Form submitted:', form)
    setSubmitted(true)
  }

  return (
    <section className={styles.section} id="contact">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.sectionTag}>联系我们</span>
          <h2 className={styles.sectionTitle}>
            开始合作<br />
            <span className="gradient-text">让 AI 为您的业务赋能</span>
          </h2>
          <p className={styles.sectionDesc}>
            无论您是个人开发者还是企业用户，我们都将为您提供专属解决方案。
          </p>
        </div>

        <div className={styles.layout}>
          {/* 联系信息 */}
          <div className={styles.info}>
            <h3>随时联系我们</h3>
            <div className={styles.infoItems}>
              <div className={styles.infoItem}>
                <div className={styles.infoItemIcon}>🌐</div>
                <div>
                  <div className={styles.infoItemTitle}>官方网站</div>
                  <div className={styles.infoItemVal}>
                    <a href="https://www.DongdianNow.com" target="_blank" rel="noreferrer">
                      www.DongdianNow.com
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoItemIcon}>💬</div>
                <div>
                  <div className={styles.infoItemTitle}>微信咨询</div>
                  <div className={styles.infoItemVal}>请通过官网表单留下联系方式，我们将主动添加您</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoItemIcon}>📧</div>
                <div>
                  <div className={styles.infoItemTitle}>商务邮箱</div>
                  <div className={styles.infoItemVal}>
                    <a href="mailto:bd@dongdiannow.com">bd@dongdiannow.com</a>
                  </div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoItemIcon}>🏢</div>
                <div>
                  <div className={styles.infoItemTitle}>公司全称</div>
                  <div className={styles.infoItemVal}>北京懂点科技有限公司</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoItemIcon}>⏰</div>
                <div>
                  <div className={styles.infoItemTitle}>响应时间</div>
                  <div className={styles.infoItemVal}>工作日 9:00–18:00，企业客户 7×24 响应</div>
                </div>
              </div>
            </div>
          </div>

          {/* 留资表单 */}
          <div className={styles.form}>
            {submitted ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}>✅</span>
                <h4>提交成功！</h4>
                <p>感谢您的咨询，我们将在 1 个工作日内联系您。</p>
              </div>
            ) : (
              <>
                <h3>免费获取解决方案</h3>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>您的姓名 *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>公司名称</label>
                    <input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="您的公司或项目名称"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>联系方式 *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="手机号或微信号"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>感兴趣的服务</label>
                    <select name="service" value={form.service} onChange={handleChange}>
                      <option value="">请选择服务类型</option>
                      <option value="token">AI Token 代理</option>
                      <option value="gpt">GPT 账号代充</option>
                      <option value="enterprise">企业定制接入</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>需求描述</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="简单描述您的需求，方便我们为您准备方案"
                      rows={4}
                    />
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    提交咨询 →
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
