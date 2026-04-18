import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
  Spin,
  Switch,
  Typography,
} from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../helpers';

const { Text } = Typography;

export default function SettingsPaymentBankAccount(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    enabled: false,
    company_name: '',
    bank_name: '',
    account_no: '',
    bank_branch: '',
    remark: '',
  });
  const formApiRef = useRef(null);

  useEffect(() => {
    if (props.options && formApiRef.current) {
      const toBoolean = (v) => v === true || v === 'true';
      const cur = {
        enabled: toBoolean(props.options['bank_account_setting.enabled']),
        company_name: props.options['bank_account_setting.company_name'] || '',
        bank_name: props.options['bank_account_setting.bank_name'] || '',
        account_no: props.options['bank_account_setting.account_no'] || '',
        bank_branch: props.options['bank_account_setting.bank_branch'] || '',
        remark: props.options['bank_account_setting.remark'] || '',
      };
      setInputs(cur);
      formApiRef.current.setValues(cur);
    }
  }, [props.options]);

  const handleFormChange = (values) => {
    setInputs((prev) => ({ ...prev, ...values }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const fields = [
        { key: 'bank_account_setting.enabled', value: inputs.enabled },
        { key: 'bank_account_setting.company_name', value: inputs.company_name },
        { key: 'bank_account_setting.bank_name', value: inputs.bank_name },
        { key: 'bank_account_setting.account_no', value: inputs.account_no },
        { key: 'bank_account_setting.bank_branch', value: inputs.bank_branch },
        { key: 'bank_account_setting.remark', value: inputs.remark },
      ];

      for (const field of fields) {
        const res = await API.put('/api/option/', {
          key: field.key,
          value: String(field.value),
        });
        if (!res.data.success) {
          showError(res.data.message || t('保存失败'));
          return;
        }
      }
      showSuccess(t('对公账户设置已保存'));
    } catch (e) {
      showError(t('保存失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        initValues={inputs}
        onValueChange={handleFormChange}
        getFormApi={(api) => (formApiRef.current = api)}
      >
        <Form.Section text={t('对公账户设置')}>
          <Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
            {t(
              '启用后，用户在钱包管理页面可以看到对公汇款账户信息，适用于企业客户对公打款',
            )}
          </Text>

          <Row gutter={{ xs: 8, sm: 16, md: 24 }} style={{ marginBottom: 16 }}>
            <Col xs={24}>
              <Form.Switch
                field='enabled'
                label={t('启用对公账户')}
                checkedText={t('开')}
                uncheckedText={t('关')}
              />
            </Col>
          </Row>

          <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Form.Input
                field='company_name'
                label={t('收款方（公司名称）')}
                placeholder={t('例如：北京懂点科技有限公司')}
                disabled={!inputs.enabled}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Form.Input
                field='bank_name'
                label={t('开户银行')}
                placeholder={t('例如：中国工商银行')}
                disabled={!inputs.enabled}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Form.Input
                field='account_no'
                label={t('银行账号')}
                placeholder={t('例如：1234 5678 9012 3456')}
                disabled={!inputs.enabled}
              />
            </Col>
          </Row>

          <Row gutter={{ xs: 8, sm: 16, md: 24 }} style={{ marginTop: 8 }}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Form.Input
                field='bank_branch'
                label={t('开户支行（可选）')}
                placeholder={t('例如：北京市朝阳区支行')}
                disabled={!inputs.enabled}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={16}>
              <Form.Input
                field='remark'
                label={t('备注（可选）')}
                placeholder={t(
                  '例如：转账备注请填写您的账户用户名，方便核对到账',
                )}
                disabled={!inputs.enabled}
              />
            </Col>
          </Row>

          <Button
            onClick={submit}
            style={{ marginTop: 16 }}
            loading={loading}
          >
            {t('保存对公账户设置')}
          </Button>
        </Form.Section>
      </Form>
    </Spin>
  );
}
