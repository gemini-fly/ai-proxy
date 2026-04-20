/**
 * ArrayEditor — 内联行编辑器，用于替换 [item, ...] 格式的 JSON TextArea
 *
 * Props:
 *   value        {string}  JSON 字符串 e.g. '[10, 20, 50]' 或 '["a","b"]'
 *   onChange     {fn}      (newJsonString) => void
 *   valueType    {'number'|'string'} 默认 'string'
 *   placeholder  {string}
 *   addLabel     {string}
 *   label        {string}  整块标题
 *   extraText    {string|ReactNode}
 *   itemWidth    {number}  每项宽度 px，默认 number=120 / string=不限
 *   columnLabel  {string}  列头标题
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Popconfirm,
  Typography,
} from '@douyinfe/semi-ui';
import { IconDeleteStroked, IconPlusCircleStroked } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const HEADER = {
  fontSize: 12,
  color: 'var(--semi-color-text-2)',
  fontWeight: 600,
  padding: '0 4px',
  userSelect: 'none',
};

export default function ArrayEditor({
  value,
  onChange,
  valueType = 'string',
  placeholder,
  addLabel,
  label,
  extraText,
  itemWidth,
  columnLabel,
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const lastSerializedRef = useRef(null);

  useEffect(() => {
    if (value === lastSerializedRef.current) return;
    try {
      const arr = JSON.parse(value || '[]');
      if (!Array.isArray(arr)) { setRows([]); return; }
      setRows(arr.map((v, i) => ({ id: `${i}_${v}`, val: String(v) })));
    } catch {
      setRows([]);
    }
  }, [value]);

  function serialize(newRows) {
    const arr = newRows.map(({ val }) =>
      valueType === 'number' ? Number(val) || 0 : val,
    );
    const json = JSON.stringify(arr, null, 2);
    lastSerializedRef.current = json;
    onChange?.(json);
  }

  function updateRow(id, v) {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, val: v } : r));
      serialize(next);
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: `new_${Date.now()}`, val: valueType === 'number' ? '0' : '' },
    ]);
  }

  function removeRow(id) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      serialize(next);
      return next;
    });
  }

  const width = itemWidth ?? (valueType === 'number' ? 120 : 280);

  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
      )}

      {/* 表头 */}
      {rows.length > 0 && columnLabel && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 4, paddingRight: 36 }}>
          <div style={{ ...HEADER, width, flexShrink: 0 }}>
            {columnLabel}
          </div>
        </div>
      )}

      {/* 行列表 */}
      {rows.map((row) => (
        <div
          key={row.id}
          style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}
        >
          {valueType === 'number' ? (
            <InputNumber
              value={Number(row.val) || 0}
              step={1}
              min={0}
              placeholder={placeholder ?? '0'}
              onChange={(v) => updateRow(row.id, String(v ?? 0))}
              style={{ width, flexShrink: 0 }}
            />
          ) : (
            <Input
              value={row.val}
              placeholder={placeholder ?? t('输入内容')}
              onChange={(v) => updateRow(row.id, v)}
              style={{ width, flexShrink: 0 }}
            />
          )}
          <Popconfirm
            title={t('确认删除此行？')}
            okText={t('删除')}
            okButtonProps={{ type: 'danger' }}
            onConfirm={() => removeRow(row.id)}
          >
            <Button
              icon={<IconDeleteStroked />}
              type='tertiary'
              size='small'
              style={{ color: 'var(--semi-color-danger)', flexShrink: 0 }}
            />
          </Popconfirm>
        </div>
      ))}

      <Button
        icon={<IconPlusCircleStroked />}
        type='tertiary'
        size='small'
        onClick={addRow}
        style={{ marginTop: 4 }}
      >
        {addLabel ?? t('+ 添加')}
      </Button>

      {extraText && (
        <div style={{ marginTop: 8 }}>
          <Text type='secondary' style={{ fontSize: 12 }}>
            {extraText}
          </Text>
        </div>
      )}
    </div>
  );
}
