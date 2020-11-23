DEFAULT_API_KEY = 'acc_d706df0b98e201b';
DEFAULT_API_SECRET = '4c01b561518ffeba42c11d0041a3bbdf';

chrome.webRequest.onCompleted.addListener((info) => {
    chrome.tabs.sendMessage(info.tabId, {command: "processReceivedMedias"})
}, {urls: ["*://ton.twitter.com/*/data/dm/*",/*"*://pbs.twimg.com/dm_*_preview/*",*/"*://pbs.twimg.com/*"], types: ["image"]})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.command) {
        case "categorize":
            chrome.storage.sync.get(
                {
                    "apiKey": DEFAULT_API_KEY,
                    "apiSecret": DEFAULT_API_SECRET
                },
                ({apiKey, apiSecret}) => {
                    getImaggaCategorization(message.imageBlobUrl, apiKey, apiSecret)
                        .then(r => sendResponse(r));
                }
            )
            return true;//We return true to inform the browser that the response will be sent asynchronously
    }
});


async function getImaggaCategorization(imageBlobUrl, apiKey, apiSecret) {

    const formData = new FormData();
    let imageBlob = await fetch(imageBlobUrl).then(r => r.blob());

    formData.append('image', imageBlob);

    return fetch("https://api.imagga.com/v2/categories/nsfw_beta", {
        method: 'POST',
        headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Authorization': 'Basic ' + btoa(`${apiKey}:${apiSecret}`)
        },
        body: formData
    })
        .then(response => response.json())
        .then(response => {
            if (response.status.type === "success")
                return response.result.categories
        })
        .catch(error => console.log('Error:', error));
}
