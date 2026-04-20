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
import { Button, Form, Row, Col, Typography, Spin, Input, InputNumber, Popconfirm } from '@douyinfe/semi-ui';
const { Text } = Typography;
import { IconDeleteStroked, IconPlusCircleStroked } from '@douyinfe/semi-icons';
import {
  API,
  removeTrailingSlash,
  showError,
  showSuccess,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';
import KVEditor from '../../../components/settings/editors/KVEditor';
import ArrayEditor from '../../../components/settings/editors/ArrayEditor';

/* ── 充值方式内联编辑器 ─────────────────────────────────────────────── */
const PAY_HEADER = {
  fontSize: 12, color: 'var(--semi-color-text-2)', fontWeight: 600,
  padding: '0 4px', userSelect: 'none',
};

function PayMethodsEditor({ label, value, onChange }) {
  const { t } = useTranslation();
  const lastRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (value === lastRef.current) return;
    try {
      const arr = JSON.parse(value || '[]');
      if (!Array.isArray(arr)) { setRows([]); return; }
      setRows(arr.map((item, i) => ({ id: `${i}_${item.type || i}`, ...item })));
    } catch { setRows([]); }
  }, [value]);

  function serialize(newRows) {
    const arr = newRows.map(({ id: _id, ...rest }) => rest);
    const json = JSON.stringify(arr, null, 2);
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
    setRows((prev) => [...prev, { id: `new_${Date.now()}`, color: '', name: '', type: '', min_topup: '' }]);
  }

  function removeRow(id) {
    setRows((prev) => { const next = prev.filter((r) => r.id !== id); serialize(next); return next; });
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>}
      {rows.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 4, paddingRight: 36 }}>
          <div style={{ ...PAY_HEADER, width: 160 }}>* {t('类型(type)')}</div>
          <div style={{ ...PAY_HEADER, width: 120 }}>* {t('显示名称')}</div>
          <div style={{ ...PAY_HEADER, flex: 1 }}>{t('颜色(CSS)')}</div>
          <div style={{ ...PAY_HEADER, width: 110 }}>{t('最低充值额')}</div>
        </div>
      )}
      {rows.map((row) => (
        <div key={row.id} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
          <Input value={row.type} placeholder='alipay' onChange={(v) => update(row.id, 'type', v)} style={{ width: 160 }} />
          <Input value={row.name} placeholder={t('支付宝')} onChange={(v) => update(row.id, 'name', v)} style={{ width: 120 }} />
          <Input value={row.color} placeholder='rgba(var(--semi-blue-5), 1)' onChange={(v) => update(row.id, 'color', v)} style={{ flex: 1 }} />
          <InputNumber value={row.min_topup ? Number(row.min_topup) : undefined} placeholder={t('可选')} min={0} onChange={(v) => update(row.id, 'min_topup', v != null ? String(v) : '')} style={{ width: 110 }} />
          <Popconfirm title={t('确认删除？')} okText={t('删除')} okButtonProps={{ type: 'danger' }} onConfirm={() => removeRow(row.id)}>
            <Button icon={<IconDeleteStroked />} type='tertiary' size='small' style={{ color: 'var(--semi-color-danger)' }} />
          </Popconfirm>
        </div>
      ))}
      <Button icon={<IconPlusCircleStroked />} type='tertiary' size='small' onClick={addRow} style={{ marginTop: 4 }}>
        {t('+ 添加充值方式')}
      </Button>
    </div>
  );
}

