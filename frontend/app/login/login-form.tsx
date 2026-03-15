'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Tabs, Checkbox, App } from 'antd';
import { apiLogin, apiRegister, apiCheckEmailExists, fetchCurrentUser } from '@/api/auth';
import { useT } from '@/lib/i18n';

export interface RoleWithPermissions {
  role: string;
  permissions: string[];
}

interface Props {
  rolesWithPermissions: RoleWithPermissions[];
}

export default function LoginForm({ rolesWithPermissions }: Props) {
  const router = useRouter();
  const t = useT();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);


  async function onSignIn(values: { email: string; password: string }) {
    setLoading(true);
    try {
      const { access_token } = await apiLogin(values.email, values.password);
      sessionStorage.setItem('access_token', access_token);
      await fetchCurrentUser();
      const params = new URLSearchParams(window.location.search);
      router.replace(params.get('redirect') ?? '/');
    } catch {
      message.error(t.auth.login_failed);
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp(values: { email: string; password: string; roles: string[] }) {
    setLoading(true);
    try {
      await apiRegister(values.email, values.password, values.roles ?? []);
      message.success(t.auth.register_success);
      const { access_token } = await apiLogin(values.email, values.password);
      sessionStorage.setItem('access_token', access_token);
      await fetchCurrentUser();
      const params = new URLSearchParams(window.location.search);
      router.replace(params.get('redirect') ?? '/');
    } catch {
      message.error(t.auth.register_failed);
    } finally {
      setLoading(false);
    }
  }

  const signInForm = (
    <Form layout="vertical" onFinish={onSignIn} autoComplete="off">
      <Form.Item
        label={t.common.email}
        name="email"
        rules={[
          { required: true, message: t.auth.email_required },
          { type: 'email', message: t.auth.email_invalid },
        ]}
      >
        <Input placeholder={t.auth.email_placeholder} size="large" />
      </Form.Item>
      <Form.Item
        label={t.common.password}
        name="password"
        rules={[{ required: true, message: t.auth.password_required }]}
      >
        <Input.Password placeholder={t.auth.password_placeholder} size="large" />
      </Form.Item>
      <Form.Item className="mb-0 mt-6">
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          {t.auth.login_button}
        </Button>
      </Form.Item>
    </Form>
  );

  const signUpForm = (
    <Form layout="vertical" onFinish={onSignUp} autoComplete="off">
      <Form.Item
        label={t.common.email}
        name="email"
        validateTrigger="onChange"
        rules={[
          { required: true, message: t.auth.email_required },
          { type: 'email', message: t.auth.email_invalid },
          {
            validator: async (_, value) => {
              if (!value || !/\S+@\S+\.\S+/.test(value)) return;
              const { exists } = await apiCheckEmailExists(value);
              if (exists) return Promise.reject(new Error(t.auth.email_already_exists));
            },
          },
        ]}
      >
        <Input placeholder={t.auth.email_placeholder} size="large" />
      </Form.Item>
      <Form.Item
        label={t.common.password}
        name="password"
        rules={[{ required: true, message: t.auth.password_required }]}
      >
        <Input.Password placeholder={t.auth.password_placeholder} size="large" />
      </Form.Item>
      <Form.Item
        label={t.common.confirm_password}
        name="confirm_password"
        dependencies={['password']}
        rules={[
          { required: true, message: t.auth.confirm_password_required },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) return Promise.resolve();
              return Promise.reject(new Error(t.auth.password_mismatch));
            },
          }),
        ]}
      >
        <Input.Password placeholder={t.auth.confirm_password_placeholder} size="large" />
      </Form.Item>
      <Form.Item
        label={t.auth.roles_label}
        name="roles"
        rules={[{ required: true, message: t.auth.roles_required }]}
      >
        <Checkbox.Group>
          <div className="flex flex-col gap-2">
            {rolesWithPermissions.map(({ role }) => (
              <Checkbox key={role} value={role}>
                {role}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item className="mb-0 mt-6">
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          {t.auth.register_button}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">PartnerHub</h1>
        <Tabs
          defaultActiveKey="signin"
          centered
          items={[
            { key: 'signin', label: t.auth.sign_in, children: signInForm },
            { key: 'signup', label: t.auth.sign_up, children: signUpForm },
          ]}
        />
      </div>
    </div>
  );
}
