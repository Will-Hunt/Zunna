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

  /******** 2. Loads PopUp with Config contents **********/
  popUpMain: function () {
    // Call each function to display aspect of PopUp
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