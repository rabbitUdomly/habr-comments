
function init_navigation() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "start"});
    });
}

document.getElementById('init_navigation').addEventListener('click', init_navigation);