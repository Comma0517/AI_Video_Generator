import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';

const API_HOST = process.env.REACT_APP_BASE_URL;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const history = useHistory(); 

  const { token } = useParams(); // This will get the token from the URL

  const handleSubmit = async (values) => {
    const { password, confirmPassword } = values;
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      // POST request to your API endpoint
      await axios.post(`${API_HOST}/api/scripts/reset-password/${token}`, { password });
      setMessage('Your password has been successfully reset.');      
      history.push('/auth');
    } catch (err) {
        console.log(err.response.status)
        if (err.response.status === 400){
            setError(err.response.data)
        } else {
            setError(
              err.response && err.response.data.message
                ? err.response.data.message
                : err.message
            );
        }
    }
  };

  return (
    <div className="reset-password-container mx-auto mt-10 p-6 border rounded shadow-lg max-w-md w-full">
      <h2 className="text-center text-2xl font-bold mb-6">Reset Password</h2>

      {error && <Alert message={error} type="error" showIcon className="mb-4" />}
      {message && <Alert message={message} type="success" showIcon className="mb-4" />}

      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: 'Please input your new password!' },
            { min: 6, message: 'Password must be at least 6 characters.' },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPassword;