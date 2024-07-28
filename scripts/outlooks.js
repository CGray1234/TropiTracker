document.addEventListener('DOMContentLoaded', () => {
    const atlButton = document.getElementById("atlButton");
    const pacButton = document.getElementById("pacButton");
    const cpacButton = document.getElementById("cpacButton");

    const atlImage = document.getElementById("atlImage");
    const pacImage = document.getElementById("pacImage");
    const cpacImage = document.getElementById("cpacImage");

    const atlUrl = `https://www.nhc.noaa.gov/xml/TWOAT.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
    const epacUrl = `https://www.nhc.noaa.gov/xml/TWOEP.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
    const pacUrl = `https://www.nhc.noaa.gov/xml/TWOCP.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
    const proxyUrl = 'https://corsproxy.io/?';

    const outlookText = document.getElementById("outlook");

    fetchOutlookData(proxyUrl, atlUrl, outlookText);
    
    atlButton.onclick = () => changeImageDisplay(proxyUrl, atlUrl, outlookText, atlImage, pacImage, cpacImage);
    pacButton.onclick = () => changeImageDisplay(proxyUrl, epacUrl, outlookText, pacImage, atlImage, cpacImage);
    cpacButton.onclick = () => changeImageDisplay(proxyUrl, pacUrl, outlookText, cpacImage, pacImage, atlImage);
});

function fetchOutlookData(proxyUrl, rssUrl, outlookText) {
    fetch(proxyUrl + rssUrl)
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const outlookData = data.getElementsByTagNameNS("*", "item")[0].getElementsByTagNameNS("*", "description")[0].textContent;

            outlookText.innerHTML = outlookData;
        })
    .catch(error => {
        console.error('Error:', error);
    });
}

function changeImageDisplay(proxyUrl, rssUrl, outlookText, showImage, ...hideImages) {
    showImage.style.display = "block";
    hideImages.forEach(image => image.style.display = "none");

    fetchOutlookData(proxyUrl, rssUrl, outlookText);
}

function openNav() {
    const nav = document.getElementById('fullscreenNavbar');
    nav.style.display = 'block';
}

function closeNav() {
    const nav = document.getElementById('fullscreenNavbar');
    nav.style.display = 'none';
}