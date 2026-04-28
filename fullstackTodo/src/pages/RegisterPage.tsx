import React from 'react'
import type { FormProps } from 'antd'
import { Button, Form, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../api/auth'

type FieldType = {
  userName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    console.log('Success:', values)
    if (!values.userName || !values.email || !values.password) return
    if (values.password !== values.confirmPassword) {
      message.error('两次密码不一致')
      return
    }
    const res =  await registerApi({
      username: values.userName,
      email: values.email,
      password: values.confirmPassword,
    })
    console.log('注册res:', res)
    navigate("/login");
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (
    errorInfo,
  ) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 16px',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f7fb',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
          padding: '32px',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ margin: '0 0 24px' }}>创建账号</h1>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            name="userName"
            label="用户名"
            rules={[
              {
                required: true,
                message: 'Please input your user name!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FieldType>
            name="email"
            label="邮箱"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="密码"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item<FieldType>
            label="确认密码"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please input your confirmPassword!' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
            <p style={{ margin: '16px 0 0', color: '#6b7280' }}>
              已有账号<a href="/login">去登录</a>
            </p>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage
