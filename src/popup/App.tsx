import { useEffect, useState } from "react";
import Pop from "./component/Pop";
import { notification } from "antd";
import { getAllCookies, setCookie, deleteCookie } from './index'; // Import cookie operation functions

const App = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (chrome?.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        console.log("Current tab URL:", url);
        setCurrentUrl(url);
      });
    } else {
      console.log("Currently in development environment, Chrome API is not available");
    }
  }, []);

  const handleGetAllCookies = async () => {
    try {
      const cookies = await getAllCookies(currentUrl);
      console.log("Retrieved cookies:", cookies);
      return cookies;
    } catch (error: unknown) {
      console.error("Failed to get cookie:", error);
      if (error instanceof Error) {
        notification.error({
          message: "Get failed",
          description: error.message,
        });
      } else {
        notification.error({
          message: "Get failed",
          description: "Unknown error",
        });
      }
      return [];
    }
  };

  const handleSetCookie = async (name: string, value: string) => {
    try {
      await setCookie(currentUrl, name, value);
      notification.success({ message: "Cookie set successfully" });
    } catch (error: unknown) {
      console.error("Failed to set cookie:", error);
      if (error instanceof Error) {
        notification.error({ message: "Set failed", description: error.message });
      } else {
        notification.error({ message: "Set failed", description: "Unknown error" });
      }
    }
  };

  const handleDeleteCookie = async (name: string) => {
    try {
      await deleteCookie(currentUrl, name);
      notification.success({ message: "Cookie deleted successfully" });
    } catch (error: unknown) {
      console.error("Failed to delete cookie:", error);
      if (error instanceof Error) {
        notification.error({ message: "Delete failed", description: error.message });
      } else {
        notification.error({ message: "Delete failed", description: "Unknown error" });
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