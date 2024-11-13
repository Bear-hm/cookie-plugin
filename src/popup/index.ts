export const getAllCookies = async (
  url: string
): Promise<chrome.cookies.Cookie[]> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.getAll) {
      const domain = new URL(url).hostname;
      const isLocalhost = domain === "localhost" || domain === "127.0.0.1";

      chrome.cookies.getAll(
        {
          url: isLocalhost ? "http://localhost" : `http://${domain}`,
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
      console.log('cookieString', cookieString);
      
      const cookies: chrome.cookies.Cookie[] = cookieString
        .split(";")
        .map((cookie) => {
          const [name, value] = cookie.trim().split("=");
          return {
            name,
            value: decodeURIComponent(value),
            domain: "localhost",
            path: "/",
            secure: false,
            httpOnly: false,
            sameSite: "no_restriction",
            session: true,
            hostOnly: true,
            expirationDate: undefined,
            size: value.length, 
            priority: "default", 
          } as chrome.cookies.Cookie;
        })
        .filter((cookie) => cookie.name);
      resolve(cookies);
    }
  });
};

export const setCookie = async (
  url: string,
  name: string,
  value: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (chrome?.cookies?.set) {
      chrome.cookies.set(
        {
          url,
          name,
          value,
        },
        (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            console.log('cookie.set result',result);
          } else {
            resolve();
          }
        }
      );
    } else {
      reject(new Error("Chrome API 不可用"));
    }
  });
};

export const deleteCookie = async (
  url: string,
  name: string
): Promise<void> => {
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
          } else {
            resolve();
          }
        }
      );
    } else {
      reject(new Error("Chrome API 不可用"));
    }
  });
};
