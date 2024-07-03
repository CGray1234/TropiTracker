document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');

    const remnantList = document.getElementById('remnants');

    const apiUrl = `https://www.nhc.noaa.gov/CurrentStorms.json?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
    const proxyUrl = 'https://corsproxy.io/?';

    let hideremnants = true;

    const remnantButton = document.getElementById('remnants-label');
    remnantButton.onclick = toggleremnants;

    const remnantDropdown = document.getElementById('remnant-dropdown');
    function toggleremnants() {
        if (hideremnants) {
            remnantList.style.display = "block";
            remnantDropdown.innerHTML = "arrow_drop_down";
            hideremnants = false;
        } else {
            remnantList.style.display = "none";
            remnantDropdown.innerHTML = "arrow_right";
            hideremnants = true;
        }
    }

    fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            const activeremnants = data.activeStorms.filter(storm => storm.classification === 'HU');
            
            let remnantProperGrammar = activeremnants.length === 1 ? "remnant" : "remnants";
            
            stormCount.textContent = `Found ${activeremnants.length} ${remnantProperGrammar}.`;

            remnantButton.style.display = activeremnants.length === 0 ? "none" : "block";
            
            activeremnants.forEach(remnant => {
                const remnantListItem = createStormListItem(remnant, 'remnant');
                remnantList.appendChild(remnantListItem);
                fetchStormDetails(remnant, remnantListItem, 'remnant');
            });
        });

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
                const winds = data.getElementsByTagNameNS('*', 'wind')[0].textContent.replace(/\D/g, '');
                let category = "";
                if (type === 'remnant') {
                    stormListItem.innerHTML = `Remnants of ${storm.name}`;
                }

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

    function getremnantCategory(winds) {
        if (winds >= 157) {
            return "5";
        } else if (winds >= 130) {
            return "4";
        } else if (winds >= 111) {
            return "3";
        } else if (winds >= 96) {
            return "2";
        } else {
            return "1";
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});

function openNav() {
    const nav = document.getElementById('fullscreenNavbar');
    nav.style.display = 'block';
}

function closeNav() {
    const nav = document.getElementById('fullscreenNavbar');
    nav.style.display = 'none';
}