// get and filter a domain name
function getDomainName(url) {
    let domain;
    if (url.indexOf("://") > -1) {
        domain = url.split("/")[2];
    } else {
        domain = url.split("/")[0];
    }
    domain = domain.split(":")[0];
    domain = domain.split("?")[0];
    domain = domain.replace(/^www\./i, "");
    const splitDomain = domain.split('.');
    if (splitDomain.length > 2) {
        domain = splitDomain.slice(1).join('.');
    }
    return domain;
}

// Function to retrieve the connecting domains for a specific domain
function getDomains(domain, callback) {
    chrome.storage.local.get([domain], (result) => {
        const blockedDomains = result[domain] || [];
        callback(blockedDomains);
    });
}

// Function to add a connecting domain for a specific domain
function addDomain(domain, blockedDomain) {
    getDomains(domain, (domains) => {
        if (!domains.includes(blockedDomain)) {
            domains.push(blockedDomain);
            const storageObject = {};
            storageObject[domain] = domains;
            chrome.storage.local.set(storageObject);
        }
    });
}

// Function to remove a connecting domain for a specific domain
function blockRequest() {
    return {cancel: true};
}

// Function to add or remove the listener, depending on the domains
function saveMyBandwidth(domains) {
    // Remove the listener if it exists
    chrome.webRequest.onBeforeRequest.removeListener(blockRequest);

    // If there are no domains, return early
    if (!domains || domains.length === 0) {
        return;
    }

    // Convert the domains to URL patterns
    const urls = domains.map(domain => `*://*.${domain}/*`);

    // Add or remove the listener as specified
    chrome.webRequest.onBeforeRequest.addListener(
        blockRequest,
        {urls},
        ["blocking"]
    );

}

// before every domain javascript/whatever request is loaded
chrome.webRequest.onBeforeRequest.addListener(
    details => {
        if (details.url === null || details.url.startsWith("chrome-extension://") || details.initiator === undefined || details.initiator === '' || details.initiator === details.url || details.type === 'script') {
            return; // exclude requests initiated by browser or Chrome extensions
        }
        const url = new URL(details.url).hostname.replace(/^www\./i, "");
        const domain = getDomainName(details.initiator);
        //console.log(domain, url);
        addDomain(domain, url);

    },
    {
        urls: ['<all_urls>']
    });

// Listen for changes to the blockedDomains key
chrome.storage.onChanged.addListener(function (changes) {
    // Get the new and old values of the blockedDomains key
    const newDomains = changes.blockedDomains ? changes.blockedDomains.newValue || [] : [];

    saveMyBandwidth(newDomains);
});


// check if list is not initialized
chrome.storage.local.get(['blockedDomains'], (result) => {
    if (!result.blockedDomains) {
        chrome.storage.local.set({blockedDomains: []}, function () {
            console.log('blockedDomains initialized');
        });
    }
});