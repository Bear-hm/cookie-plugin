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
  updateCookie,
} from "../index";
import { Modal, notification } from "antd";
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

  const handleSetCookie = async (cookieDetails: chrome.cookies.Cookie) => {
    try {
      await setCookie(currentUrl, cookieDetails);
      await handleGetAllCookies();
      notification.success({
        message: "Cookie Set",
        description: `Successfully set cookie:`,
        duration: 3,
        placement: "top",

      });
    } catch (error) {
      notification.error({
        message: "Cookie Set Error",
        description: `Failed to set cookie: ${error}`,
        duration: 3,
        placement: "top",
      });
    }
  };

  const handleUpdateCookie = async (
    oldName: string,
    cookieDetails: chrome.cookies.Cookie
  ) => {
    try {
      await updateCookie(currentUrl, oldName, cookieDetails);
      await handleGetAllCookies();
      notification.success({
        message: "Cookie Updated",
        description: `Successfully updated cookie: ${cookieDetails.name}`,
        duration: 3,
        placement: "top",
      });
    } catch (error) {
      notification.error({
        message: "Update Failed",
        description: `Failed to update cookie: ${error}`,
        duration: 3,
        placement: "top",
      });
    }
  };

  const handleDeleteCookie = async (name: string) => {
    try {
      const res = await deleteCookie(currentUrl, name);
      await handleGetAllCookies();
      if (res) {
        notification.success({
          message: "Cookie Deleted",
          description: `Successfully deleted cookie: ${name}`,
          duration: 3,
        placement: "top",

        });
      }
    } catch (error) {
      notification.error({
        message: "Delete Failed",
        description: `Failed to delete cookie: ${error}`,
        duration: 3,
        placement: "top",

      });
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
          notification.error({
            message: "Delete Failed",
            description: `Failed to delete all cookies: ${error}`,
            duration: 3,
        placement: "top",

          });
        }
      },
    });
  };

  const handleExportCookies = (type: BatchType = "clipboard") => {
    const cookiesJson = JSON.stringify(cookies, null, 2);
    switch (type) {
      case "clipboard":
        copyText(cookiesJson);
        break;
      case "file":
        exportCookiesAsFile(cookies);
        handleGetAllCookies();
        break;
      default:
        copyText(cookiesJson);
        break;
    }
  };

  const handleImportCookies = async (type: BatchType = "clipboard") => {
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
      // 导入每个 cookie
      for (const cookie of importedCookies) {
        const cookieDetails: Partial<chrome.cookies.Cookie> = {
          name: cookie.name,
          value: cookie.value,
        } as Partial<chrome.cookies.Cookie>;
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
        if (cookie.sameSite) {
          const validSameSiteValues = ["no_restriction", "lax", "strict"];
          cookieDetails.sameSite = validSameSiteValues.includes(cookie.sameSite.toLowerCase())
            ? cookie.sameSite.toLowerCase() as "no_restriction" | "lax" | "strict"
            : "no_restriction";
        }
        optionalProperties.forEach((prop) => {
          if (cookie[prop] !== undefined) {
            cookieDetails[prop] = cookie[prop];
          }
        });
        await setCookie(currentUrl, cookieDetails);
      }
      await handleGetAllCookies();
      notification.success({
        message: "Successfully imported",
        duration: 3,
        placement: 'top'
      });
    } catch (error) {
      notification.error({
        message: "Import failed",
        description: `Import cookies failed: ${JSON.stringify(error)}`,
        duration: 3,
        placement: 'top'
      });
    }
  };

  return {
    cookies,
    handleGetAllCookies,
    handleSetCookie,
    handleDeleteCookie,
    handleDeleteAllCookies,
    handleExportCookies,
    handleImportCookies,
    handleUpdateCookie,
  };
};

export default useCookies;
