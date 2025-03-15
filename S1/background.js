chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: 'window.html',
        type: 'popup',
        width: 500,
        height: 700
    });
});
