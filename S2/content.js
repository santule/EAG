// Send selected text to the extension when text is selected
document.addEventListener('mouseup', () => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
        chrome.runtime.sendMessage({
            action: 'setSelectedText',
            text: selection
        });
    }
});
