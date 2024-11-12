import { useEffect, useState } from "react";
import Pop from "./component/Pop";
import { notification } from "antd";

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
      if (chrome?.cookies?.getAll) {
        const domain = new URL(currentUrl).hostname;
        const isLocalhost = domain === "localhost" || domain === "127.0.0.1";

        const cookies = await chrome.cookies.getAll({
          domain: isLocalhost ? "localhost" : domain,
        });
        console.log("域名:", domain);
        console.log("获取到的 cookies:", cookies);
        return cookies;
      } else {
        const cookies = await chrome.cookies.getAll({
          url: "http://localhost:3000",
        });
        console.log("开发环境获取到的 cookies:", cookies);
        return cookies;
      }
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
      if (chrome?.cookies?.set) {
        await chrome.cookies.set({
          url: currentUrl,
          name,
          value,
        });
        notification.success({ message: "Cookie 设置成功" });
      }
    }catch (error: unknown) {
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
      if (chrome?.cookies?.remove) {
        await chrome.cookies.remove({
          url: currentUrl,
          name,
        });
        notification.success({ message: "Cookie 删除成功" });
      }
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

export default App;
