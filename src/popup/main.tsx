// src/popup/index.tsx
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from "react";
import Pop from "./component/Pop";
import { notification } from "antd";
import { getAllCookies, setCookie, deleteCookie } from './index'; // 导入 cookie 操作函数
import '../common/styles/global.scss';

const App = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (chrome?.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        console.log("当前标签页 URL:", url);
        setCurrentUrl(url);
      });
    } else {
      console.log("当前处于开发环境，Chrome API 不可用");
    }
  }, []);

  const handleGetAllCookies = async () => {
    try {
      const cookies = await getAllCookies(currentUrl);
      console.log("获取到的 cookies:", cookies);
      return cookies;
    } catch (error: unknown) {
      console.error("获取 cookie 失败:", error);
      if (error instanceof Error) {
        notification.error({
          message: "获取失败",
          description: error.message,
        });
      } else {
        notification.error({
          message: "获取失败",
          description: "未知错误",
        });
      }
      return [];
    }
  };

  const handleSetCookie = async (name: string, value: string) => {
    try {
      await setCookie(currentUrl, name, value);
      notification.success({ message: "Cookie 设置成功" });
    } catch (error: unknown) {
      console.error("设置 cookie 失败:", error);
      if (error instanceof Error) {
        notification.error({ message: "设置失败", description: error.message });
      } else {
        notification.error({ message: "设置失败", description: "未知错误" });
      }
    }
  };

  const handleDeleteCookie = async (name: string) => {
    try {
      await deleteCookie(currentUrl, name);
      notification.success({ message: "Cookie 删除成功" });
    } catch (error: unknown) {
      console.error("删除 cookie 失败:", error);
      if (error instanceof Error) {
        notification.error({ message: "删除失败", description: error.message });
      } else {
        notification.error({ message: "删除失败", description: "未知错误" });
      }
    }
  };

  return (
    <Pop
      onSetCookie={handleSetCookie}
      onGetAllCookies={handleGetAllCookies}
      onDeleteCookie={handleDeleteCookie}
    />
  );
};

// 应用入口
createRoot(document.getElementById('root')!).render(<App />);