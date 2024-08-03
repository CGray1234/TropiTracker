document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');

    const stormList = document.getElementById('storms');

    stormList.innerHTML = '';

    const apiUrl = `https://www.nhc.noaa.gov/CurrentStorms.json?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
    const proxyUrl = 'https://corsproxy.io/?';

    let hideStorms = true;

    const stormButton = document.getElementById('storm-label');
    stormButton.onclick = toggleStorms;

    const stormDropdown = document.getElementById('storm-dropdown');
    function toggleStorms() {
        if (hideStorms) {
            stormList.style.display = "block";
            stormDropdown.innerHTML = "arrow_drop_down";
            hideStorms = false;
        } else {
            stormList.style.display = "none";
            stormDropdown.innerHTML = "arrow_right";
            hideStorms = true;
        }
    }

    function fetchStormData() {
    hurricaneList.innerHTML = '';
    fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            const activeStorms = data.activeStorms.filter(storm => storm.classification === 'TS');
            
            let stormProperGrammar = activeStorms.length === 1 ? "Storm" : "Storms";
            
            stormCount.textContent = `Found ${activeStorms.length} Tropical ${stormProperGrammar}.`;

            stormButton.style.display = activeStorms.length === 0 ? "none" : "block";

            activeStorms.forEach(storm => {
                const stormListItem = createStormListItem(storm, 'storm');
                stormList.appendChild(stormListItem);
                fetchStormDetails(storm, stormListItem, 'storm');
            });
        });
    }

    function createStormListItem(storm, type) {
        const stormListItem = document.createElement('div');
    
        stormListItem.id = storm.binNumber;
        stormListItem.className = `${type}-list-item`;
    
        const stormText = document.createElement('span');
        stormText.textContent = `${capitalize(type)} ${storm.name}`;
        stormListItem.appendChild(stormText);
    
        return stormListItem;
    }

    function fetchStormDetails(storm, stormListItem, type) {
        const rssUrl = `https://www.nhc.noaa.gov/nhc_${storm.binNumber.toLowerCase()}.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
        fetch(proxyUrl + rssUrl)
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(data => {
                stormListItem.innerHTML = `
                <img src="https://tropitracker.com/images/tropical-storm.png" id="hurricane-icon">
                Tropical Storm ${storm.name}`;

                const lastUpdate = data.getElementsByTagNameNS('*', "datetime")[0].textContent;
                const updateDiv = document.createElement('div');
                updateDiv.className = `${type}-update`;
                updateDiv.innerHTML = `Last updated: ${lastUpdate}`;
                stormListItem.appendChild(updateDiv);

                const headline = data.getElementsByTagNameNS('*', 'headline')[0].textContent;
                const headlineDiv = document.createElement('div');
                headlineDiv.className = `${type}-headline`;
                headlineDiv.innerHTML = `${headline}`;
                stormListItem.appendChild(headlineDiv);

                const fourDigitBinNumber = storm.binNumber.length === 3 ? storm.binNumber.slice(0, 2) + '0' + storm.binNumber.slice(2) : storm.binNumber;
                const coneGraphicUrl = `https://www.nhc.noaa.gov/storm_graphics/${fourDigitBinNumber}/${storm.id.toUpperCase()}_5day_cone_with_line_and_wind.png`;
                const satelliteUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${storm.id.toUpperCase()}/GEOCOLOR/${storm.id.toUpperCase()}-GEOCOLOR-1000x1000.gif`
                const IrSatUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${storm.id.toUpperCase()}/13/${storm.id.toUpperCase()}-13-1000x1000.gif`

                const imgButtonDiv = document.createElement('div');
                imgButtonDiv.className = "img-button-div";
                stormListItem.appendChild(imgButtonDiv);

                const coneButton = createImgButton('Cone Tracks', () => changeImageDisplay(coneImage, satImage, irImage));
                const satelliteButton = createImgButton('Satellite', () => changeImageDisplay(satImage, coneImage, irImage));
                const IrSatButton = createImgButton('Infrared Satellite', () => changeImageDisplay(irImage, coneImage, satImage));

                imgButtonDiv.appendChild(coneButton);
                imgButtonDiv.appendChild(satelliteButton);
                imgButtonDiv.appendChild(IrSatButton);

                const coneImage = document.createElement('img');
                coneImage.className = `${type}-image`;
                coneImage.src = coneGraphicUrl;
                coneImage.style.display = "block";
                stormListItem.appendChild(coneImage);

                const satImage = document.createElement('img');
                satImage.className = `${type}-image`;
                satImage.src = satelliteUrl;
                satImage.style.display = "none";
                stormListItem.appendChild(satImage);

                const irImage = document.createElement('img');
                irImage.className = `${type}-image`;
                irImage.src = IrSatUrl;
                irImage.style.display = "none";
                stormListItem.appendChild(irImage);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function createImgButton(label, onClick) {
        const button = document.createElement('button');
        button.className = "img-button";
        button.innerHTML = label;
        button.onclick = onClick;
        return button;
    }

    function changeImageDisplay(showImage, ...hideImages) {
        showImage.style.display = "block";
        hideImages.forEach(image => image.style.display = "none");
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    fetchStormData();

    setInterval(fetchStormData, 60000);
});

function openNav() {
    const nav = document.getElementById('fullscreenNavbar');
    nav.style.display = 'block';
}

function closeNav() {
    const nav = document.getElementById('fullscreenNavbar');
    nav.style.display = 'none';
}
