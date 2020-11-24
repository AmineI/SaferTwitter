unprocessedReceivedMediasSelector = ".css-1dbjc4n.r-1habvwh.r-13awgt0:not(.saferTwitter-processed)";
imageContainerSelector = ".css-1dbjc4n.r-1p0dtai.r-1mlwlqe.r-1d2f490.r-1udh08x.r-u8s1d.r-zchlnj.r-ipm5af.r-417010";
categorizableImageContainerSelector = ".css-1dbjc4n.r-1p0dtai.r-1mlwlqe.r-1d2f490.r-1udh08x.r-u8s1d.r-zchlnj.r-ipm5af.r-417010:not(.r-sdzlij):not(.r-1niwhzg):not([data-testid=tweetPhoto])";

confidenceThreshold = 10;


chrome.runtime.onMessage.addListener(message => {
    switch (message.command) {
        case "processReceivedMedias":
            setTimeout(() => GetUnprocessedReceivedMedias(document, InjectButtonsNextToMedia), 300);
            break;
    }
})


function GetUnprocessedReceivedMedias(parentNode, callback) {
    let receivedMedias = parentNode.querySelectorAll(unprocessedReceivedMediasSelector);
    receivedMedias.forEach((mediaDiv) => {
        if (mediaDiv.querySelector(imageContainerSelector))//If the div has an image container ready.
            callback(mediaDiv);
        //This check is mandatory because messages from unknown people create a received mediaDiv, but don't create the underlying image - Twitter displays a message instead, asking to confirm before viewing the media.
    });
}

function InjectButtonsNextToMedia(elem) {
    var buttonsContainer = elem.parentElement.firstElementChild;
    //This div contains elements to the right of the message, such as twitter reactions. It displays on hover only.

    var button_unblur = document.createElement("button");
    button_unblur.classList.add("saferTwitter-button");
    button_unblur.classList.add("saferTwitter-blur-button");
    button_unblur.appendChild(document.createTextNode("Toggle Blur"));
    button_unblur.addEventListener('click', () => {
        elem.classList.toggle("saferTwitter-unBlur");
    });
    buttonsContainer.append(button_unblur);

    if (elem.querySelector(categorizableImageContainerSelector)) {
        var button_ML = document.createElement("button");
        button_ML.classList.add("saferTwitter-button");
        button_ML.classList.add("saferTwitter-ML-button");
        button_ML.appendChild(document.createTextNode("Calculate image safety"));
        button_ML.addEventListener('click', () => {
            var imageContainer = elem.querySelector(categorizableImageContainerSelector);
            button_ML.disabled = true;
            if (imageContainer) {
                button_ML.textContent = "Processing"
                ProcessImageCategorization(button_ML, imageContainer.lastElementChild.src);
            } else
                button_ML.textContent = "Media not supported";
        }, {once: true});
        buttonsContainer.append(button_ML);
    }
    elem.classList.add("saferTwitter-processed");
    buttonsContainer.parentElement.classList.add("saferTwitter-buttonsContainer");
}


function ExtractTwitterImgUrlFromThumbnail(thumbnailUrl) {
    var imageUrl = new URL(thumbnailUrl);
    var idx = imageUrl.pathname.indexOf(":");
    if (idx !== -1)
        imageUrl.pathname = imageUrl.pathname.substring(0, idx);
    return imageUrl.href;
}

function DownloadTwitterImg(twitterImgUrl) {
    return fetch(twitterImgUrl, {
        "headers": {
            "accept": "image/webp,image/apng,image/*,*/*;q=0.8"
        },
        "referrer": "https://twitter.com/",
        "body": null,
        "method": "GET",
        "credentials": "include"
    })
}


function GetCategorizationResultsFromAPI(twitterImgUrl, callback) {
    DownloadTwitterImg(twitterImgUrl)
        .then(response => response.blob())
        .then(imageBlob =>
            chrome.runtime.sendMessage({
                command: "categorize",
                imageBlobUrl: URL.createObjectURL(imageBlob)
            }, callback)
        );
}


/**
 * Function to get image categorization results and write them to a specified DOM Element.
 * @param resultElement Node where the results will be added as textContent
 * @param thumbnailUrl url of the displayed twitter thumbnail
 */
function ProcessImageCategorization(resultElement, thumbnailUrl) {
    GetCategorizationResultsFromAPI(ExtractTwitterImgUrlFromThumbnail(thumbnailUrl), (categorizationResults) => {
        var text = "";
        if (categorizationResults)
            categorizationResults.forEach(({confidence, name}) => {
                if (confidence > confidenceThreshold)
                    text += name.en + " " + confidence.toPrecision(3) + "%" + "\r\n";
            })
        else
            text = "Processing Error";
        resultElement.textContent = text;
    });
}


