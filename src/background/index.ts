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