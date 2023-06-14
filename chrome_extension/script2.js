async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
async function postData() {
    let tab = await getCurrentTab();
    let url = tab.url;

    fetch('http://localhost:5005/dump_chrome_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "url": url,
        })
    }).then(
        response => response.json()
    ).then(data => {
        console.log(data)
    }).catch(error => {
        console.log(error)
    })
}
setInterval(() => postData(), 1000);