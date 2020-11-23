
chrome.webRequest.onCompleted.addListener((info) => {
    chrome.tabs.sendMessage(info.tabId, {command: "processReceivedMedias"})
}, {urls: ["*://ton.twitter.com/*/data/dm/*",/*"*://pbs.twimg.com/dm_*_preview/*",*/"*://pbs.twimg.com/*"], types: ["image"]})
