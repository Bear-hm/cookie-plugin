import { useState, useCallback } from "react";
import {
  getAllCookies,
  setCookie,
  deleteCookie,
  deleteAllCookies,
  exportCookiesAsFile,
  copyText,
  importFromClipboard,
  importFromFile,
  updateCookie
} from "../index";
import { Modal } from "antd";
type BatchType = "clipboard" | "file";
const useCookies = (currentUrl: string) => {
  const [cookies, setCookies] = useState<chrome.cookies.Cookie[]>([]);

  const handleGetAllCookies = useCallback(async () => {
    console.log("Fetching cookies...");
    try {
      const retrievedCookies = await getAllCookies(currentUrl);
      setCookies(retrievedCookies);
      return retrievedCookies;
    } catch (error) {
      console.error("Failed to get cookies:", error);
      return [];
    }
  }, [currentUrl]);

  const handleSetCookie = useCallback(
    async (cookieDetails: chrome.cookies.Cookie) => {
      try {
        await setCookie(currentUrl, cookieDetails);
      } catch (error) {
        console.error("Failed to set cookie:", error);
      }
    },
    [currentUrl]
  );

  const handleUpdateCookie = useCallback(
    async (oldName: string,cookieDetails: chrome.cookies.Cookie) => {
      try {
        await updateCookie(currentUrl, oldName, cookieDetails);
      } catch (error) {
        console.error("Failed to set cookie:", error);
      }
    },
    [currentUrl]
  );

  const handleDeleteCookie = async (name: string) => {
    try {
      await deleteCookie(currentUrl, name);
    } catch (error) {
      console.error("Failed to delete cookie:", error);
    }
  };

  const handleDeleteAllCookies = async () => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete all cookies?",
      onOk: async () => {
        try {
          await deleteAllCookies(currentUrl);
        } catch (error) {
          console.error("Failed to delete all cookies:", error);
        }
      },
    });
  };

  const handleExportCookies = useCallback(
    (type: BatchType = "clipboard") => {
      const cookiesJson = JSON.stringify(cookies, null, 2);

      switch (type) {
        case "clipboard":
          copyText(cookiesJson);
          break;
        case "file":
          exportCookiesAsFile(cookies);
          break;
        default:
          copyText(cookiesJson);
          break;
      }
    },
    [cookies]
  );

  const handleImportCookies = useCallback(
    async (type: BatchType = "clipboard") => {
      try {
        let importedCookies: chrome.cookies.Cookie[];
  
        switch (type) {
          case "clipboard":
            importedCookies = await importFromClipboard();
            break;
          case "file":
            importedCookies = await importFromFile();
            break;
          default:
            return;
        }
        console.log("handleImportCookies", importedCookies);
        
        // 导入每个 cookie
        for (const cookie of importedCookies) {
          const cookieDetails = {
            name: cookie.name,
            value: cookie.value,
          };
          const optionalProperties: (keyof chrome.cookies.Cookie)[] = [
            "path",
            "domain",
            "expirationDate",
            "httpOnly",
            "secure",
            "hostOnly",
            "sameSite",
            "session",
          ];
          optionalProperties.forEach((prop) => {
            if (cookie[prop] !== undefined) {
              (cookieDetails)[prop] = cookie[prop];
            }
          });
          await handleSetCookie(cookieDetails);
        }
  
      } catch (error) {
        console.error("Failed to import cookies:", error);
      }
    },
    [ handleSetCookie]
  );

  return {
    cookies,
    handleGetAllCookies,
    handleSetCookie,
    handleDeleteCookie,
    handleDeleteAllCookies,
    handleExportCookies,
    handleImportCookies,
    handleUpdateCookie
  };
};

export default useCookies;
