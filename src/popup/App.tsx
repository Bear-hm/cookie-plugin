import React, { useEffect, useState } from 'react';
import Pop from './component/Pop';
import { notification } from 'antd';


function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    // 检查是否在扩展环境中
    if (chrome?.tabs?.query) {
      // 获取当前标签页URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        setCurrentUrl(tabs[0]?.url || '');
      });
    } else {
      // 开发环境下使用模拟数据
      setCurrentUrl('http://localhost:3000');
      console.log('当前处于开发环境，Chrome API 不可用');
    }
  }, []);

  // Cookie 操作方法
  const handleSetCookie = async (name: string, value: string) => {
    try {
      if (chrome?.cookies?.set) {
        await chrome.cookies.set({
          url: currentUrl,
          name,
          value
        });
        notification.success({ message: 'Cookie 设置成功' });
      } else {
        // 开发环境下的模拟响应
        console.log('设置 Cookie:', { name, value });
        notification.success({ message: '开发环境：模拟设置 Cookie 成功' });
      }
    } catch (error) {
      notification.error({ message: '设置失败', description: error.message });
    }
  };

  const handleGetCookie = async (name: string) => {
    try {
      if (chrome?.cookies?.get) {
        const cookie = await chrome.cookies.get({
          url: currentUrl,
          name
        });
        return cookie?.value;
      } else {
        // 开发环境下的模拟响应
        console.log('获取 Cookie:', name);
        return '开发环境模拟值';
      }
    } catch (error) {
      notification.error({ message: '获取失败', description: error.message });
    }
  };

  const handleDeleteCookie = async (name: string) => {
    try {
      if (chrome?.cookies?.remove) {
        await chrome.cookies.remove({
          url: currentUrl,
          name
        });
        notification.success({ message: 'Cookie 删除成功' });
      } else {
        // 开发环境下的模拟响应
        console.log('删除 Cookie:', name);
        notification.success({ message: '开发环境：模拟删除 Cookie 成功' });
      }
    } catch (error) {
      notification.error({ message: '删除失败', description: error.message });
    }
  };

  return (
    <div className="container">
      <Pop 
        onSetCookie={handleSetCookie}
        onGetCookie={handleGetCookie}
        onDeleteCookie={handleDeleteCookie}
      />
    </div>
  );
}

export default App;