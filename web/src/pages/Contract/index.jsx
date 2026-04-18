import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Empty,
  Modal,
  Spin,
  Tag,
  Tabs,
  Typography,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess, isAdmin, getSystemName } from '../../helpers';
import ContractManagement from '../Setting/Operation/ContractManagement';

const { Title, Text, Paragraph } = Typography;

const statusConfig = {
  pending: { color: 'amber', label: '待签署' },
  active:  { color: 'green', label: '生效中' },
  expired: { color: 'grey',  label: '已过期' },
  canceled:{ color: 'red',   label: '已取消' },
};

function formatDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function contractNo(id, createdAt) {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `CONTRACT-${year}-${String(id).padStart(4, '0')}`;
}

// ─── 合同正文模板 ──────────────────────────────────────────────
function ContractTemplate({ contract, userInfo, platformName, onSign, signLoading }) {
  const { t } = useTranslation();
  const isPending = contract.status === 'pending';
  const isSigned  = !!contract.signed_at;

  const startStr = contract.start_time ? formatDate(contract.start_time) : (isSigned ? formatDate(contract.signed_at) : t('签署之日'));
  const endStr   = contract.end_time   ? formatDate(contract.end_time)   : t('长期有效');
  const signedDateStr = contract.signed_at ? formatDate(contract.signed_at) : null;

  const boxStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '40px 48px',
    maxWidth: '720px',
    margin: '0 auto',
    background: '#fff',
    color: '#1a1a1a',
    fontFamily: '"SimSun", "宋体", serif',
    lineHeight: '2',
  };

  return (
    <div style={boxStyle}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '6px' }}>
          {contract.title || t('服务折扣协议')}
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          {t('合同编号')}：{contractNo(contract.id, contract.created_at)}
        </div>
      </div>

      {/* 双方信息 */}
      <div style={{ marginBottom: '24px', fontSize: '14px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>{t('甲方（服务提供方）')}</span>：{platformName}
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>{t('乙方（服务使用方）')}</span>：
          {contract.company_name
            ? <>{contract.company_name}<span style={{ color: '#999', fontSize: '13px', marginLeft: '6px' }}>({userInfo.display_name || userInfo.username})</span></>
            : userInfo.display_name || userInfo.username
          }
        </div>
      </div>

      <Divider style={{ margin: '20px 0' }} />

      {/* 正文 */}
      <div style={{ fontSize: '14px', marginBottom: '24px' }}>
        <p>
          {t('甲乙双方经友好协商，就甲方向乙方提供 API 服务折扣事宜，达成如下协议：')}
        </p>

        {/* 第一条：服务内容与折扣 */}
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>{t('第一条　服务内容与折扣条款')}</p>
        <p style={{ paddingLeft: '16px' }}>
          {contract.remark
            ? contract.remark
            : t('甲方同意按协议约定价格向乙方提供 API 调用服务，具体折扣以双方确认为准。')}
        </p>

        {/* 第二条：有效期 */}
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>{t('第二条　合同有效期')}</p>
        <p style={{ paddingLeft: '16px' }}>
          {t('本协议有效期自')} <strong>{startStr}</strong> {t('至')} <strong>{endStr}</strong>。
          {t('合同到期后，乙方享有的折扣优惠自动失效，价格恢复标准定价。')}
        </p>

        {/* 第三条：权利与义务 */}
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>{t('第三条　双方权利与义务')}</p>
        <p style={{ paddingLeft: '16px' }}>
          {t('1. 甲方有义务在合同有效期内按约定折扣提供服务。')}<br />
          {t('2. 乙方应遵守平台服务协议，不得滥用折扣权益。')}<br />
          {t('3. 乙方不得将折扣权益转让给第三方。')}
        </p>

        {/* 第四条：协议变更 */}
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>{t('第四条　协议变更与终止')}</p>
        <p style={{ paddingLeft: '16px' }}>
          {t('如乙方违反平台使用条款，甲方有权提前终止本协议。协议终止后，乙方不再享受折扣权益。')}
        </p>

        {/* 第五条：争议解决 */}
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>{t('第五条　争议解决')}</p>
        <p style={{ paddingLeft: '16px' }}>
          {t('双方如发生争议，应友好协商解决；协商不成，依据中国相关法律法规处理。')}
        </p>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      {/* 签署区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '14px' }}>
        {/* 甲方 */}
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>{t('甲方签章')}</div>
          <div style={{ marginBottom: '8px' }}>{platformName}</div>
          <div
            style={{
              display: 'inline-block',
              width: '80px',
              height: '80px',
              border: '2px solid #c0392b',
              borderRadius: '50%',
              color: '#c0392b',
              fontSize: '11px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: '76px',
              letterSpacing: '1px',
              marginBottom: '8px',
              userSelect: 'none',
            }}
          >
            {platformName.slice(0, 4)}
          </div>
          <div style={{ color: '#666', fontSize: '13px' }}>
            {t('日期')}：{formatDate(contract.created_at) || '—'}
          </div>
        </div>

        {/* 乙方 */}
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>{t('乙方签章')}</div>
          <div style={{ marginBottom: '8px' }}>{userInfo.display_name || userInfo.username}</div>
          {isSigned ? (
            <>
              <div
                style={{
                  display: 'inline-block',
                  width: '80px',
                  height: '80px',
                  border: '2px solid #c0392b',
                  borderRadius: '50%',
                  color: '#c0392b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: '76px',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  userSelect: 'none',
                }}
              >
                {(userInfo.display_name || userInfo.username || '').slice(0, 4)}
              </div>
              <div style={{ color: '#666', fontSize: '13px' }}>
                {t('签署日期')}：{signedDateStr}
              </div>
            </>
          ) : (
            <div style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>
              {t('（待签署）')}
            </div>
          )}
        </div>
      </div>

      {/* 签署按钮 */}
      {isPending && onSign && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button type='primary' size='large' loading={signLoading} onClick={onSign}>
            {t('确认签署本合同')}
          </Button>
          <div style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>
            {t('点击签署即表示您已阅读并同意本协议全部条款')}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 合同卡片 ──────────────────────────────────────────────────
const ContractCard = ({ contract, onSign, onView }) => {
  const { t } = useTranslation();
  const cfg = statusConfig[contract.status] || statusConfig.pending;

  return (
    <Card
      style={{
        marginBottom: '16px',
        borderRadius: '12px',
        border: '1px solid var(--semi-color-border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Text
              strong
              style={{ fontSize: '16px', cursor: 'pointer', color: 'var(--semi-color-primary)' }}
              onClick={() => onView(contract)}
            >
              {contract.title}
            </Text>
            <Tag color={cfg.color} size='small'>{t(cfg.label)}</Tag>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            <div>
              <Text type='secondary' size='small'>{t('有效期')}</Text>
              <div>
                <Text size='small'>
                  {contract.start_time ? formatDate(contract.start_time) : t('签署后生效')}
                  {' ~ '}
                  {contract.end_time ? formatDate(contract.end_time) : t('长期有效')}
                </Text>
              </div>
            </div>
            {contract.signed_at && (
              <div>
                <Text type='secondary' size='small'>{t('签署时间')}</Text>
                <div><Text size='small'>{formatDate(contract.signed_at)}</Text></div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button size='small' onClick={() => onView(contract)}>
            {t('查看合同')}
          </Button>
          {contract.status === 'pending' && (
            <Button type='primary' size='small' onClick={() => onView(contract)}>
              {t('签署确认')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// ─── 主页面 ────────────────────────────────────────────────────
const Contract = () => {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingContract, setViewingContract] = useState(null);
  const [signLoading, setSignLoading] = useState(false);

  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const platformName = getSystemName();

  const loadContracts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/contract');
      const { success, data, message } = res.data;
      if (success) setContracts(data || []);
      else showError(message);
    } catch { showError(t('加载失败')); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadContracts(); }, []);

  const handleConfirmSign = async () => {
    if (!viewingContract) return;
    setSignLoading(true);
    try {
      const res = await API.post(`/api/user/contract/${viewingContract.id}/sign`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('签署成功'));
        setViewingContract(null);
        await loadContracts();
      } else {
        showError(message);
      }
    } catch { showError(t('签署失败，请重试')); }
    finally { setSignLoading(false); }
  };

  return (
    <div className='w-full max-w-5xl mx-auto mt-[60px] px-2'>
      {/* 合同正文弹窗 */}
      <Modal
        visible={!!viewingContract}
        onCancel={() => setViewingContract(null)}
        footer={null}
        width={780}
        centered
        title={null}
        bodyStyle={{ padding: '24px 16px', maxHeight: '80vh', overflowY: 'auto' }}
      >
        {viewingContract && (
          <ContractTemplate
            contract={viewingContract}
            userInfo={userInfo}
            platformName={platformName}
            onSign={viewingContract.status === 'pending' ? handleConfirmSign : null}
            signLoading={signLoading}
          />
        )}
      </Modal>

      {isAdmin() ? (
        <Tabs type='card'>
          <Tabs.TabPane tab={t('我的合同')} itemKey='mine'>
            <UserContractList
              contracts={contracts}
              loading={loading}
              onView={setViewingContract}
              t={t}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('合同管理')} itemKey='manage'>
            <ContractManagement />
          </Tabs.TabPane>
        </Tabs>
      ) : (
        <>
          <Title heading={3} style={{ marginBottom: '24px' }}>{t('我的合同')}</Title>
          <UserContractList
            contracts={contracts}
            loading={loading}
            onView={setViewingContract}
            t={t}
          />
        </>
      )}
    </div>
  );
};

// ─── 合同列表 ──────────────────────────────────────────────────
function UserContractList({ contracts, loading, onView, t }) {
  const pending = contracts.filter((c) => c.status === 'pending');
  const active  = contracts.filter((c) => c.status === 'active');
  const others  = contracts.filter((c) => c.status !== 'pending' && c.status !== 'active');

  return (
    <Spin spinning={loading}>
      {contracts.length === 0 && !loading ? (
        <Empty
          title={t('暂无合同')}
          description={t('当前没有任何合同记录')}
          style={{ padding: '60px 0' }}
        />
      ) : (
        <div>
          {pending.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ fontSize: '14px', color: 'var(--semi-color-warning)', marginBottom: '12px', display: 'block' }}>
                {t('待签署')} ({pending.length})
              </Text>
              {pending.map((c) => <ContractCard key={c.id} contract={c} onView={onView} />)}
            </div>
          )}
          {active.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ fontSize: '14px', color: 'var(--semi-color-success)', marginBottom: '12px', display: 'block' }}>
                {t('生效中')} ({active.length})
              </Text>
              {active.map((c) => <ContractCard key={c.id} contract={c} onView={onView} />)}
            </div>
          )}
          {others.length > 0 && (
            <div>
              <Text strong style={{ fontSize: '14px', color: 'var(--semi-color-text-2)', marginBottom: '12px', display: 'block' }}>
                {t('历史合同')} ({others.length})
              </Text>
              {others.map((c) => <ContractCard key={c.id} contract={c} onView={onView} />)}
            </div>
          )}
        </div>
      )}
    </Spin>
  );
}

export default Contract;
