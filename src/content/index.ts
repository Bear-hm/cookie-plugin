// 监听cookie变化
chrome.cookies.onChanged.addListener((changeInfo) => {
  const { cause, cookie, removed } = changeInfo;
  console.log("Cookie change detected:");
  console.log(`Cause: ${cause}`);
  console.log("Cookie:", cookie);
  console.log(`Removed: ${removed}`);
});

chrome.cookies.getAllCookieStores((cookieStores) => {
  console.log("All cookie stores:");
  cookieStores.forEach((store) => {
    console.log(`Store ID: ${store.id}, Tab IDs: ${store.tabIds}`);
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTabUrl = tabs[0]?.url; // 获取当前标签页的 URL

  if (currentTabUrl) {
    // 更新 cookie 设置
    chrome.cookies.set(
      {
        url: currentTabUrl as string,
        name: "myCookie",
        value: "cookieValue",
        expirationDate: Math.floor(Date.now() / 1000) + 3600, // 设置1小时后过期
      },
      (cookie) => {
        if (cookie) {
          console.log("Cookie set successfully:", cookie);
        } else {
          console.error("Failed to set cookie.");
        }
      }
    );

    // 删除特定域和名称的 Cookie
    chrome.cookies.remove(
      { url: currentTabUrl as string, name: "myCookie" },
      (details) => {
        if (details) {
          console.log("Cookie removed:", details);
        } else {
          console.error("Failed to remove cookie.");
        }
      }
    );

    // 获取所有 cookies
    chrome.cookies.getAll({ url: currentTabUrl }, (cookies) => {
      console.log("All cookies for current tab:");
      cookies.forEach((cookie) => {
        console.log(cookie);
      });
    });

    // 获取特定 cookie
    chrome.cookies.get({ url: currentTabUrl, name: "myCookie" }, (cookie) => {
      if (cookie) {
        console.log("Cookie found:", cookie);
      } else {
        console.log("Cookie not found");
      }
    });
  }
});
