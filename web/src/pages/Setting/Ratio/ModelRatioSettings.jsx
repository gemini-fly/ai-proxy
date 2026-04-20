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
import {
  Button,
  Col,
  Form,
  Popconfirm,
  Row,
  Space,
  Spin,
} from '@douyinfe/semi-ui';
import {
  compareObjects,
  API,
  showError,
  showSuccess,
  showWarning,
} from '../../../helpers';
import { useTranslation } from 'react-i18next';
import KVEditor from '../../../components/settings/editors/KVEditor';

export default function ModelRatioSettings(props) {
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    ModelPrice: '',
    ModelRatio: '',
    CacheRatio: '',
    CompletionRatio: '',
    ImageRatio: '',
    AudioRatio: '',
    AudioCompletionRatio: '',
    ExposeRatioEnabled: false,
  });
  const refForm = useRef();
  const [inputsRow, setInputsRow] = useState(inputs);
  const { t } = useTranslation();

  async function onSubmit() {
    try {
      await refForm.current
        .validate()
        .then(() => {
          const updateArray = compareObjects(inputs, inputsRow);
          if (!updateArray.length)
            return showWarning(t('你似乎并没有修改什么'));

          const requestQueue = updateArray.map((item) => {
            const value =
              typeof inputs[item.key] === 'boolean'
                ? String(inputs[item.key])
                : inputs[item.key];
            return API.put('/api/option/', { key: item.key, value });
          });

          setLoading(true);
          Promise.all(requestQueue)
            .then((res) => {
              if (res.includes(undefined)) {
                return showError(
                  requestQueue.length > 1
                    ? t('部分保存失败，请重试')
                    : t('保存失败'),
                );
              }

              for (let i = 0; i < res.length; i++) {
                if (!res[i].data.success) {
                  return showError(res[i].data.message);
                }
              }

              showSuccess(t('保存成功'));
              props.refresh();
            })
            .catch((error) => {
              console.error('Unexpected error:', error);
              showError(t('保存失败，请重试'));
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch(() => {
          showError(t('请检查输入'));
        });
    } catch (error) {
      showError(t('请检查输入'));
      console.error(error);
    }
  }

  async function resetModelRatio() {
    try {
      let res = await API.post(`/api/option/rest_model_ratio`);
      if (res.data.success) {
        showSuccess(res.data.message);
        props.refresh();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(error);
    }
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
    <Spin spinning={loading}>
      <Form
        values={inputs}
        getFormApi={(formAPI) => (refForm.current = formAPI)}
        style={{ marginBottom: 15 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('模型固定价格')}
              extraText={t('一次调用消耗多少刀，优先级大于模型倍率')}
              keyLabel={t('模型名称')}
              valueLabel={t('价格（刀/次）')}
              keyPlaceholder='gpt-4-gizmo-*'
              maxKeyWidth={260}
              value={inputs.ModelPrice}
              onChange={(v) => setInputs({ ...inputs, ModelPrice: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('模型倍率')}
              keyLabel={t('模型名称')}
              valueLabel={t('倍率')}
              maxKeyWidth={260}
              value={inputs.ModelRatio}
              onChange={(v) => setInputs({ ...inputs, ModelRatio: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('提示缓存倍率')}
              keyLabel={t('模型名称')}
              valueLabel={t('缓存倍率')}
              maxKeyWidth={260}
              value={inputs.CacheRatio}
              onChange={(v) => setInputs({ ...inputs, CacheRatio: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('模型补全倍率（仅对自定义模型有效）')}
              extraText={t('仅对自定义模型有效')}
              keyLabel={t('模型名称')}
              valueLabel={t('补全倍率')}
              maxKeyWidth={260}
              value={inputs.CompletionRatio}
              onChange={(v) => setInputs({ ...inputs, CompletionRatio: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('图片输入倍率（仅部分模型支持该计费）')}
              extraText={t('图片输入相关的倍率设置，键为模型名称，值为倍率，仅部分模型支持该计费')}
              keyLabel={t('模型名称')}
              valueLabel={t('图片倍率')}
              maxKeyWidth={260}
              value={inputs.ImageRatio}
              onChange={(v) => setInputs({ ...inputs, ImageRatio: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('音频倍率（仅部分模型支持该计费）')}
              extraText={t('音频输入相关的倍率设置，键为模型名称，值为倍率')}
              keyLabel={t('模型名称')}
              valueLabel={t('音频倍率')}
              maxKeyWidth={260}
              value={inputs.AudioRatio}
              onChange={(v) => setInputs({ ...inputs, AudioRatio: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={20}>
            <KVEditor
              label={t('音频补全倍率（仅部分模型支持该计费）')}
              extraText={t('音频输出补全相关的倍率设置，键为模型名称，值为倍率')}
              keyLabel={t('模型名称')}
              valueLabel={t('补全倍率')}
              maxKeyWidth={260}
              value={inputs.AudioCompletionRatio}
              onChange={(v) => setInputs({ ...inputs, AudioCompletionRatio: v })}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Switch
              label={t('暴露倍率接口')}
              field={'ExposeRatioEnabled'}
              onChange={(value) =>
                setInputs({ ...inputs, ExposeRatioEnabled: value })
              }
            />
          </Col>
        </Row>
      </Form>
      <Space>
        <Button onClick={onSubmit}>{t('保存模型倍率设置')}</Button>
        <Popconfirm
          title={t('确定重置模型倍率吗？')}
          content={t('此修改将不可逆')}
          okType={'danger'}
          position={'top'}
          onConfirm={resetModelRatio}
        >
          <Button type={'danger'}>{t('重置模型倍率')}</Button>
        </Popconfirm>
      </Space>
    </Spin>
  );
}
