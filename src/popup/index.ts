import { notification } from "antd";
export const getAllCookies = async (
  url: string
): Promise<chrome.cookies.Cookie[]> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.getAll) {
      const domain = new URL(url).hostname;
      const protocol = new URL(url).protocol;
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
            // 确保 name 和 value 都存在
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
  url: string,
  setCookieDetails: chrome.cookies.Cookie
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.set) {
      console.log("将要设置的 cookie", setCookieDetails);
      
      const { sameSite, hostOnly, session, ...detailsWithoutHostOnly } = setCookieDetails;
      const validSameSiteValues = ["no_restriction", "lax", "strict"] as const;
      // 提前处理 sameSite 值
      detailsWithoutHostOnly.sameSite = validSameSiteValues.includes(sameSite as any) ? sameSite : "no_restriction";
      
      // const { hostOnly,session, ...detailsWithoutHostOnly } = setCookieDetails;
      console.log("set remove hostOly session", hostOnly,session);
      
      chrome.cookies.set({ url, ...detailsWithoutHostOnly }, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (!result) {
          reject(new Error("Failed to set cookie."));
        } else {
          resolve();
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
    message: "Delete All Cookies Summary",
    description: `Successfully deleted ${successCount} cookies.\n Failed to delete ${failureCount} cookies.`,
    style: { whiteSpace: 'pre-line' }
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
        });
      })
      .catch((error) => {
        notification.success({
          message: "Copy Error",
          description: `Error: ${error}`,
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
  notification.success({
    message: "export File Success",
    description: "Cookie information successfully exported to file",
  });
};

// 从剪贴板导入
export const importFromClipboard = async (): Promise<chrome.cookies.Cookie[]> => {
  try {
    const text = await navigator.clipboard.readText();
    const cookies = JSON.parse(text) as chrome.cookies.Cookie[];
    notification.success({
      message: "Import Success",
      description: "Cookies successfully imported from clipboard",
    });
    return cookies;
  } catch (error) {
    notification.error({
      message: "Import Error",
      description: "Failed to import cookies from clipboard. Please ensure valid JSON format.",
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
            notification.success({
              message: "Import Success",
              description: "Cookies successfully imported from file",
            });
            resolve(cookies);
          } catch (error) {
            notification.error({
              message: "Import Error",
              description: "Failed to parse JSON file",
            });
            reject(error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });
};