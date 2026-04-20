/**
 * KVEditor — 内联行编辑器，用于替换 { key: value } 格式的 JSON TextArea
 *
 * Props:
 *   value          {string}  JSON 字符串 e.g. '{"vip":1,"default":1}'
 *   onChange       {fn}      (newJsonString) => void
 *   valueType      {'number'|'string'} 值类型，默认 'number'
 *   keyLabel       {string}  键列标题，默认 '键名'
 *   valueLabel     {string}  值列标题，默认 '值'
 *   keyPlaceholder {string}
 *   valuePlaceholder {string}
 *   addLabel       {string}  添加按钮文字
 *   label          {string}  整块标题（粗体）
 *   extraText      {string|ReactNode}  底部说明文字
 *   maxKeyWidth    {number}  键列宽度 px，默认 200
 *   maxValueWidth  {number}  值列宽度 px，默认 120（number）| 不限（string）
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

export default function KVEditor({
  value,
  onChange,
  valueType = 'number',
  keyLabel,
  valueLabel,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
  label,
  extraText,
  maxKeyWidth = 200,
  maxValueWidth,
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const lastSerializedRef = useRef(null);

  // ── 从外部 value 初始化 ──────────────────────────────────────────────
  useEffect(() => {
    if (value === lastSerializedRef.current) return; // 我们自己触发的，跳过
    try {
      const obj = JSON.parse(value || '{}');
      setRows(
        Object.entries(obj).map(([k, v], i) => ({
          id: `${i}_${k}`,
          key: k,
          val: String(v),
        })),
      );
    } catch {
      setRows([]);
    }
  }, [value]);

  // ── 序列化 & 触发 onChange ───────────────────────────────────────────
  function serialize(newRows) {
    const obj = {};
    newRows.forEach(({ key, val }) => {
      if (key.trim() === '') return;
      obj[key.trim()] = valueType === 'number' ? Number(val) || 0 : val;
    });
    const json = JSON.stringify(obj, null, 2);
    lastSerializedRef.current = json;
    onChange?.(json);
  }

  function updateRow(id, field, v) {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, [field]: v } : r));
      serialize(next);
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}`,
        key: '',
        val: valueType === 'number' ? '1' : '',
      },
    ]);
    // 新行还没有 key，不触发 onChange
  }

  function removeRow(id) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      serialize(next);
      return next;
    });
  }

  const valueWidth =
    maxValueWidth ?? (valueType === 'number' ? 120 : undefined);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 标题 */}
      {label && (
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
      )}

      {/* 表头 */}
      {rows.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 4,
            paddingRight: 36,
          }}
        >
          <div style={{ ...HEADER, width: maxKeyWidth, flexShrink: 0 }}>
            * {keyLabel ?? t('键名')}
          </div>
          <div
            style={{
              ...HEADER,
              width: valueWidth,
              flexShrink: 0,
              flex: valueWidth ? undefined : 1,
            }}
          >
            * {valueLabel ?? t('值')}
          </div>
        </div>
      )}

      {/* 行列表 */}
      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 6,
            alignItems: 'center',
          }}
        >
          <Input
            value={row.key}
            placeholder={keyPlaceholder ?? t('键')}
            onChange={(v) => updateRow(row.id, 'key', v)}
            onBlur={() => serialize(rows)}
            style={{ width: maxKeyWidth, flexShrink: 0 }}
          />
          {valueType === 'number' ? (
            <InputNumber
              value={Number(row.val) || 0}
              step={0.1}
              min={0}
              placeholder={valuePlaceholder ?? '1'}
              onChange={(v) => updateRow(row.id, 'val', String(v ?? 0))}
              style={{ width: valueWidth, flexShrink: 0 }}
            />
          ) : (
            <Input
              value={row.val}
              placeholder={valuePlaceholder ?? t('值')}
              onChange={(v) => updateRow(row.id, 'val', v)}
              style={
                valueWidth
                  ? { width: valueWidth, flexShrink: 0 }
                  : { flex: 1 }
              }
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

      {/* 添加按钮 */}
      <Button
        icon={<IconPlusCircleStroked />}
        type='tertiary'
        size='small'
        onClick={addRow}
        style={{ marginTop: 4 }}
      >
        {addLabel ?? t('+ 添加')}
      </Button>

      {/* 说明文字 */}
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
