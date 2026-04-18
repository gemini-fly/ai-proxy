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

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  API,
  copy,
  showError,
  showInfo,
  showSuccess,
  prepareCredentialCreationOptions,
  buildRegistrationResult,
  isPasskeySupported,
  setUserData,
} from '../../helpers';
import { UserContext } from '../../context/User';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Input,
  Space,
  Typography,
  Avatar,
  Modal,
} from '@douyinfe/semi-ui';
import { IconKey, IconLock, IconDelete, IconShield } from '@douyinfe/semi-icons';
import { ShieldCheck } from 'lucide-react';
import TwoFASetting from './personal/components/TwoFASetting';
import ChangePasswordModal from './personal/modals/ChangePasswordModal';
import AccountDeleteModal from './personal/modals/AccountDeleteModal';

const SecuritySetting = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [inputs, setInputs] = useState({
    self_account_deletion_confirmation: '',
    original_password: '',
    set_new_password: '',
    set_new_password_confirmation: '',
  });

  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const [systemToken, setSystemToken] = useState('');
  const [passkeyStatus, setPasskeyStatus] = useState({ enabled: false });
  const [passkeyRegisterLoading, setPasskeyRegisterLoading] = useState(false);
  const [passkeyDeleteLoading, setPasskeyDeleteLoading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);

  useEffect(() => {
    let saved = localStorage.getItem('status');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(parsed.turnstile_site_key);
      }
    }
    (async () => {
      try {
        const res = await API.get('/api/status');
        const { success, data } = res.data;
        if (success && data) {
          if (data.turnstile_check) {
            setTurnstileEnabled(true);
            setTurnstileSiteKey(data.turnstile_site_key);
          } else {
            setTurnstileEnabled(false);
            setTurnstileSiteKey('');
          }
        }
      } catch (e) {
        // ignore
      }
    })();

    loadPasskeyStatus();
    isPasskeySupported()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false));
  }, []);

  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const loadPasskeyStatus = async () => {
    try {
      const res = await API.get('/api/user/passkey');
      const { success, data, message } = res.data;
      if (success) {
        setPasskeyStatus({
          enabled: data?.enabled || false,
          last_used_at: data?.last_used_at || null,
          backup_eligible: data?.backup_eligible || false,
          backup_state: data?.backup_state || false,
        });
      } else {
        showError(message);
      }
    } catch (error) {
      // ignore
    }
  };

  const generateAccessToken = async () => {
    const res = await API.get('/api/user/token');
    const { success, message, data } = res.data;
    if (success) {
      setSystemToken(data);
      await copy(data);
      showSuccess(t('令牌已重置并已复制到剪贴板'));
    } else {
      showError(message);
    }
  };

  const handleSystemTokenClick = async (e) => {
    e.target.select();
    await copy(e.target.value);
    showSuccess(t('系统令牌已复制到剪切板'));
  };

  const changePassword = async () => {
    if (inputs.set_new_password === '') {
      showError(t('请输入新密码！'));
      return;
    }
    if (inputs.original_password === inputs.set_new_password) {
      showError(t('新密码需要和原密码不一致！'));
      return;
    }
    if (inputs.set_new_password !== inputs.set_new_password_confirmation) {
      showError(t('两次输入的密码不一致！'));
      return;
    }
    const res = await API.put(`/api/user/self`, {
      original_password: inputs.original_password,
      password: inputs.set_new_password,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('密码修改成功！'));
    } else {
      showError(message);
    }
    setShowChangePasswordModal(false);
  };

  const deleteAccount = async () => {
    if (inputs.self_account_deletion_confirmation !== userState.user?.username) {
      showError(t('请输入你的账户名以确认删除！'));
      return;
    }
    const res = await API.delete('/api/user/self');
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('账户已删除！'));
      await API.get('/api/user/logout');
      userDispatch({ type: 'logout' });
      localStorage.removeItem('user');
      navigate('/login');
    } else {
      showError(message);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!passkeySupported || !window.PublicKeyCredential) {
      showInfo(t('当前设备不支持 Passkey'));
      return;
    }
    setPasskeyRegisterLoading(true);
    try {
      const beginRes = await API.post('/api/user/passkey/register/begin');
      const { success, message, data } = beginRes.data;
      if (!success) {
        showError(message || t('无法发起 Passkey 注册'));
        return;
      }
      const publicKey = prepareCredentialCreationOptions(
        data?.options || data?.publicKey || data,
      );
      const credential = await navigator.credentials.create({ publicKey });
      const payload = buildRegistrationResult(credential);
      if (!payload) {
        showError(t('Passkey 注册失败，请重试'));
        return;
      }
      const finishRes = await API.post(
        '/api/user/passkey/register/finish',
        payload,
      );
      if (finishRes.data.success) {
        showSuccess(t('Passkey 注册成功'));
        await loadPasskeyStatus();
      } else {
        showError(finishRes.data.message || t('Passkey 注册失败，请重试'));
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        showInfo(t('已取消 Passkey 注册'));
      } else {
        showError(t('Passkey 注册失败，请重试'));
      }
    } finally {
      setPasskeyRegisterLoading(false);
    }
  };

  const handleRemovePasskey = async () => {
    setPasskeyDeleteLoading(true);
    try {
      const res = await API.delete('/api/user/passkey');
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('Passkey 已解绑'));
        await loadPasskeyStatus();
      } else {
        showError(message || t('操作失败，请重试'));
      }
    } catch (error) {
      showError(t('操作失败，请重试'));
    } finally {
      setPasskeyDeleteLoading(false);
    }
  };

  const passkeyEnabled = passkeyStatus?.enabled;
  const lastUsedLabel = passkeyStatus?.last_used_at
    ? new Date(passkeyStatus.last_used_at).toLocaleString()
    : t('尚未使用');

  return (
    <div className='mt-[60px]'>
      <div className='flex justify-center'>
        <div className='w-full max-w-3xl mx-auto px-2 py-6'>
          {/* 页面标题 */}
          <div className='flex items-center mb-6'>
            <Avatar size='small' color='orange' className='mr-3 shadow-md'>
              <ShieldCheck size={16} />
            </Avatar>
            <div>
              <Typography.Title heading={4} className='mb-0'>
                {t('安全设置')}
              </Typography.Title>
              <Typography.Text type='tertiary' className='text-sm'>
                {t('管理账户安全、密码与身份验证方式')}
              </Typography.Text>
            </div>
          </div>

          <Space vertical className='w-full'>
            {/* 系统访问令牌 */}
            <Card className='!rounded-xl w-full'>
              <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                <div className='flex items-start w-full sm:w-auto'>
                  <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4 flex-shrink-0'>
                    <IconKey size='large' className='text-slate-600' />
                  </div>
                  <div className='flex-1'>
                    <Typography.Title heading={6} className='mb-1'>
                      {t('系统访问令牌')}
                    </Typography.Title>
                    <Typography.Text type='tertiary' className='text-sm'>
                      {t('用于API调用的身份验证令牌，请妥善保管')}
                    </Typography.Text>
                    {systemToken && (
                      <div className='mt-3'>
                        <Input
                          readonly
                          value={systemToken}
                          onClick={handleSystemTokenClick}
                          size='large'
                          prefix={<IconKey />}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type='primary'
                  theme='solid'
                  onClick={generateAccessToken}
                  className='!bg-slate-600 hover:!bg-slate-700 w-full sm:w-auto'
                  icon={<IconKey />}
                >
                  {systemToken ? t('重新生成') : t('生成令牌')}
                </Button>
              </div>
            </Card>

            {/* 密码管理 */}
            <Card className='!rounded-xl w-full'>
              <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                <div className='flex items-start w-full sm:w-auto'>
                  <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4 flex-shrink-0'>
                    <IconLock size='large' className='text-slate-600' />
                  </div>
                  <div>
                    <Typography.Title heading={6} className='mb-1'>
                      {t('密码管理')}
                    </Typography.Title>
                    <Typography.Text type='tertiary' className='text-sm'>
                      {t('定期更改密码可以提高账户安全性')}
                    </Typography.Text>
                  </div>
                </div>
                <Button
                  type='primary'
                  theme='solid'
                  onClick={() => setShowChangePasswordModal(true)}
                  className='!bg-slate-600 hover:!bg-slate-700 w-full sm:w-auto'
                  icon={<IconLock />}
                >
                  {t('修改密码')}
                </Button>
              </div>
            </Card>

            {/* Passkey 设置 */}
            <Card className='!rounded-xl w-full'>
              <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                <div className='flex items-start w-full sm:w-auto'>
                  <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4 flex-shrink-0'>
                    <IconKey size='large' className='text-slate-600' />
                  </div>
                  <div>
                    <Typography.Title heading={6} className='mb-1'>
                      {t('Passkey 登录')}
                    </Typography.Title>
                    <Typography.Text type='tertiary' className='text-sm'>
                      {passkeyEnabled
                        ? t('已启用 Passkey，无需密码即可登录')
                        : t('使用 Passkey 实现免密且更安全的登录体验')}
                    </Typography.Text>
                    <div className='mt-2 text-xs text-gray-500 space-y-1'>
                      <div>
                        {t('最后使用时间')}：{lastUsedLabel}
                      </div>
                      {!passkeySupported && (
                        <div className='text-amber-600'>
                          {t('当前设备不支持 Passkey')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  type={passkeyEnabled ? 'danger' : 'primary'}
                  theme='solid'
                  onClick={
                    passkeyEnabled
                      ? () => {
                          Modal.confirm({
                            title: t('确认解绑 Passkey'),
                            content: t(
                              '解绑后将无法使用 Passkey 登录，确定要继续吗？',
                            ),
                            okText: t('确认解绑'),
                            cancelText: t('取消'),
                            okType: 'danger',
                            onOk: handleRemovePasskey,
                          });
                        }
                      : handleRegisterPasskey
                  }
                  className={`w-full sm:w-auto ${passkeyEnabled ? '!bg-slate-500 hover:!bg-slate-600' : ''}`}
                  icon={<IconKey />}
                  disabled={!passkeySupported && !passkeyEnabled}
                  loading={passkeyEnabled ? passkeyDeleteLoading : passkeyRegisterLoading}
                >
                  {passkeyEnabled ? t('解绑 Passkey') : t('注册 Passkey')}
                </Button>
              </div>
            </Card>

            {/* 两步验证设置 */}
            <TwoFASetting t={t} />

            {/* 危险区域 - 删除账户 */}
            <Card className='!rounded-xl w-full'>
              <div className='flex flex-col sm:flex-row items-start sm:justify-between gap-4'>
                <div className='flex items-start w-full sm:w-auto'>
                  <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4 flex-shrink-0'>
                    <IconDelete size='large' className='text-slate-600' />
                  </div>
                  <div>
                    <Typography.Title heading={6} className='mb-1 text-slate-700'>
                      {t('删除账户')}
                    </Typography.Title>
                    <Typography.Text type='tertiary' className='text-sm'>
                      {t('此操作不可逆，所有数据将被永久删除')}
                    </Typography.Text>
                  </div>
                </div>
                <Button
                  type='danger'
                  theme='solid'
                  onClick={() => setShowAccountDeleteModal(true)}
                  className='w-full sm:w-auto !bg-slate-500 hover:!bg-slate-600'
                  icon={<IconDelete />}
                >
                  {t('删除账户')}
                </Button>
              </div>
            </Card>
          </Space>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      <ChangePasswordModal
        t={t}
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
        inputs={inputs}
        handleInputChange={handleInputChange}
        changePassword={changePassword}
        turnstileEnabled={turnstileEnabled}
        turnstileSiteKey={turnstileSiteKey}
        setTurnstileToken={setTurnstileToken}
      />

      {/* 删除账户弹窗 */}
      <AccountDeleteModal
        t={t}
        showAccountDeleteModal={showAccountDeleteModal}
        setShowAccountDeleteModal={setShowAccountDeleteModal}
        inputs={inputs}
        handleInputChange={handleInputChange}
        deleteAccount={deleteAccount}
        userState={userState}
        turnstileEnabled={turnstileEnabled}
        turnstileSiteKey={turnstileSiteKey}
        setTurnstileToken={setTurnstileToken}
      />
    </div>
  );
};

export default SecuritySetting;
