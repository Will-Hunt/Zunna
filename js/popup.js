// Zuna Browser Extenson
// Interaction with the Popup page

// console.log("PopUp Page has been called")
/* globals window */
window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

var popUp = {
  /******** 3. Updates Title **********/
  updateTitle: function () {
    try {
      //Firstly set the Title to be Off 
      document.getElementById("zunnaH1").style.color = "Red"
      for (var feature of JSON.parse(localStorage.zunnaConfig).featureList) {
        // If any of the features are on then show the extension is turned on
        if (feature.featureOn) document.getElementById("zunnaH1").style.color = "ForestGreen"
      }
    } catch (e) {
      console.error("Pop up: Title couldn't be updated \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html") };
    }
  },
  /******** Updates Title End **********/

  /******** 4. Creates Feature Elements **********/
  parseFeatures: function () {
    try {
      //For each feature in feature list create a element to display in PopUp
      // By using a loop through the config reduces the need to hardcode each feature
      // Changes can be made once from Config
      for (var feature of JSON.parse(localStorage.zunnaConfig).featureList) {
        var divElem = document.createElement('div');
        if (feature.featureOn) {
          featureBlock = '<input type="checkbox" class="zunnaFeatureCheckbox" checked id="' + feature.id + '">';
          if (document.getElementById(feature.id)) {
            document.getElementById(feature.id).style.visibility = "visible";
          }
        }
        else {
          featureBlock = '<input type="checkbox" class="zunnaFeatureCheckbox" id="' + feature.id + '">';
          if (document.getElementById(feature.id)) document.getElementById(feature.id).style.visibility = "hidden";
        }
        featureBlock += '<h3 class="zunnaH3">' + feature.name + '</h3>';
        divElem.innerHTML = featureBlock;
        document.getElementById('featuresToList').appendChild(divElem)
      }
    } catch (e) {
      console.error("Pop up:Features couldn't be parsed \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html") };
    }
  },
  /******** Creates Feature Elements End **********/

  /******** 5. Display Password Options Start **********/
  displayPwd: function () {
    // If the user has checked the Password Suggestion protection feature on, then call the function
    if (JSON.parse(localStorage.zunnaConfig).featureList.find(({ id }) => id == "pwdSug").featureOn) {
      document.getElementById("zunnaPwdButton").style.display = 'block';
    } else {
      document.getElementById("zunnaPwdButton").style.display = 'none';
    }
  },
  /******** Display Password Options End **********/

  /******** 6. Gets Cookies Count **********/
  cookiesCounter: function () {
    try {
      //Get the number of trackers detected and blocked 
      trackerCount = JSON.parse(localStorage.zunnaConfig).trackerMap.length || 0;
      cookieCount = JSON.parse(localStorage.zunnaConfig).cookiesCount || 0;
      document.getElementById("cookiesCounter").innerHTML = cookieCount + trackerCount;
    } catch (e) {
      console.error("Pop up:Tracker Number couldn't be updated \n", e)
    }
  },
  /******** Gets Tracker Count End **********/

  /******** 7. Gets Adverts Count **********/
  advertsCounter: function () {
    try {
      //Get the number of trackers detected and blocked 
      document.getElementById("advertsCounter").innerHTML = JSON.parse(localStorage.zunnaConfig).urlsBlocked;
    } catch (e) {
      console.error("Pop up: Adverts Blocked Number couldn't be updated \n", e)
    }
  },
  /******** Gets Tracker Count End **********/

  /******** Updates Feature List Toggles **********/
  updateFeatureList: function () {
    try {
      config = JSON.parse(localStorage.zunnaConfig)
      //For Each Feature Toggle, set featureOn to True or False
      for (var feature of config.featureList) {
        feature.featureOn = document.getElementById(feature.id).checked;
        if (document.getElementById(feature.id)) {
          document.getElementById(feature.id).style.visibility = "visible";
        }
        else document.getElementById(feature.id).style.visibility = "hidden";
      }
      localStorage.setItem("zunnaConfig", JSON.stringify(config))
      //Update Title as the Toggles have changed
      popUp.updateTitle()
      popUp.displayPwd()
    } catch (e) {
      console.error("Options Page: Feature List couldn't be updated \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html") };
    }
    //Issue Overcome: maintaining config persistence
  },
  /******** Updates Feature List Toggles End **********/

  /******** 2. Loads PopUp with Config contents **********/
  popUpMain: function () {
    // Call each function to display aspect of PopUp
    popUp.updateTitle()
    popUp.parseFeatures()
    popUp.displayPwd()
    popUp.cookiesCounter()
    popUp.advertsCounter()
  }
}

/******** Listens for Click in PopUp Window **********/
document.addEventListener('click', function () {
  popUp.updateFeatureList()
}, false);

/******** Password Suggestion Start **********/
function pwdSuggestion() {
  try {
    var suggestedPassword = ""
    for (var value of JSON.parse(localStorage.zunnaConfig).userDetailsArray) suggestedPassword += value;
    // Send Message to get current tab web page name 
    var websiteName = window.browser.runtime.sendMessage({ fn: "getWebPageName" }, function (response) {
      return response;
    })
    if (websiteName) return suggestedPassword + websiteName
    else return suggestedPassword
  } catch (e) {
    console.error("contentScript: pwdSuggestion failed \n", e)
  }
}
zunnaShowPwdButton = document.getElementById('zunnaShowPwdButton')
if (zunnaShowPwdButton) {
  zunnaShowPwdButton.addEventListener('click', () => {
    document.getElementById("zunnaPwdButton").innerHTML += "<h1 class= 'zunnaH2'>" + pwdSuggestion() + "</h1>"
  })
};

zunnaCopyPwdButton = document.getElementById('zunnaCopyPwdButton')
if (zunnaCopyPwdButton) {
  zunnaCopyPwdButton.addEventListener('click', (e) => {
    const textarea = document.createElement('textarea')
    // Set the password to the text value
    textarea.value = pwdSuggestion()
    textarea.setAttribute('readonly', '');
    // Hide the password  textarea.style = "opacity: 0";
    document.body.appendChild(textarea);
    // Select Password
    textarea.select()
    try {
      //Copy the selcted text
      document.execCommand('copy');
    } catch (e) {
      console.error("contentScript: pwdSuggestion failed to copyToClipboard \n", e)
    }
    textarea.remove()
  })
};

/******** Password Suggestion End **********/

/******** Listens for Click On Delete Cookies Buttons **********/
deleteAllCookies = document.getElementById('deleteAllCookies')
if (deleteAllCookies) {
  deleteAllCookies.addEventListener('click', () => {
    window.browser.runtime.sendMessage({ fn: "deleteAllCookies" })
  })
};
deleteSiteCookies = document.getElementById('deleteSiteCookies')
if (deleteSiteCookies) {
  deleteSiteCookies.addEventListener('click', () => {
    window.browser.runtime.sendMessage({ fn: "deleteSiteCookies" })
  })
};
/******** 1. Calls when PopUp is clicked **********/
popUp.popUpMain()