export default function SettingsPaymentGateway(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    PayAddress: '',
    EpayId: '',
    EpayKey: '',
    Price: 7.3,
    MinTopUp: 1,
    TopupGroupRatio: '',
    CustomCallbackAddress: '',
    PayMethods: '',
    AmountOptions: '',
    AmountDiscount: '',
    CorpPayCompanyName: '',
    CorpPayTaxNumber: '',
    CorpPayBankName: '',
    CorpPayBankAccount: '',
    CorpPayBankBranch: '',
  });
  const [originInputs, setOriginInputs] = useState({});
  const formApiRef = useRef(null);

  useEffect(() => {
    if (props.options && formApiRef.current) {
      const currentInputs = {
        PayAddress: props.options.PayAddress || '',
        EpayId: props.options.EpayId || '',
        EpayKey: props.options.EpayKey || '',
        Price:
          props.options.Price !== undefined
            ? parseFloat(props.options.Price)
            : 7.3,
        MinTopUp:
          props.options.MinTopUp !== undefined
            ? parseFloat(props.options.MinTopUp)
            : 1,
        TopupGroupRatio: props.options.TopupGroupRatio || '',
        CustomCallbackAddress: props.options.CustomCallbackAddress || '',
        PayMethods: props.options.PayMethods || '',
        AmountOptions: props.options.AmountOptions || '',
        AmountDiscount: props.options.AmountDiscount || '',
        CorpPayCompanyName: props.options.CorpPayCompanyName || '',
        CorpPayTaxNumber: props.options.CorpPayTaxNumber || '',
        CorpPayBankName: props.options.CorpPayBankName || '',
        CorpPayBankAccount: props.options.CorpPayBankAccount || '',
        CorpPayBankBranch: props.options.CorpPayBankBranch || '',
      };

    // 美化 JSON 展示（保留，供历史数据首次加载）
    try {
      if (currentInputs.AmountOptions) {
        currentInputs.AmountOptions = JSON.stringify(
          JSON.parse(currentInputs.AmountOptions),
          null,
          2,
        );
      }
    } catch {}
    try {
      if (currentInputs.AmountDiscount) {
        currentInputs.AmountDiscount = JSON.stringify(
          JSON.parse(currentInputs.AmountDiscount),
          null,
          2,
        );
      }
    } catch {}

      setInputs(currentInputs);
      setOriginInputs({ ...currentInputs });
      formApiRef.current.setValues(currentInputs);
    }
  }, [props.options]);

  const handleFormChange = (values) => {
    setInputs(values);
  };

  const submitPayAddress = async () => {
    if (props.options.ServerAddress === '') {
      showError(t('请先填写服务器地址'));
      return;
    }

    if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
      // KVEditor 始终产生合法 JSON，无需二次校验
    }
    
    if (originInputs['PayMethods'] !== inputs.PayMethods) {
      // PayMethodsEditor 始终产生合法 JSON
    }
    
    if (
      originInputs['AmountOptions'] !== inputs.AmountOptions &&
      inputs.AmountOptions && inputs.AmountOptions.trim() !== ''
    ) {
      // ArrayEditor 始终产生合法 JSON
    }
    
    if (
      originInputs['AmountDiscount'] !== inputs.AmountDiscount &&
      inputs.AmountDiscount && inputs.AmountDiscount.trim() !== ''
    ) {
      // KVEditor 始终产生合法 JSON
    }

    setLoading(true);
    try {
      const options = [
        { key: 'PayAddress', value: removeTrailingSlash(inputs.PayAddress) },
      ];

      if (inputs.EpayId !== '') {
        options.push({ key: 'EpayId', value: inputs.EpayId });
      }
      if (inputs.EpayKey !== undefined && inputs.EpayKey !== '') {
        options.push({ key: 'EpayKey', value: inputs.EpayKey });
      }
      if (inputs.Price !== '') {
        options.push({ key: 'Price', value: inputs.Price.toString() });
      }
      if (inputs.MinTopUp !== '') {
        options.push({ key: 'MinTopUp', value: inputs.MinTopUp.toString() });
      }
      if (inputs.CustomCallbackAddress !== '') {
        options.push({
          key: 'CustomCallbackAddress',
          value: inputs.CustomCallbackAddress,
        });
      }
      if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
        options.push({ key: 'TopupGroupRatio', value: inputs.TopupGroupRatio });
      }
      if (originInputs['PayMethods'] !== inputs.PayMethods) {
        options.push({ key: 'PayMethods', value: inputs.PayMethods });
      }
      if (originInputs['AmountOptions'] !== inputs.AmountOptions) {
        options.push({
          key: 'payment_setting.amount_options',
          value: inputs.AmountOptions,
        });
      }
      if (originInputs['AmountDiscount'] !== inputs.AmountDiscount) {
        options.push({
          key: 'payment_setting.amount_discount',
          value: inputs.AmountDiscount,
        });
      }
      // 对公付款信息
      options.push({ key: 'CorpPayCompanyName', value: inputs.CorpPayCompanyName || '' });
      options.push({ key: 'CorpPayTaxNumber',   value: inputs.CorpPayTaxNumber   || '' });
      options.push({ key: 'CorpPayBankName',    value: inputs.CorpPayBankName    || '' });
      options.push({ key: 'CorpPayBankAccount', value: inputs.CorpPayBankAccount || '' });
      options.push({ key: 'CorpPayBankBranch',  value: inputs.CorpPayBankBranch  || '' });

      // 发送请求
      const requestQueue = options.map((opt) =>
        API.put('/api/option/', {
          key: opt.key,
          value: opt.value,
        }),
      );

      const results = await Promise.all(requestQueue);

      // 检查所有请求是否成功
      const errorResults = results.filter((res) => !res.data.success);
      if (errorResults.length > 0) {
        errorResults.forEach((res) => {
          showError(res.data.message);
        });
      } else {
        showSuccess(t('更新成功'));
        // 更新本地存储的原始值
        setOriginInputs({ ...inputs });
        props.refresh && props.refresh();
      }
    } catch (error) {
      showError(t('更新失败'));
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <Form
        initValues={inputs}
        onValueChange={handleFormChange}
        getFormApi={(api) => (formApiRef.current = api)}
      >
        <Form.Section text={t('支付设置')}>
          <Text>
            {t(
              '（当前仅支持易支付接口，默认使用上方服务器地址作为回调地址！）',
            )}
          </Text>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='PayAddress'
                label={t('支付地址')}
                placeholder={t('例如：https://yourdomain.com')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='EpayId'
                label={t('易支付商户ID')}
                placeholder={t('例如：0001')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='EpayKey'
                label={t('易支付商户密钥')}
                placeholder={t('敏感信息不会发送到前端显示')}
                type='password'
              />
            </Col>
          </Row>
          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
            style={{ marginTop: 16 }}
          >
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='CustomCallbackAddress'
                label={t('回调地址')}
                placeholder={t('例如：https://yourdomain.com')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.InputNumber
                field='Price'
                precision={2}
                label={t('充值价格（x元/美金）')}
                placeholder={t('例如：7，就是7元/美金')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.InputNumber
                field='MinTopUp'
                label={t('最低充值美元数量')}
                placeholder={t('例如：2，就是最低充值2$')}
              />
            </Col>
          </Row>
          <KVEditor
            label={t('充値分组倍率')}
            keyLabel={t('分组名')}
            valueLabel={t('倍率')}
            keyPlaceholder='default'
            value={inputs.TopupGroupRatio}
            onChange={(v) => setInputs((prev) => ({ ...prev, TopupGroupRatio: v }))}
          />
          <PayMethodsEditor
            label={t('充値方式设置')}
            value={inputs.PayMethods}
            onChange={(v) => setInputs((prev) => ({ ...prev, PayMethods: v }))}
          />

          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
            style={{ marginTop: 16 }}
          >
            <Col span={24}>
              <ArrayEditor
                label={t('自定义充値数量选项')}
                valueType='number'
                placeholder='100'
                columnLabel={t('充値金额（元）')}
                extraText={t(
                  '设置用户可选择的充値数量选项，例如：[10, 20, 50, 100, 200, 500]',
                )}
                value={inputs.AmountOptions}
                onChange={(v) => setInputs((prev) => ({ ...prev, AmountOptions: v }))}
              />
            </Col>
          </Row>

          <Row
            gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}
            style={{ marginTop: 16 }}
          >
            <Col span={24}>
              <KVEditor
                label={t('充値金额折扣配置')}
                keyLabel={t('充値金额（元）')}
                valueLabel={t('折扣率（如 0.95）')}
                keyPlaceholder='100'
                maxKeyWidth={130}
                maxValueWidth={130}
                extraText={t(
                  '键为充値金额，值为折扣率，例如：{"100": 0.95, "200": 0.9, "500": 0.85}',
                )}
                value={inputs.AmountDiscount}
                onChange={(v) => setInputs((prev) => ({ ...prev, AmountDiscount: v }))}
              />
            </Col>
          </Row>

          <Button onClick={submitPayAddress}>{t('更新支付设置')}</Button>
        </Form.Section>

        <Form.Section text={t('对公付款')}>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Input
                field='CorpPayCompanyName'
                label={t('公司名称')}
                placeholder={t('例如：XX科技有限公司')}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Input
                field='CorpPayTaxNumber'
                label={t('统一社会信用代码（税号）')}
                placeholder={t('18位统一社会信用代码')}
              />
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }} style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='CorpPayBankName'
                label={t('开户银行')}
                placeholder={t('例如：中国工商银行')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='CorpPayBankBranch'
                label={t('开户行支行')}
                placeholder={t('例如：上海市浦东新区支行')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='CorpPayBankAccount'
                label={t('银行账号')}
                placeholder={t('收款账号')}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16 }}>
            <Button onClick={submitPayAddress}>{t('更新对公付款信息')}</Button>
          </div>
        </Form.Section>
      </Form>
    </Spin>
  );
}
