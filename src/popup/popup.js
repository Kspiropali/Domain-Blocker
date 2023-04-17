// default domain key->value
let blockedDomainsKey = "blockedDomains";
// current domain completed string
let domain = '';

function reloadTab() {
    chrome.tabs.reload();
}

// clean domain names(https://google.com/whateverurl -> google.com)
function filterDomainName(url) {
    const hostname = new URL(url).hostname.replace(/^www\./i, "");
    return hostname.split('.').slice(-2).join('.');
}

// display domains to the popup.html table
function displayDomains() {
    const table = document.getElementById('domainTable');

    chrome.storage.local.get([domain], (result) => {
        // get the list of blocked domains
        const domains = result[domain] || [];

        console.log(domains);

        // Get the ul element, or create it if it doesn't exist
        let ul = document.getElementById('domains');

        if (!ul) {
            ul = document.createElement('ul');
            ul.id = 'domains';
        }

        // Clear any existing list items
        ul.innerHTML = '';

        // Add list items for each blocked domain
        domains.forEach(function (domain) {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            li.appendChild(checkbox);
            li.appendChild(document.createTextNode(domain));
            ul.appendChild(li);
        });

        // Clear the table
        table.innerHTML = '';

        // Create a new row for each domain
        domains.forEach(domain => {
            //console.log(domain);
            const row = table.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.innerHTML = domain;
            cell2.innerHTML = '<button class="blockButton"">Block</button>';
            cell3.innerHTML = '<button class="unblockButton"" >Unblock</button>';

            // check the color of the table's row
            chrome.storage.local.get([blockedDomainsKey], (result) => {
                if (result[blockedDomainsKey].includes(domain)) {
                    // set color to light red
                    row.style.backgroundColor = "lightcoral";
                } else {
                    row.style.backgroundColor = "lightgreen";
                }
            });

            cell2.addEventListener('click', function () {
                // set the color of the table's row to red
                row.style.backgroundColor = "lightcoral";
                blockDomain(domain);
            })
            cell3.addEventListener('click', function () {
                // set the color of the table's row to green
                row.style.backgroundColor = "lightgreen";
                unblockDomain(domain);
            })
        });
    });
}

// add domain to the list of blocked domains when user clicks block button
function blockDomain(domain) {
    // push the domain to the list of blocked domains
    chrome.storage.local.get([blockedDomainsKey], (result) => {

        // check if domain is already blocked
        if (result[blockedDomainsKey].includes(domain)) {
            return;
        }

        const blockedDomains = result[blockedDomainsKey] || [];
        blockedDomains.push(domain);
        chrome.storage.local.set({[blockedDomainsKey]: blockedDomains}, function () {
            displayDomains();
        });
    });
}

// remove domain from the list of blocked domains when user clicks unblock button
function unblockDomain(domain) {
    // remove domain from the list of global blocked domains
    chrome.storage.local.get([blockedDomainsKey], (result) => {
        const blockedDomains = result[blockedDomainsKey] || [];
        const index = blockedDomains.indexOf(domain);
        if (index > -1) {
            blockedDomains.splice(index, 1);
        }

        chrome.storage.local.set({[blockedDomainsKey]: blockedDomains}, function () {
            displayDomains();
        });
    });
}

// Update the table when the popup is loaded and opened
document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Get the URL of the currently active tab
        domain = tabs[0].url;
        domain = filterDomainName(domain);
        displayDomains();
    });
});

// set event listener from popup collapse/hide
window.addEventListener('blur', reloadTab);
window.addEventListener('unload', reloadTab);
