/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState, useRef } from 'react';
import { Button, Col, Form, Input, InputNumber, Popconfirm, Row, Spin } from '@douyinfe/semi-ui';
import { IconDeleteStroked, IconPlusCircleStroked } from '@douyinfe/semi-icons';
import {
  compareObjects,
  API,
  showError,
  showSuccess,
  showWarning,
  verifyJSON,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';

/* ── 分组速率限制内联编辑器: { groupName: [maxReq, maxComp] } ──────────── */
const RL_HEADER = {
  fontSize: 12, color: 'var(--semi-color-text-2)', fontWeight: 600,
  padding: '0 4px', userSelect: 'none',
};

function RateLimitGroupEditor({ value, onChange }) {
  const { t } = useTranslation();
  const lastRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (value === lastRef.current) return;
    try {
      const obj = JSON.parse(value || '{}');
      setRows(
        Object.entries(obj).map(([k, v], i) => ({
          id: `${i}_${k}`,
          group: k,
          max_req: Array.isArray(v) ? v[0] : 0,
          max_comp: Array.isArray(v) ? v[1] : 0,
        }))
      );
    } catch { setRows([]); }
  }, [value]);

  function serialize(newRows) {
    const obj = {};
    newRows.forEach(({ group, max_req, max_comp }) => {
      if (!group) return;
      obj[group] = [Number(max_req) || 0, Number(max_comp) || 1];
    });
    const json = JSON.stringify(obj, null, 2);
    lastRef.current = json;
    onChange?.(json);
  }

  function update(id, field, val) {
    setRows((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, [field]: val } : r);
      serialize(next);
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, { id: `new_${Date.now()}`, group: '', max_req: 200, max_comp: 100 }]);
  }

  function removeRow(id) {
    setRows((prev) => { const next = prev.filter((r) => r.id !== id); serialize(next); return next; });
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {rows.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 4, paddingRight: 36 }}>
          <div style={{ ...RL_HEADER, width: 160 }}>* {t('分组名')}</div>
          <div style={{ ...RL_HEADER, width: 130 }}>* {t('最多请求次数')}</div>
          <div style={{ ...RL_HEADER, width: 130 }}>* {t('最多完成次数')}</div>
        </div>
      )}
      {rows.map((row) => (
        <div key={row.id} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
          <Input value={row.group} placeholder='default' onChange={(v) => update(row.id, 'group', v)} onBlur={() => serialize(rows)} style={{ width: 160 }} />
          <InputNumber value={row.max_req} min={0} step={10} onChange={(v) => update(row.id, 'max_req', v ?? 0)} style={{ width: 130 }} />
          <InputNumber value={row.max_comp} min={1} step={10} onChange={(v) => update(row.id, 'max_comp', v ?? 1)} style={{ width: 130 }} />
          <Popconfirm title={t('确认删除？')} okText={t('删除')} okButtonProps={{ type: 'danger' }} onConfirm={() => removeRow(row.id)}>
            <Button icon={<IconDeleteStroked />} type='tertiary' size='small' style={{ color: 'var(--semi-color-danger)' }} />
          </Popconfirm>
        </div>
      ))}
      <Button icon={<IconPlusCircleStroked />} type='tertiary' size='small' onClick={addRow} style={{ marginTop: 4 }}>
        {t('+ 添加分组')}
      </Button>
    </div>
  );
}

export default function RequestRateLimit(props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    ModelRequestRateLimitEnabled: false,
    ModelRequestRateLimitCount: -1,
    ModelRequestRateLimitSuccessCount: 1000,
    ModelRequestRateLimitDurationMinutes: 1,
    ModelRequestRateLimitGroup: '',
  });
  const refForm = useRef();
  const [inputsRow, setInputsRow] = useState(inputs);

  function onSubmit() {
    const updateArray = compareObjects(inputs, inputsRow);
    if (!updateArray.length) return showWarning(t('你似乎并没有修改什么'));
    const requestQueue = updateArray.map((item) => {
      let value = '';
      if (typeof inputs[item.key] === 'boolean') {
        value = String(inputs[item.key]);
      } else {
        value = inputs[item.key];
      }
      return API.put('/api/option/', {
        key: item.key,
        value,
      });
    });
    setLoading(true);
    Promise.all(requestQueue)
      .then((res) => {
        if (requestQueue.length === 1) {
          if (res.includes(undefined)) return;
        } else if (requestQueue.length > 1) {
          if (res.includes(undefined))
            return showError(t('部分保存失败，请重试'));
        }

        for (let i = 0; i < res.length; i++) {
          if (!res[i].data.success) {
            return showError(res[i].data.message);
          }
        }

        showSuccess(t('保存成功'));
        props.refresh();
      })
      .catch(() => {
        showError(t('保存失败，请重试'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const currentInputs = {};
    for (let key in props.options) {
      if (Object.keys(inputs).includes(key)) {
        currentInputs[key] = props.options[key];
      }
    }
    setInputs(currentInputs);
    setInputsRow(structuredClone(currentInputs));
    refForm.current.setValues(currentInputs);
  }, [props.options]);

  return (
    <>
      <Spin spinning={loading}>
        <Form
          values={inputs}
          getFormApi={(formAPI) => (refForm.current = formAPI)}
          style={{ marginBottom: 15 }}
        >
          <Form.Section text={t('模型请求速率限制')}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Switch
                  field={'ModelRequestRateLimitEnabled'}
                  label={t('启用用户模型请求速率限制（可能会影响高并发性能）')}
                  size='default'
                  checkedText='｜'
                  uncheckedText='〇'
                  onChange={(value) => {
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitEnabled: value,
                    });
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  label={t('限制周期')}
                  step={1}
                  min={0}
                  suffix={t('分钟')}
                  extraText={t('频率限制的周期（分钟）')}
                  field={'ModelRequestRateLimitDurationMinutes'}
                  onChange={(value) =>
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitDurationMinutes: String(value),
                    })
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  label={t('用户每周期最多请求次数')}
                  step={1}
                  min={0}
                  max={100000000}
                  suffix={t('次')}
                  extraText={t('包括失败请求的次数，0代表不限制')}
                  field={'ModelRequestRateLimitCount'}
                  onChange={(value) =>
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitCount: String(value),
                    })
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.InputNumber
                  label={t('用户每周期最多请求完成次数')}
                  step={1}
                  min={1}
                  max={100000000}
                  suffix={t('次')}
                  extraText={t('只包括请求成功的次数')}
                  field={'ModelRequestRateLimitSuccessCount'}
                  onChange={(value) =>
                    setInputs({
                      ...inputs,
                      ModelRequestRateLimitSuccessCount: String(value),
                    })
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={16}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('分组速率限制')}</div>
                <RateLimitGroupEditor
                  value={inputs.ModelRequestRateLimitGroup}
                  onChange={(v) => setInputs({ ...inputs, ModelRequestRateLimitGroup: v })}
                />
                <div style={{ fontSize: 12, color: 'var(--semi-color-text-2)', marginBottom: 12 }}>
                  {t('最多请求次数≥ 0；最多完成次数≥ 1；0 表示不限制请求次数。分组配置优先级高于全局。')}
                </div>
              </Col>
            </Row>
            <Row>
              <Button size='default' onClick={onSubmit}>
                {t('保存模型速率限制')}
              </Button>
            </Row>
          </Form.Section>
        </Form>
      </Spin>
    </>
  );
}
