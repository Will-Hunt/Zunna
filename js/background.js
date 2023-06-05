// Zuna Browser Extenson
// Javascript required for background functions, called when browser starts

// console.log("Background Page has been called")
/* globals window */
// Allows for cross-browser compatibility
window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

const background = {
  /******** Safe URL Check Start **********/
  redirectURLCheck: function (currentURL) {
    var urlSearchParameters = new URL(currentURL).search;
    // Check if the URL redirects to another URL 
    // by matching the destination location of this link with the pattern: «Protocol://*Protocol://*». 
    if (urlSearchParameters.includes("http")) {
      var newURL = urlSearchParameters.slice(urlSearchParameters.indexOf("http"))
      defaultSliceIndex = -1; //Sometimes redirect URLs don't contain & or ? so get the entire string
      if (newURL.indexOf("&") > defaultSliceIndex) defaultSliceIndex = newURL.indexOf("&");
      if (newURL.indexOf("?") > defaultSliceIndex) defaultSliceIndex = newURL.indexOf("?");
      return newURL.slice(0, defaultSliceIndex);
    } else return currentURL;
  },
  httpSRedirect: function (currentURL) {
    //If page is http, check if there is a https first
    return "https://" + currentURL.slice(currentURL.indexOf("//") + 2);
  },
  httpAllowCheck: function (currentURL) {
    try {
      //If the Secure HTTP URL isn't available then show a warning message
      warningPageLink = window.browser.extension.getURL("../html/websiteWarning.html");
      warningPageLinkWithQuery = warningPageLink + "?" + currentURL;
      return { redirectUrl: warningPageLinkWithQuery };
    } catch (e) {
      console.error("background: httpSCheck failed \n", e)
    }
  },
  /******** Safe URL Check End **********/

  /******** Tracking Protection Start **********/
  trackingURLParameters: function (currentURL) {
    try {
      // new URL() gives an error if the URL is encodedc
      currentURL = decodeURIComponent(currentURL)
      var currentURLSearch = new URL(currentURL).search;
      if (currentURLSearch.length == 0) return currentURL
      // If there is a known tracking attribute search for it
      for (var parameter of JSON.parse(localStorage.zunnaConfig).parametersToRemove) {
        //   If found, delete it.
        if (currentURL.includes(parameter)) {
          indexBeforeParameter = currentURL.indexOf(parameter)
          // -1 also removes th '&'
          if (currentURL.slice(indexBeforeParameter - 1) == "&") indexBeforeParameter -= 1

          var beforeParameter = currentURL.slice(0, indexBeforeParameter)
          var remainingURL = currentURL.slice(indexBeforeParameter)

          if (remainingURL.includes("&")) {
            // +1 also removes the '&' or '?'
            indexAfterParameter = (remainingURL.indexOf("&") || remainingURL.indexOf("?")) + 1
            var afterParameter = remainingURL.slice(indexAfterParameter)
            // Combine Strings from before and after the parameter than was removed
            currentURL = beforeParameter + afterParameter
          } else currentURL = beforeParameter
        };
      };
      return currentURL;
    } catch (e) {
      console.error("background: trackingURLParameters failed \n", e)
    }
  },
  /******** Tracking Protection End **********/

  /******** XSS Protection Start **********/
  // Main function for the Cross-Site Scripting Protection featur
  reflectiveXXS: function (currentURL) {
    try {
      //Check if URL contains Script Tags
      if (currentURL.includes("<script>") && currentURL.includes("</script>")) {
        var beforeParameter = currentURL.slice(0, currentURL.indexOf("<script>"));
        var afterParameter = currentURL.slice(currentURL.indexOf("</script>") + 9);
        // Combine Strings from before and after the parameter than was removed
        newURL = beforeParameter + afterParameter;
        //Ensure the URL is encoded to prevent scripts/code to run 
        return newRedirectURL = encodeURI(newURL) || newURL;
      } else return currentURL;
    } catch (e) {
      console.error("background: reflectiveXXSMain failed \n", e)
    }
    //Note: Only Reflactive XXS is a client-side issue, 
    // Persistent & DOM is Server-side 
  },
  /******** XSS Protection End **********/

  /******** Cookie Protection Start **********/
  cookieURLCheck: function (currentURL) {
    try {
      // new URL() gives an error if the URL is encodedc
      currentURL = decodeURIComponent(currentURL);
      var currentURLHost = new URL(currentURL).host;

      config = JSON.parse(localStorage.zunnaConfig)
      var threshold = config.trackersThreshold;
      var trackerMap = config.trackerMap;
      var userBlockList = config.userBlockList;

      if (trackerMap[currentURLHost]) {
        if (trackerMap[currentURLHost] > threshold) {
          // Tracker needs to be blocked, because it's been seen multiple times
          if (!currentURLHost) userBlockList.push(currentURLHost);
          urlToRemove = "*://*." + currentURLHost + "/*";
          trackerMap.delete(urlToRemove);
          config.userBlockList = userBlockList;
          config.trackerMap = trackerMap;
          return { cancel: true }
        } else {
          // The tracker has been noticed again
          trackerMap[currentURLHost]++
        };
      } else {
        // The URL hasn't been seen so it needs to be added to the list
        trackerMap[currentURLHost] = 0
      };
      return currentURL;
    } catch (e) {
      console.error("background: cookieURLCheck failed \n", e)
    }
  },
  cookieCount: function () {
    window.browser.cookies.getAll({}, function (cookies) {
      config = JSON.parse(localStorage.zunnaConfig);
      config.cookiesCount = cookies.length;
      localStorage.setItem("zunnaConfig", JSON.stringify(config))
    })
  },
  deleteAllCookies: function () {
    window.browser.cookies.getAll({}, function (cookies) {
      for (var cookie of cookies) {
        try {
          // For each cookie remove where name and url match
          window.browser.cookies.remove(cookie.name, cookie.domain)
        } catch (e) {
          console.log("background: deleting cookies failed \n", e)
        }
      }
    });
  },
  deleteSiteCookies: function () {
    window.browser.cookies.getAll({}, function (cookies) {
      for (var cookie of cookies) {
        //Remove if URL matches current
        if (tab[0].url == cookie.domain) {
          try {
            // For each cookie remove where name and url match
            window.browser.cookies.remove(cookie.name, cookie.domain)
          } catch (e) {
            console.log("background: deleting cookies failed \n", e)
          }
        }
      }
    });
  },
  /******** Cookie Protection End **********/

  /******** 4. Screens each URL **********/
  checkURL: function (initialURL) {
    try {
      config = JSON.parse(localStorage.zunnaConfig)
      //Each feature includes multiple methods, with the aim of causing the least amount of interferance or latency to the user. 
      //Such as HTTP(S) redirect is quicker than getting permission each time
      // new URL() gives an error if the URL is encoded
      currentURL = decodeURIComponent(initialURL) || initialURL;
      var currentURLHost = new URL(currentURL).host;
      //If the feature is turned on, call the feature function 
      if (config.featureList.find(({ id }) => id == "safeWebChec").featureOn && config.userBlockList.includes(currentURLHost)) {
        return { cancel: true }
      };
      if (config.featureList.find(({ id }) => id == "xXSProt").featureOn) {
        currentURL = background.reflectiveXXS(currentURL);
      };
      if (config.featureList.find(({ id }) => id == "safeWebChec").featureOn) {
        currentURL = background.redirectURLCheck(currentURL);
        //If the URL protocol is http, call the feature function 
        if (currentURL.includes("http:")) currentURL = background.httpSRedirect(currentURL);
      };
      if (config.featureList.find(({ id }) => id == "trackProt").featureOn) {
        currentURL = background.trackingURLParameters(currentURL);
      };
      if (config.featureList.find(({ id }) => id == "cookieProt").featureOn) {
        currentURL = background.cookieURLCheck(currentURL);
        background.cookieCount();
      };
      //Check if the URL isn't allowed by user, then check the URL for HTTPS Protocol, Redirect and Permission
      if (config.featureList.find(({ id }) => id == "safeWebChec").featureOn && currentURL.includes("http:")) {
        currentURL = decodeURIComponent(response.url) || response.url;
        var currentURLHost = new URL(currentURL).host;
        if (!config.urlsToAllow.includes(currentURLHost)) background.httpAllowCheck(currentURL);
      };

      return { redirectUrl: encodeURI(currentURL) };
    } catch (e) {
      console.error("background: checkURL failed \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html") };
    }
    //Issue to Overcome: The order and changes made by functions, caused reprecutions
    //Such as one test link included a http redirct but had no search parameter close
  },
  /******** Screens each URL End **********/

  /******** Message Responses Start **********/
  getFeatureListMsg: function (request, sender, sendResponse) { sendResponse(JSON.parse(localStorage.zunnaConfig).featureList) },
  resetConfigMsg: function () { 
    localStorage.removeItem("zunnaConfig"); 
    main.loadDefaultConfig() 
  },
  /******** Message Responses End **********/

  /******** 3. Listeners after Config has loaded **********/
  listerners: function (urlsToBlock) {
    // If the URL is in the array of blocked, then block the request before the page loads
    window.browser.webRequest.onBeforeRequest.addListener(function () {
      config = JSON.parse(localStorage.zunnaConfig);
      config.urlsBlocked += 1;
      localStorage.setItem("zunnaConfig", JSON.stringify(config))
      return { cancel: true }
    }, { urls: urlsToBlock }, ["blocking"]);

    //Call the checkURL function to check URLs before they load, if the url has not already been blocked
    window.browser.webRequest.onBeforeRequest.addListener(function (response) {
      return background.checkURL(response.url)
    }, { urls: ["http://*/*", "https://*/*"] }, ["blocking"]);

    //Listen for messages for example Options page and Popup
    window.browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      // Although this mitigates the error of functions being missing, 
      // this can result in response being undefined e.g if function names are mispelt 
      if (background[request.fn]) background[request.fn](request, sender, sendResponse);
    });
  },
}

