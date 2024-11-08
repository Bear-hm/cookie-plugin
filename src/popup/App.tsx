import { useEffect, useState } from "react";
import Pop from "./component/Pop";
import { notification } from "antd";

const App = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (chrome?.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        console.log('当前标签页 URL:', url); 
        setCurrentUrl(url);
      });
    } else {
      setCurrentUrl("http://localhost:3000");
      console.log("当前处于开发环境，Chrome API 不可用");
    }
  }, []);

  const handleGetAllCookies = async () => {
    try {
      if (chrome?.cookies?.getAll) {
        // Chrome 扩展环境
        const domain = new URL(currentUrl).hostname;
        const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
        
        const cookies = await chrome.cookies.getAll({ 
          domain: isLocalhost ? 'localhost' : domain
        });
        
        console.log('域名:', domain);
        console.log('获取到的 cookies:', cookies);
        return cookies;
      } else {
        // 开发环境：解析 document.cookie
        const cookieString = document.cookie;
        const cookies: chrome.cookies.Cookie[] = cookieString.split(';')
          .map(cookie => {
            const [name, value] = cookie.trim().split('=');
            return {
              name,
              value: decodeURIComponent(value),
              domain: 'localhost',
              path: '/',
              secure: false,
              httpOnly: false,
              sameSite: "no_restriction",
              session: true,
              hostOnly: true,
              expirationDate: undefined
            } as chrome.cookies.Cookie;
          })
          .filter(cookie => cookie.name); // 过滤掉空值
  
        console.log('开发环境获取到的 cookies:', cookies);
        return cookies;
      }
    } catch (error) {
      console.error('获取 cookie 失败:', error);
      notification.error({ 
        message: "获取失败", 
        description: error.message 
      });
      return [];
    }
  };

  const handleSetCookie = async (name: string, value: string) => {
    try {
      if (chrome?.cookies?.set) {
        await chrome.cookies.set({
          url: currentUrl,
          name,
          value,
        });
        notification.success({ message: "Cookie 设置成功" });
      } else {
        // 开发环境下的模拟响应
        console.log("设置 Cookie:", { name, value });
        notification.success({ message: "开发环境：模拟设置 Cookie 成功" });
      }
    } catch (error) {
      notification.error({ message: "设置失败", description: error.message });
    }
  };

  const handleDeleteCookie = async (name: string) => {
    try {
      if (chrome?.cookies?.remove) {
        await chrome.cookies.remove({
          url: currentUrl,
          name,
        });
        notification.success({ message: "Cookie 删除成功" });
      } else {
        // 开发环境下的模拟响应
        console.log("删除 Cookie:", name);
        notification.success({ message: "开发环境：模拟删除 Cookie 成功" });
      }
    } catch (error) {
      notification.error({ message: "删除失败", description: error.message });
    }
  };

  return (
    <div className="container">
      <div className="bg-gray-50">
        <Pop
          onSetCookie={handleSetCookie}
          onGetAllCookies={handleGetAllCookies}
          onDeleteCookie={handleDeleteCookie}
        />
      </div>
    </div>
  );
}

export default App;
