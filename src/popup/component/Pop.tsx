import React, { useState } from 'react';
import { Input, Button, Space, notification } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';

interface PopProps {
  onSetCookie: (name: string, value: string) => Promise<void>;
  onGetCookie: (name: string) => Promise<string | undefined>;
  onDeleteCookie: (name: string) => Promise<void>;
}

const Pop: React.FC<PopProps> = ({ onSetCookie, onGetCookie, onDeleteCookie }) => {
  const [cookieName, setCookieName] = useState('');
  const [cookieValue, setCookieValue] = useState('');

  const handleSetCookie = async () => {
    if (!cookieName || !cookieValue) {
      notification.warning({ message: '请输入 Cookie 名称和值' });
      return;
    }
    await onSetCookie(cookieName, cookieValue);
  };

  const handleGetCookie = async () => {
    if (!cookieName) {
      notification.warning({ message: '请输入 Cookie 名称' });
      return;
    }
    const value = await onGetCookie(cookieName);
    if (value) {
      setCookieValue(value);
      notification.info({ message: 'Cookie 值', description: value });
    }
  };

  const handleDeleteCookie = async () => {
    if (!cookieName) {
      notification.warning({ message: '请输入 Cookie 名称' });
      return;
    }
    await onDeleteCookie(cookieName);
    setCookieValue(''); // 清空值
  };

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">Cookie 管理器</h1>
      </div>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Input
          value={cookieName}
          onChange={(e) => setCookieName(e.target.value)}
          placeholder="Cookie 名称"
          size="large"
        />
        <Input
          value={cookieValue}
          onChange={(e) => setCookieValue(e.target.value)}
          placeholder="Cookie 值"
          size="large"
        />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleSetCookie}
            block
          >
            设置 Cookie
          </Button>
          
          <Button
            icon={<SearchOutlined />}
            onClick={handleGetCookie}
            block
          >
            获取 Cookie
          </Button>
          
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteCookie}
            block
          >
            删除 Cookie
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default Pop;