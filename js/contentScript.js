// Zuna Browser Extenson
// Javascript required for interaction with the current tab page

// console.log("ContentScript has been called")
/* globals window */
// Allows for cross-browser compatibility
window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

var contentScript = {
  /******** Clickjacking Protection Start **********/
  // Main function for the Clickjacking Protection feature
  clickjackingMain: function () {
    //Three Methods are tried to prevent clickjacking attacks, at least one should work for every page
    //Firstly put all Frames visible on the same level 
    //Secondly only allow frames from the original page
    //Thirdly show or remove all iFrames
    try {
      // Method 1: Frame Busting
      //iFrames can be hidden on a different z-index, all elements should be shown in the same location
      if (top != window) top.location = window.location
      //Method 2: Same Site iFrame only

    } catch (e) {
      //Method 3: Showing frames
      contentScript.highlightFrames()
      console.error("contentScript: clickjackingMain Method 2 failed \n", e)
    }
  },
  sameSiteIFrame: function () {
    // Adding a tag to page header, only allowing iFrames from the original page
    // Preventing external or attacks from adding potentially dangerous iFrames
    // Deny prevents frames displaying, sameorigin displays frames from the same page, 
    // allow-from-*url* frames only from url
    document.getElementsByTagName("head")[0].appendChild("X-Frame-Options", "SAMEORIGIN");
  },
  highlightFrames: function () {
    //Method 3: Showing frames
    //Get all iFrames and show or remove them 
    //Make a list of all iFrame elements on a page 
    var iFrameList = document.getElementsByTagName("iframe")
    console.log("Document contains " + iFrameList.length + " frames");
    for (var iFrame of iFrameList) {
      iFrame.style = "opacity:0.5; border: 5px dashed red";
      // document.removeChild(iFrame) //Removed each iFrame from document 
    }
  },
  /******** Clickjacking Protection End **********/

/******** 1. Calls first function when a page has loaded **********/
// Each time a page has loaded, the config is requested and the protection checker feature
window.browser.runtime.sendMessage({ fn: "getFeatureListMsg" }, function (response) {
  try {
    //Calls the contentScriptMain function after config has been called
    contentScript.clickjackingMain();
  } catch (e) {
    console.error("contentScript: Config Message failed")
    return { redirectUrl: window.browser.extension.getURL("../html/resetConfig.html")};
  }
})
