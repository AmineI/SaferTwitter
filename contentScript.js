unprocessedReceivedMediasSelector = ".css-1dbjc4n.r-1habvwh.r-13awgt0:not(.saferTwitter-processed)";
imageContainerSelector = ".css-1dbjc4n.r-1p0dtai.r-1mlwlqe.r-1d2f490.r-1udh08x.r-u8s1d.r-zchlnj.r-ipm5af.r-417010";


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

    elem.classList.add("saferTwitter-processed");
    buttonsContainer.parentElement.classList.add("saferTwitter-buttonsContainer");
}
