// Zuna Browser Extenson
// Javascript required the Options page

console.log("Warning Page has been called")

/******** Listens for Click On Return to Previous Page Button **********/
document.getElementById('returnToPreviousPage').addEventListener('click', () => {
  //Forces the current window to go back 1 url in history
  window.history.go(-1)
});
/******** Listens for Click On Continue to Page Button **********/
document.getElementById('continueToPage').addEventListener('click', () => {
  //Break down the current UrL into the core components
  originalUrl = new URL(document.location.href)
  // Grab the original url from the current url
  urlToRedirect = originalUrl.search.slice(1)
  //Force the current window to update and open the url the user originally wanted
  window.open(urlToRedirect,"_self")
});