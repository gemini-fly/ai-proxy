import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Card,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  DatePicker,
  Input,
} from '@douyinfe/semi-ui';
import { IconPlus, IconDelete, IconSearch } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../helpers';

const { Text } = Typography;

const statusConfig = {
  pending: { color: 'amber', label: '待签署' },
  active: { color: 'green', label: '生效中' },
  expired: { color: 'grey', label: '已过期' },
  canceled: { color: 'red', label: '已取消' },
};

function toRFC3339(date) {
  if (!date) return '';
  if (date instanceof Date) return date.toISOString();
  return new Date(date).toISOString();
}

export default function ContractManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [keyword, setKeyword] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const formApiRef = useRef(null);

  const [groupOptions, setGroupOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const loadContracts = async (p = page, kw = keyword) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, page_size: pageSize });
      if (kw) params.append('keyword', kw);
      const res = await API.get(`/api/contract/?${params.toString()}`);
      const { success, data, total: t, message } = res.data;
      if (success) {
        setContracts(data || []);
        setTotal(t || 0);
      } else {
        showError(message);
      }
    } catch (e) {
      showError(t('加载失败'));
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await API.get('/api/group/');
      if (res.data.success) {
        setGroupOptions((res.data.data || []).map((g) => ({ label: g, value: g })));
      }
    } catch (e) {
      // ignore
    }
  };

  const searchUsers = async (keyword) => {
    try {
      const res = await API.get(`/api/user/search?keyword=${encodeURIComponent(keyword)}&page_size=20`);
      if (res.data.success) {
        const items = res.data.data?.items || res.data.data || [];
        setUserOptions(
          items.map((u) => ({
            label: `${u.username}${u.display_name ? ' (' + u.display_name + ')' : ''}`,
            value: u.id,
          })),
        );
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadContracts(1);
    loadGroups();
    searchUsers(''); // 预加载用户列表
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await API.delete(`/api/contract/${id}`);
      if (res.data.success) {
        showSuccess(t('删除成功'));
        loadContracts(page);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      showError(t('删除失败'));
    }
  };

  const handleCreate = async () => {
    try {
      const values = await formApiRef.current?.validate();
      setCreateLoading(true);
      const payload = {
        user_id: values.user_id,
        title: values.title,
        group: values.group,
        company_name: values.company_name || '',
        remark: values.remark || '',
        start_time: values.start_time ? toRFC3339(values.start_time) : '',
        end_time: values.end_time ? toRFC3339(values.end_time) : '',
      };
      const res = await API.post('/api/contract/', payload);
      if (res.data.success) {
        showSuccess(t('创建成功'));
        setShowCreate(false);
        formApiRef.current?.reset();
        loadContracts(1);
        setPage(1);
      } else {
        showError(res.data.message);
      }
    } catch (e) {
      // validation error or request error
    } finally {
      setCreateLoading(false);
    }
  };

  const columns = [
    {
      title: t('公司名称'),
      dataIndex: 'company_name',
      render: (v) => v ? <Text>{v}</Text> : <Text type='tertiary'>—</Text>,
    },
    {
      title: t('合同标题'),
      dataIndex: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: t('用户'),
      render: (_, row) => (
        <div>
          <div>{row.username}</div>
          {row.display_name && (
            <Text type='secondary' size='small'>{row.display_name}</Text>
          )}
        </div>
      ),
    },
    {
      title: t('分组'),
      dataIndex: 'group',
      render: (g) => <Tag color='blue' size='small'>{g}</Tag>,
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      render: (s) => {
        const cfg = statusConfig[s] || statusConfig.pending;
        return <Tag color={cfg.color} size='small'>{t(cfg.label)}</Tag>;
      },
    },
    {
      title: t('有效期'),
      render: (_, row) => (
        <Text size='small'>
          {row.start_time ? new Date(row.start_time).toLocaleDateString('zh-CN') : '—'}
          {' ~ '}
          {row.end_time ? new Date(row.end_time).toLocaleDateString('zh-CN') : t('长期')}
        </Text>
      ),
    },
    {
      title: t('签署时间'),
      dataIndex: 'signed_at',
      render: (v) => v ? new Date(v).toLocaleDateString('zh-CN') : '—',
    },
    {
      title: t('创建时间'),
      dataIndex: 'created_at',
      render: (v) => v ? new Date(v).toLocaleDateString('zh-CN') : '—',
    },
    {
      title: t('操作'),
      render: (_, row) => (
        <Popconfirm
          title={t('确认删除此合同？')}
          onConfirm={() => handleDelete(row.id)}
          okText={t('删除')}
          cancelText={t('取消')}
        >
          <Button
            type='danger'
            size='small'
            icon={<IconDelete />}
          >
            {t('删除')}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <Input
          prefix={<IconSearch />}
          placeholder={t('搜索公司名称、合同标题或用户名')}
          value={keyword}
          onChange={(v) => setKeyword(v)}
          onEnterPress={() => { setPage(1); loadContracts(1, keyword); }}
          style={{ maxWidth: '320px' }}
          showClear
          onClear={() => { setKeyword(''); setPage(1); loadContracts(1, ''); }}
        />
        <Button
          type='primary'
          icon={<IconPlus />}
          onClick={() => setShowCreate(true)}
        >
          {t('新建合同')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contracts}
        loading={loading}
        rowKey='id'
        pagination={{
          total,
          pageSize,
          currentPage: page,
          onPageChange: (p) => {
            setPage(p);
            loadContracts(p, keyword);
          },
        }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={t('新建合同')}
        visible={showCreate}
        onOk={handleCreate}
        onCancel={() => { setShowCreate(false); formApiRef.current?.reset(); }}
        confirmLoading={createLoading}
        okText={t('创建')}
        cancelText={t('取消')}
        centered
        width={520}
      >
        <Form
          getFormApi={(api) => (formApiRef.current = api)}
          layout='vertical'
        >
          <Form.Select
            field='user_id'
            label={t('选择用户')}
            placeholder={t('搜索用户名')}
            filter
            remote
            onSearch={(v) => { setUserSearch(v); searchUsers(v); }}
            optionList={userOptions}
            rules={[{ required: true, message: t('请选择用户') }]}
            style={{ width: '100%' }}
          />
          <Form.Input
            field='title'
            label={t('合同标题')}
            placeholder={t('请输入合同标题')}
            rules={[{ required: true, message: t('请输入合同标题') }]}
          />
          <Form.Input
            field='company_name'
            label={t('乙方公司名称')}
            placeholder={t('对方公司全称（选填）')}
          />
          <Form.Select
            field='group'
            label={t('目标分组')}
            placeholder={t('签署后用户将切换到此分组')}
            optionList={groupOptions}
            rules={[{ required: true, message: t('请选择分组') }]}
            style={{ width: '100%' }}
          />
          <Form.DatePicker
            field='start_time'
            label={t('开始时间（可选，不填则签署时生效）')}
            style={{ width: '100%' }}
            type='dateTime'
          />
          <Form.DatePicker
            field='end_time'
            label={t('结束时间（可选，不填则长期有效）')}
            style={{ width: '100%' }}
            type='dateTime'
          />
          <Form.TextArea
            field='remark'
            label={t('备注')}
            placeholder={t('合同备注说明（选填）')}
            autosize={{ minRows: 2, maxRows: 5 }}
          />
        </Form>
      </Modal>
    </div>
  );
}
