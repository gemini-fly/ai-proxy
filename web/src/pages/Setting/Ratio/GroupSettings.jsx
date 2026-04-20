import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Spin,
  Typography,
} from '@douyinfe/semi-ui';
import { IconDeleteStroked, IconPlusCircleStroked } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../helpers';

const { Text } = Typography;

/** 解析 GroupRatio + UserUsableGroups 为行列表 */
function parseGroups(groupRatioStr, userUsableGroupsStr) {
  let ratioMap = {};
  let descMap = {};
  try { ratioMap = JSON.parse(groupRatioStr || '{}'); } catch (_) {}
  try { descMap = JSON.parse(userUsableGroupsStr || '{}'); } catch (_) {}
  return Object.keys(ratioMap).map((name) => ({
    key: name,
    name,
    ratio: ratioMap[name] ?? 1,
    desc: descMap[name] ?? '',
  }));
}

/** 行列表序列化回两个配置项 */
function serializeGroups(rows) {
  const ratioMap = {};
  const descMap = {};
  rows.forEach(({ name, ratio, desc }) => {
    if (!name) return;
    ratioMap[name] = Number(ratio) || 1;
    if (desc) descMap[name] = desc;
  });
  return {
    GroupRatio: JSON.stringify(ratioMap, null, 2),
    UserUsableGroups: JSON.stringify(descMap, null, 2),
  };
}

const HEADER_STYLE = {
  fontSize: 12,
  color: 'var(--semi-color-text-2)',
  fontWeight: 600,
  padding: '0 8px',
};

const COL = {
  name:  { flex: '0 0 160px' },
  ratio: { flex: '0 0 110px' },
  desc:  { flex: '1 1 0' },
  del:   { flex: '0 0 36px', textAlign: 'center' },
};

export default function GroupSettings({ options, refresh }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (options) {
      setRows(parseGroups(options.GroupRatio, options.UserUsableGroups));
    }
  }, [options]);

  /* ---------- helpers ---------- */
  function updateRow(index, field, value) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: `__new_${Date.now()}`, name: '', ratio: 1, desc: '' },
    ]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------- save ---------- */
  async function handleSave() {
    // validate
    const names = rows.map((r) => r.name.trim()).filter(Boolean);
    if (names.length !== new Set(names).size) {
      showError(t('存在重复的分组名'));
      return;
    }
    for (const r of rows) {
      if (!r.name.trim()) {
        showError(t('存在未填写分组名的行，请填写或删除'));
        return;
      }
      if (!/^[a-zA-Z0-9_\-]+$/.test(r.name.trim())) {
        showError(t(`分组名「${r.name}」只允许字母、数字、下划线和连字符`));
        return;
      }
    }

    const { GroupRatio, UserUsableGroups } = serializeGroups(rows);
    setLoading(true);
    try {
      const results = await Promise.all([
        API.put('/api/option/', { key: 'GroupRatio', value: GroupRatio }),
        API.put('/api/option/', { key: 'UserUsableGroups', value: UserUsableGroups }),
      ]);
      for (const r of results) {
        if (!r?.data?.success) {
          showError(r?.data?.message || t('保存失败'));
          return;
        }
      }
      showSuccess(t('保存成功'));
      refresh?.();
    } catch {
      showError(t('保存失败，请重试'));
    } finally {
      setLoading(false);
    }
  }

  /* ---------- render ---------- */
  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: 780 }}>

        {/* 表头 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingRight: 8 }}>
          <div style={{ ...COL.name,  ...HEADER_STYLE }}>
            * {t('分组名')}
          </div>
          <div style={{ ...COL.ratio, ...HEADER_STYLE }}>
            * {t('倍率')}
          </div>
          <div style={{ ...COL.desc,  ...HEADER_STYLE }}>
            {t('描述（用户创建令牌时可见）')}
          </div>
          <div style={{ ...COL.del }} />
        </div>

        {/* 行列表 */}
        {rows.map((row, index) => (
          <div
            key={row.key}
            style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}
          >
            <div style={COL.name}>
              <Input
                value={row.name}
                placeholder={t('例如：vip')}
                onChange={(v) => updateRow(index, 'name', v)}
                disabled={!row.key.startsWith('__new_')}
              />
            </div>
            <div style={COL.ratio}>
              <InputNumber
                value={row.ratio}
                min={0}
                step={0.1}
                onChange={(v) => updateRow(index, 'ratio', v)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={COL.desc}>
              <Input
                value={row.desc}
                placeholder={t('可选，例如：VIP 用户')}
                onChange={(v) => updateRow(index, 'desc', v)}
              />
            </div>
            <div style={COL.del}>
              <Popconfirm
                title={t('确认删除此分组？')}
                okText={t('删除')}
                okButtonProps={{ type: 'danger' }}
                onConfirm={() => removeRow(index)}
              >
                <Button
                  icon={<IconDeleteStroked />}
                  type='tertiary'
                  size='small'
                  style={{ color: 'var(--semi-color-danger)' }}
                />
              </Popconfirm>
            </div>
          </div>
        ))}

        {/* 添加行 */}
        <div style={{ marginTop: 4, marginBottom: 20 }}>
          <Button
            icon={<IconPlusCircleStroked />}
            type='tertiary'
            size='small'
            onClick={addRow}
          >
            {t('+ 添加分组')}
          </Button>
        </div>

        {rows.length === 0 && (
          <Text type='tertiary' style={{ display: 'block', marginBottom: 16 }}>
            {t('暂无分组，点击「+ 添加分组」创建')}
          </Text>
        )}

        <Space>
          <Button type='primary' onClick={handleSave}>
            {t('保存分组设置')}
          </Button>
          <Text type='secondary' style={{ fontSize: 12 }}>
            {t('分组名仅支持字母、数字、下划线和连字符')}
          </Text>
        </Space>
      </div>
    </Spin>
  );
}
