// Experimental hiding of certain ad frames

// Define a list of ad container selectors
const adSelectors = [
    ".ad-container",
    ".ads",
    ".ad",
    ".ad-unit",
    // ... add more selectors as needed
];

// Loop through each ad selector and hide any matching elements
adSelectors.forEach((selector) => {
    const ads = document.querySelectorAll(selector);
    ads.forEach((ad) => {
        ad.style.display = "none";
    });
});