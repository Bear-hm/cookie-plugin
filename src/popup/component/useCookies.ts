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
import { CookieDetails } from "../type";
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
    async (cookieDetails: CookieDetails) => {
      try {
        await setCookie(currentUrl, cookieDetails);
        await handleGetAllCookies();
      } catch (error) {
        console.error("Failed to set cookie:", error);
      }
    },
    [currentUrl, handleGetAllCookies]
  );

  const handleUpdateCookie = useCallback(
    async (oldName: string,cookieDetails: CookieDetails) => {
      try {
        await updateCookie(currentUrl, oldName, cookieDetails);
        await handleGetAllCookies();
      } catch (error) {
        console.error("Failed to set cookie:", error);
      }
    },
    [currentUrl, handleGetAllCookies]
  );

  const handleDeleteCookie = async (name: string) => {
    try {
      await deleteCookie(currentUrl, name);
      await handleGetAllCookies();
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
          await handleGetAllCookies();
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
          await handleSetCookie({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite || "no_restriction",
            expirationDate: cookie.expirationDate,
            storeId: cookie.storeId,
            session: cookie.session,
          });
        }
  
        await handleGetAllCookies();
      } catch (error) {
        console.error("Failed to import cookies:", error);
      }
    },
    [handleGetAllCookies, handleSetCookie]
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
