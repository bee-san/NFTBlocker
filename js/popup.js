/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  browser.tabs.query(queryInfo).then(function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}


function showOptions() {
  document.getElementById('options').style.display = 'block';
  document.getElementById('status').style.display = 'none';
}
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
  document.getElementById('options').style.display = 'none';
  document.getElementById('status').style.display = 'block';
}
function runBlockchain(type) {
  browser.storage.local.set({removeImageBlock: Math.random()});
  browser.tabs.query({active: true, currentWindow: true}).then(function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {blockChainStart: type}).then(function(response) {
          console.log(response);
          if (typeof response !== "undefined" && typeof response.error !== "undefined")
              renderStatus(response.error_description);
      });
      // piggybacking on chrome's storage class to send an event to our background page.
      browser.storage.local.set({addImageBlock: Math.random(), tabId: tabs[0].id});
  });
}
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('runBlockchain').addEventListener("click", function() { runBlockchain('block'); } );
  document.getElementById('runExportchain').addEventListener("click", function() { runBlockchain('export'); });
  document.getElementById('runImportchain').addEventListener("click", function() { runBlockchain('import'); });
  document.getElementById('runImportUnblockchain').addEventListener("click", function() { runBlockchain('importunblock', true); });
  getCurrentTabUrl(function(url) {
    browser.storage.local.set({removeImageBlock: Math.random()});
    if (url.indexOf("https://twitter.com") > -1 || url.indexOf("https://mobile.twitter.com") > -1) {
        showOptions();
    }
    else {
        // Put the image URL in Google search.
        renderStatus('Navigate to a twitter following or followers page.');
    }
  });
});

