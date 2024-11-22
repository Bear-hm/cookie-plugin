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
import { Modal } from "antd";
import {notice} from '../../common/hooks/useNotice'
type BatchType = "clipboard" | "file";
const useCookies = (currentUrl: string) => {
  const [cookies, setCookies] = useState<chrome.cookies.Cookie[]>([]);

  const handleGetAllCookies = useCallback(async () => {
    // console.log("Fetching cookies...");
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
      await setCookie(cookieDetails);
      await handleGetAllCookies();
      notice.success({
        message: "Successfully set cookie",
        style: {
          width: 300,
        }
      })
      // notification.success({
      //   message: "Successfully set cookie",
      //   duration: 3,
      //   placement: "top",
      // });
    } catch (error) {
      notice.error({
        message: `Failed to set cookie: ${error}`,
      })
      // notification.error({
      //   message: `Failed to set cookie: ${error}`,
      //   duration: 3,
      //   placement: "top",
        
      // });
    }
  };

  const handleUpdateCookie = async (
    oldName: string,
    cookieDetails: chrome.cookies.Cookie
  ) => {
    try {
      await updateCookie(currentUrl, oldName, cookieDetails);
      await handleGetAllCookies();
      notice.success({
        message: "Updated successfully",
        style: {
          width: 300,
        }
      })
    } catch (error) {
      notice.error({
        message: "Updated failed!",
        description: `Failed to update cookie: ${error}`,
      })
    }
  };

  const handleDeleteCookie = async (name: string) => {
    try {
      const res = await deleteCookie(currentUrl, name);
      await handleGetAllCookies();
      if (res) {
        notice.success({
          message: "Deleted successfully",
          style:{
            width: 300
          }
        })
      }
    } catch (error) {
      notice.error({
        message: "Delete Failed!",
        description: `Failed to delete cookie: ${error}`,
      })
    }
  };

  const handleDeleteAllCookies = async () => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete all cookies?",
      centered:true,
      okButtonProps: { style: { backgroundColor: '#381A1A', color: '#fff' } }, 
      cancelButtonProps: { style: { backgroundColor: '#6F6F6F', color: '#fff' } }, 
      okText: 'Remove', 
      onOk: async () => {
        try {
          await deleteAllCookies(currentUrl);
          await handleGetAllCookies();
        } catch (error) {
          notice.error({
            message: "Delete Failed",
            description: `Failed to delete all cookies: ${error}`,
          })
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
    let successCount = 0;
    let failureCount = 0;
    let importedCookies: chrome.cookies.Cookie[];
    try {
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
      // const existingCookies = await getAllCookies(currentUrl);
      // const existingCookieHashes = new Set(existingCookies.map(cookie => hash(cookie)));
      // 导入每个 cookie
      for (const cookie of importedCookies) {
        // const cookieHash = hash(cookie);
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
          "sameSite"
        ];
        if (cookie.sameSite) {
          const validSameSiteValues = ["no_restriction", "lax", "strict"];
          cookieDetails.sameSite = validSameSiteValues.includes(
            cookie.sameSite.toLowerCase()
          )
            ? (cookie.sameSite.toLowerCase() as
                | "no_restriction"
                | "lax"
                | "strict")
            : "no_restriction";
        }
        optionalProperties.forEach((prop) => {
          if (cookie[prop] !== undefined) {
            cookieDetails[prop] = cookie[prop];
          }
        });
        const success = await setCookie(cookieDetails);
        if(success) {
          successCount++;
        }else {
          failureCount++;
        }
      }
      await handleGetAllCookies();
      notice.success({
        message: 'Import Results',
        description: `Successfully imported ${successCount}.\n Failed to import ${failureCount}.`,
        style: { whiteSpace: "pre-line"},
      })
    } catch (error) {
      notice.error({
        message: "Import Failed!",
        description: `Import cookies failed: ${JSON.stringify(error)}`
      })
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
