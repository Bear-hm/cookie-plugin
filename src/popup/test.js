getAllCookies(callback) {
    if (this.browserDetector.supportsPromises()) {
      this.browserDetector
        .getApi()
        .cookies.getAll({
          url: this.currentTab.url,
          storeId: this.currentTab.cookieStoreId,
        })
        .then(callback, function (e) {
          console.error('Failed to retrieve cookies', e);
        });
    } else {
      this.browserDetector.getApi().cookies.getAll(
        {
          url: this.currentTab.url,
          storeId: this.currentTab.cookieStoreId,
        },
        callback,
      );
    }
  };
  saveCookie(cookie, url, callback) {
    cookie = this.prepareCookie(cookie, url);
    if (this.browserDetector.supportsPromises()) {
      this.browserDetector
        .getApi()
        .cookies.set(cookie)
        .then(
          (cookie, a, b, c) => {
            if (callback) {
              callback(null, cookie);
            }
          },
          (error) => {
            console.error('Failed to create cookie', error);
            if (callback) {
              callback(error.message, null);
            }
          },
        );
    } else {
      this.browserDetector.getApi().cookies.set(cookie, (cookieResponse) => {
        const error = this.browserDetector.getApi().runtime.lastError;
        if (!cookieResponse || error) {
          console.error('Failed to create cookie', error);
          if (callback) {
            const errorMessage =
              (error ? error.message : '') || 'Unknown error';
            return callback(errorMessage, cookieResponse);
          }
          return;
        }
  
        if (callback) {
          return callback(null, cookieResponse);
        }
      });
    }
  };

  removeCookie(name, url, callback, isRecursive = false) {
    if (this.browserDetector.isSafari() && !isRecursive) {
      this.getAllCookies((cookies) => {
        for (const cookie of cookies) {
          if (cookie.name === name) {
            this.removeCookie(name, 'http://' + cookie.domain, callback, true);
          }
        }
      });
    } else if (this.browserDetector.supportsPromises()) {
      this.browserDetector
        .getApi()
        .cookies.remove({
          name: name,
          url: url,
          storeId: this.currentTab.cookieStoreId,
        })
        .then(callback, function (e) {
          console.error('Failed to remove cookies', e);
          if (callback) {
            callback();
          }
        });
    } else {
      this.browserDetector.getApi().cookies.remove(
        {
          name: name,
          url: url,
          storeId: this.currentTab.cookieStoreId,
        },
        (cookieResponse) => {
          const error = this.browserDetector.getApi().runtime.lastError;
          if (!cookieResponse || error) {
            console.error('Failed to remove cookie', error);
            if (callback) {
              const errorMessage =
                (error ? error.message : '') || 'Unknown error';
              return callback(errorMessage, cookieResponse);
            }
            return;
          }
  
          if (callback) {
            return callback(null, cookieResponse);
          }
        },
      );
    }
  };