chrome.cookies.onChanged.addListener((changeInfo) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      const currentUrl = tabs[0].url;
      const cookieDomain = changeInfo.cookie.domain;
      
      if (currentUrl.includes(cookieDomain.replace(/^\./, ''))) {
        chrome.cookies.getAll({ url: currentUrl }).then((cookies) => {
          chrome.runtime.sendMessage({
            type: "cookiesChanged",
            cookies: cookies
          });
        });
      }
    }
  });
});

// 保留原有的消息监听
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getCookies") {
    chrome.cookies.getAll({ url: request.url })
      .then((cookies) => {
        sendResponse({ success: true, cookies });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});