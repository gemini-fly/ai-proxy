import React, { useMemo } from 'react';
import { Table, Tag, Progress, Typography, Empty } from '@douyinfe/semi-ui';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { renderQuota, timestamp2string } from '../../../helpers';

const { Text } = Typography;

// 进度条颜色
const getProgressColor = (pct) => {
  if (pct >= 90) return 'var(--semi-color-danger)';
  if (pct >= 70) return 'var(--semi-color-warning)';
  return 'var(--semi-color-success)';
};

// 状态 Tag
const renderStatus = (status, t) => {
  const map = {
    1: { color: 'green', label: t('已启用') },
    2: { color: 'red', label: t('已禁用') },
    3: { color: 'yellow', label: t('已过期') },
    4: { color: 'grey', label: t('已耗尽') },
  };
  const cfg = map[status] || { color: 'black', label: t('未知') };
  return (
    <Tag color={cfg.color} shape='circle' size='small'>
      {cfg.label}
    </Tag>
  );
};

const TokensEmployeeStats = ({ tokens = [], t }) => {
  // 按已用额度降序排列，并在末尾插入合计行
  const tableData = useMemo(() => {
    const sorted = [...tokens].sort(
      (a, b) => (b.used_quota || 0) - (a.used_quota || 0),
    );

    const totalUsed = tokens.reduce((s, tk) => s + (tk.used_quota || 0), 0);
    const totalRemain = tokens.reduce(
      (s, tk) => s + (tk.unlimited_quota ? 0 : tk.remain_quota || 0),
      0,
    );

    const summaryRow = {
      id: '__summary__',
      name: t('合计'),
      status: null,
      used_quota: totalUsed,
      remain_quota: totalRemain,
      unlimited_quota: false,
      accessed_time: null,
      _isSummary: true,
    };

    return [...sorted, summaryRow];
  }, [tokens, t]);

  const columns = [
    {
      title: t('员工 / 令牌名称'),
      dataIndex: 'name',
      render: (text, record) =>
        record._isSummary ? (
          <Text strong style={{ color: 'var(--semi-color-primary)' }}>
            {text}
          </Text>
        ) : (
          <Text>{text}</Text>
        ),
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      render: (text, record) =>
        record._isSummary ? null : renderStatus(text, t),
    },
    {
      title: t('已用额度'),
      dataIndex: 'used_quota',
      render: (text, record) => {
        const val = renderQuota(text || 0);
        return record._isSummary ? (
          <Text strong style={{ color: 'var(--semi-color-primary)' }}>
            {val}
          </Text>
        ) : (
          <Text>{val}</Text>
        );
      },
    },
    {
      title: t('剩余额度'),
      dataIndex: 'remain_quota',
      render: (text, record) => {
        if (record._isSummary) {
          return (
            <Text strong style={{ color: 'var(--semi-color-primary)' }}>
              {renderQuota(text || 0)}
            </Text>
          );
        }
        if (record.unlimited_quota) {
          return (
            <Tag color='blue' shape='circle' size='small'>
              {t('无限额度')}
            </Tag>
          );
        }
        return <Text>{renderQuota(text || 0)}</Text>;
      },
    },
    {
      title: t('使用进度'),
      key: 'progress',
      render: (_, record) => {
        if (record._isSummary || record.unlimited_quota) return null;
        const used = record.used_quota || 0;
        const remain = record.remain_quota || 0;
        const total = used + remain;
        if (total === 0) {
          return (
            <Text type='tertiary' size='small'>
              {t('未使用')}
            </Text>
          );
        }
        const pct = Math.round((used / total) * 100);
        return (
          <div style={{ width: 120 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              <span>{pct}%</span>
            </div>
            <Progress
              percent={pct}
              stroke={getProgressColor(pct)}
              size='small'
              aria-label='usage'
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: t('最后使用时间'),
      dataIndex: 'accessed_time',
      render: (text, record) => {
        if (record._isSummary) return null;
        if (!text || text === 0) {
          return (
            <Text type='tertiary' size='small'>
              {t('从未使用')}
            </Text>
          );
        }
        return <Text size='small'>{timestamp2string(text)}</Text>;
      },
    },
  ];

  if (tokens.length === 0) {
    return (
      <Empty
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={
          <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
        }
        description={t('暂无令牌数据，请先创建令牌作为员工账号')}
        style={{ padding: 40 }}
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey='id'
      pagination={false}
      size='middle'
      bordered
      rowStyle={(record) =>
        record._isSummary
          ? {
              background: 'var(--semi-color-primary-light-default)',
              fontWeight: 600,
            }
          : undefined
      }
    />
  );
};

export default TokensEmployeeStats;
