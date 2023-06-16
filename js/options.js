// Zuna Browser Extenson
// Javascript required the Options page

// console.log("Options Page has been called")
/* globals window */
// Allows for cross-browser compatibility
window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

var optionsPage = {
  /******** 3. Creates Description Elements **********/
  parseDescription: function () {
    try {
      var divElem = document.createElement('h3');
      divElem.innerHTML = JSON.parse(localStorage.zunnaConfig).extensionDescription;
      document.getElementById('zunnaDescription').appendChild(divElem)
    } catch (e) {
      issueLog = "options > Description couldn't be parsed: " + e
      return {redirectUrl: window.browser.extension.getURL(
        "../html/resetConfig.html?issueURL=" + issue
      )}
    }
  },
  /******** Creates Description Elements End **********/

  /******** 4. Creates Feature List Elements **********/
  parseFeatureList: function () {
    try {
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
      
        divElem.innerHTML = JSON.parse(localStorage.zunnaConfig).featureList;

        document.getElementById('zunnaFeatureList').appendChild(divElem)
      }
    } catch (e) {
      issueLog = "optionsPage > FeatureList couldn't be parsed: " + e
      return {redirectUrl: window.browser.extension.getURL(
        "../html/resetConfig.html?issueURL=" + issue
      )}
      console.error(":  \n", e)
      return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html")};

    }
  },
  /******** Creates Description Elements End **********/

  /******** Updates User Settings Toggles **********/
  updateUserSettings: function () {
    try {
      phrase = JSON.stringify(document.getElementById("meaningfulPhrase").value);
      number = JSON.stringify(document.getElementById("meaningfulNumber").value);
      chr = JSON.stringify(document.getElementById("meaningfulSpecialChr").value);
      JSON.parse(localStorage.zunnaConfig).userDetailsArray = [phrase, number, chr]
    } catch (e) {
      issueLog = "popUp > User Settings couldn't be updated: " + e
      return {redirectUrl: window.browser.extension.getURL(
        "../html/resetConfig.html?issueURL=" + issue
      )}
    }
  },
  /******** Updates User Settings Toggles End **********/

  /******** 2. Loads optionsPage with Config contents **********/
  optionsPageMain: function () {
    // Call each function to display aspect of optionsPage
    optionsPage.parseDescription()
    optionsPage.parseFeatureList()
  }
}

/******** Creates Tabs Elements **********/
document.getElementById("AboutButton").addEventListener("click",function(){
  document.getElementById("About").style.display = "block";
  document.getElementById("Settings").style.display = "none";
  document.getElementById("Report").style.display = "none";
})
document.getElementById("SettingsButton").addEventListener("click",function(){
  document.getElementById("About").style.display = "none";
  document.getElementById("Settings").style.display = "block";
  document.getElementById("Report").style.display = "none";
})
document.getElementById("ReportButton").addEventListener("click",function(){
  document.getElementById("About").style.display = "none";
  document.getElementById("Settings").style.display = "none";
  document.getElementById("Report").style.display = "block";
})

/******** Listens for user to Click Reset Configuration File **********/
document.getElementById("resetConfig").addEventListener("click", function () {
  //Sends a message to the Background.js to reset the config
  window.browser.runtime.sendMessage({ fn: "resetConfigMsg" })
})


/******** Listens for user to Click Update User Details **********/
document.getElementById("updateUserDetails").addEventListener("click", function () {
  optionsPage.updateUserSettings()
})

/******** 1. Calls when optionsPage is clicked **********/
optionsPage.optionsPageMain()