/******** 2.Loads Config and Calls Listeners **********/
var main = {
  //The first step is to load the config file, storing settings and urls to be blocked
  loadDefaultConfig: function () {
    var xhr = new XMLHttpRequest(); //Initial AJAX to get file
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        console.log("Zunna DefaultConfigurations Set");
        //XHR has been called and is complete
        localStorage.setItem("zunnaConfig", xhr.response)
      };
      // For testing default Config use: localStorage.removeItem("zunnaConfig") 
    };
    if (!window.browser) return
    //Get the necessary file
    xhr.open("GET", window.browser.extension.getURL("/data/config.json"), true);
    xhr.send();
  },
  loadZunaConfig: function () {
    // The config is required throughout the browser extension
    // If the config isn't found in the local storage, then the default needs to be set
    if (!localStorage.zunnaConfig) main.loadDefaultConfig()
    main.loadURLsToBlock()
  },
  loadURLsToBlock: function () {
    var xhr = new XMLHttpRequest(); //Initial AJAX to get file
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        //XHR has been called and is complete
        defaultUrlsToBlock = JSON.parse(xhr.response);
        // The main background function won't be called till the Config has loaded
        background.listerners(defaultUrlsToBlock)
      }
    };
    if (!window.browser) return
    //Get the necessary file
    xhr.open("GET", window.browser.extension.getURL("/data/urlsToBlock.json"), true);
    xhr.send();
  }
}
/******** 1. Calls first function **********/
main.loadZunaConfig()

/******** Export Functions for testing **********/
// module.exports = background;