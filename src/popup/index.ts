import { notification } from "antd";

export const getAllCookies = async (
  url: string
): Promise<chrome.cookies.Cookie[]> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.getAll) {
      let domain: string;
      let protocol: string;

      try {
        const parsedUrl = new URL(url);
        domain = parsedUrl.hostname;
        protocol = parsedUrl.protocol;
      } catch (error) {
        reject(new Error(`Invalid URL format: ${error}`));
        return;
      }
      const isLocalhost = domain === "localhost" || domain === "127.0.0.1";
      chrome.cookies.getAll(
        {
          url: isLocalhost ? "http://localhost" : `${protocol}//${domain}`,
        },
        (cookies) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(cookies);
          }
        }
      );
    } else {
      const cookieString = document.cookie;
      const cookies: chrome.cookies.Cookie[] = cookieString
        .split(";")
        .map((cookie) => {
          const [name, value] = cookie.trim().split("=");
          if (name && value !== undefined) {
            return {
              name,
              value: decodeURIComponent(value),
              domain: "localhost",
              path: "/",
              secure: false,
              httpOnly: true,
              sameSite: "no_restriction",
              session: true,
              hostOnly: true,
              expirationDate: undefined,
            } as chrome.cookies.Cookie;
          }
          return null;
        })
        .filter((cookie) => cookie !== null);
      resolve(cookies);
    }
  });
};

//增加Cookie
export const setCookie = async (
  setCookieDetails: Partial<chrome.cookies.Cookie> ,
  url?: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.set) {
         const { hostOnly, session, sameSite, domain, storeId, ...clearDetail } = setCookieDetails;
      const domainWithoutDot = domain?.startsWith(".") ? domain.substring(1) : domain;
      const cookieDetails: chrome.cookies.SetDetails = {
        url: url || `https://${domainWithoutDot}${setCookieDetails.path || "/"}`,
        domain: domainWithoutDot,
        ...clearDetail,
      };

      if (["lax", "strict", "no_restriction"].includes(sameSite as string)) {
        cookieDetails.sameSite = sameSite;
      }
      console.log("set remove hostOnly session storedId", hostOnly,session, storeId);
      chrome.cookies.set(cookieDetails, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (!result) {
          reject(new Error("Failed to set cookie."));
        } else {
          resolve(true);
        }
      });
    } else {
      reject(new Error("Chrome API 不可用"));
    }
  });
};

// 更新 cookie 的函数
export const updateCookie = async (
  url: string,
  oldName: string,
  newDetails: chrome.cookies.Cookie
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.remove && chrome?.cookies?.set) {
      // 先删除旧的 cookie
      chrome.cookies.remove({ url, name: oldName }, (removeResult) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        // 去除hostOnly属性
        const { session, hostOnly, ...detailsWithoutRestrictedProps } = newDetails;
        console.log("delete hostOnly", hostOnly);
        console.log("delete session", session);
        
        chrome.cookies.set({url, ...detailsWithoutRestrictedProps }, (setResult) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } else {
      reject(new Error("Chrome API 不可用"));
    }
  });
};

// 删除某个cookie
export const deleteCookie = async (
  url: string,
  name: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.remove) {
      chrome.cookies.remove(
        {
          url,
          name,
        },
        (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            resolve(false);
          } else {
            resolve(true);
          }
          console.log('delete res:',result);  
        }
      );
    } else {
      reject(new Error("Chrome API 不可用"));
      resolve(false);
    }
  });
};

//删除所有cookies
export const deleteAllCookies = async (url: string): Promise<void> => {
  const cookies = await getAllCookies(url);
  let successCount = 0;
  let failureCount = 0;

  const deletePromises = cookies.map((cookie) => {
    return deleteCookie(url, cookie.name)
      .then(() => {
        successCount++;
      })
      .catch((error) => {
        failureCount++;
        console.log('delete cookie',error);
      });
  });

  await Promise.all(deletePromises);
  notification.info({
    message: "Delete Results",
    description: `Successfully deleted ${successCount}.\n Failed to delete ${failureCount}.`,
    style: { whiteSpace: 'pre-line'},
    placement: "top"
  });
};

//复制到剪切板
export const copyText = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        notification.success({
          message: "Copy Success",
          description: "Text successfully copied to clipboard",
          duration: 3,
          placement: "top",
        });
      })
      .catch((error) => {
        notification.success({
          message: "Copy Error",
          description: `Error: ${error}`,
          duration: 3,
          placement: "top",
        });
      });
  } else {
    const fakeText = document.createElement("textarea");
    fakeText.classList.add("clipboardCopier");
    fakeText.textContent = text;
    document.body.appendChild(fakeText);
    fakeText.select();
    document.execCommand("Copy");
    document.body.removeChild(fakeText);
  }
};
//导出为json
export const exportCookiesAsFile = (cookies: chrome.cookies.Cookie[]) => {
  const cookiesJson = JSON.stringify(cookies, null, 2);
  const blob = new Blob([cookiesJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cookies.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
// 从剪贴板导入
export const importFromClipboard = async (): Promise<chrome.cookies.Cookie[]> => {
  try {
    const text = await navigator.clipboard.readText();
    const cookies = JSON.parse(text) as chrome.cookies.Cookie[];
    return cookies;
  } catch (error) {
    notification.error({
      message: "Import Error",
      description: `Error: ${error}`,
      duration: 3,
      placement: "top",
    });
    throw error;
  }
};
// 从文件导入
export const importFromFile = (): Promise<chrome.cookies.Cookie[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const cookies = JSON.parse(event.target?.result as string) as chrome.cookies.Cookie[];
            resolve(cookies);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });
};