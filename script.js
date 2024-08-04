document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');

    const hurricaneList = document.getElementById('hurricanes');
    const depList = document.getElementById('depressions');
    const stormList = document.getElementById('storms');

    const proxyUrl = 'https://corsproxy.io/?';

    let hideHurricanes = true;
    let hideTS = true;
    let hideTD = true;

    let currentImageType = 'cone'; // Track the current image type

    const hurricaneButton = document.getElementById('hurricane-label');
    hurricaneButton.onclick = toggleHurricanes;

    const stormButton = document.getElementById('storm-label');
    stormButton.onclick = toggleStorms;

    const depButton = document.getElementById('depression-label');
    depButton.onclick = toggleDeps;

    const hurricaneDropdown = document.getElementById('hurricane-dropdown');
    const stormDropdown = document.getElementById('storm-dropdown');
    const depDropdown = document.getElementById('dep-dropdown');

    function toggleHurricanes() {
        if (hideHurricanes) {
            hurricaneList.style.display = "block";
            hurricaneDropdown.innerHTML = "arrow_drop_down";
            hideHurricanes = false;
        } else {
            hurricaneList.style.display = "none";
            hurricaneDropdown.innerHTML = "arrow_right";
            hideHurricanes = true;
        }
    }

    function toggleStorms() {
        if (hideTS) {
            stormList.style.display = "block";
            stormDropdown.innerHTML = "arrow_drop_down";
            hideTS = false;
        } else {
            stormList.style.display = "none";
            stormDropdown.innerHTML = "arrow_right";
            hideTS = true;
        }
    }

    function toggleDeps() {
        if (hideTD) {
            depList.style.display = "block";
            depDropdown.innerHTML = "arrow_drop_down";
            hideTD = false;
        } else {
            depList.style.display = "none";
            depDropdown.innerHTML = "arrow_right";
            hideTD = true;
        }
    }

    function fetchStormData() {
        const currentStormData = {
            hurricanes: [],
            storms: [],
            depressions: []
        };

        const xmlUrls = [
            `https://www.nhc.noaa.gov/index-at.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`,
            `https://www.nhc.noaa.gov/index-ep.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`,
            `https://www.nhc.noaa.gov/index-cp.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`
        ];

        Promise.all(xmlUrls.map(url => fetch(proxyUrl + url).then(response => response.text())))
            .then(responses => {
                responses.forEach(str => {
                    const data = (new window.DOMParser()).parseFromString(str, "text/xml");
                    const storms = data.getElementsByTagNameNS('*', 'Cyclone');

                    Array.from(storms).forEach(storm => {
                        const name = storm.getElementsByTagNameNS('*', 'name')[0].textContent;
                        const type = storm.getElementsByTagNameNS('*', 'type')[0].textContent.toLowerCase();
                        const wallet = storm.getElementsByTagNameNS('*', 'wallet')[0].textContent;
                        const atcf = storm.getElementsByTagNameNS('*', 'atcf')[0].textContent;
                        const datetime = storm.getElementsByTagNameNS('*', "datetime")[0].textContent;
                        const movement = storm.getElementsByTagNameNS('*', "movement")[0].textContent;
                        const pressure = storm.getElementsByTagNameNS('*', "pressure")[0].textContent;
                        const wind = storm.getElementsByTagNameNS('*', "wind")[0].textContent;
                        const headline = storm.getElementsByTagNameNS('*', "headline")[0].textContent;

                        const stormData = { type, name, wallet, atcf, datetime, movement, pressure, wind, headline };
                        if (type === "hurricane") {
                            currentStormData.hurricanes.push(stormData);
                        } else if (type.includes("storm")) {
                            currentStormData.storms.push(stormData);
                        } else if (type.includes("depression")) {
                            currentStormData.depressions.push(stormData);
                        }
                    });
                });

                updateStormLists(currentStormData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function updateStormLists(stormData) {
        updateStormList(hurricaneList, stormData.hurricanes, "hurricane");
        updateStormList(stormList, stormData.storms, "storm");
        updateStormList(depList, stormData.depressions, "depression");

        const activeHurricanes = hurricaneList.children.length;
        const activeTropicalStorms = stormList.children.length;
        const activeTropicalDeps = depList.children.length;

        let hurricaneProperGrammar = activeHurricanes === 1 ? "Hurricane" : "Hurricanes";
        let stormProperGrammar = activeTropicalStorms === 1 ? "Tropical Storm" : "Tropical Storms";
        let depProperGrammar = activeTropicalDeps === 1 ? "Tropical Depression" : "Tropical Depressions";

        stormCount.textContent = `Found ${activeHurricanes} ${hurricaneProperGrammar}, ${activeTropicalStorms} ${stormProperGrammar}, and ${activeTropicalDeps} ${depProperGrammar}.`;

        hurricaneButton.style.display = activeHurricanes === 0 ? "none" : "block";
        stormButton.style.display = activeTropicalStorms === 0 ? "none" : "block";
        depButton.style.display = activeTropicalDeps === 0 ? "none" : "block";
    }

    function updateStormList(listElement, storms, type) {
        listElement.innerHTML = '';
        storms.forEach(storm => {
            const stormListItem = createStormListItem(
                storm.type, storm.name, storm.wallet, storm.atcf, storm.datetime,
                storm.movement, storm.pressure, storm.wind, storm.headline
            );
            listElement.appendChild(stormListItem);

            // Restore the last selected image
            const imageToShow = stormListItem.querySelector(`#${currentImageType}Image`);
            if (imageToShow) {
                changeImageDisplay(imageToShow, ...stormListItem.querySelectorAll('.storm-image:not(#' + currentImageType + 'Image)'));
            }
        });
    }

    function createStormListItem(type, name, wallet, atcf, datetime, movement, pressure, wind, headline) {
        const stormListItem = document.createElement('div');

        const stormText = document.createElement('span');
        stormListItem.appendChild(stormText);

        if (type === "hurricane") {
            const hurricaneIcon = document.createElement('img');
            hurricaneIcon.src = '/images/hurricane.png';
            hurricaneIcon.id = 'hurricane-icon';
            hurricaneIcon.style.marginRight = "5px";
            stormListItem.className = "hurricane-list-item";
            stormListItem.appendChild(hurricaneIcon);

            let category = getHurricaneCategory(wind);

            if (category >= 3) {
                type = "Major Hurricane";
            } else {
                type = "Hurricane";
            }

            stormListItem.innerHTML += `${type} ${name}: Category ${category}`;
        } else if (type.includes("storm")) {
            const tsIcon = document.createElement('img');
            tsIcon.src = '/images/tropical-storm.png';
            tsIcon.id = 'hurricane-icon';
            stormListItem.className = "storm-list-item";
            stormListItem.appendChild(tsIcon);

            stormListItem.innerHTML += `${type} ${name}`;
        } else if (type.includes("depression")) {
            stormListItem.className = "depression-list-item";
            stormListItem.innerHTML = `${type} ${name}`;
        }

        const update = document.createElement('div');
        update.className = "hurricane-update";
        update.textContent = `Last updated: ${datetime}`;
        stormListItem.appendChild(update);

        const headlineElement = document.createElement('div');
        headlineElement.className = "hurricane-headline";
        headlineElement.textContent = `${headline}`;
        stormListItem.appendChild(headlineElement);

        const details = document.createElement('div');
        details.className = "hurricane-headline";
        details.id = "details";
        details.style.marginTop = "10px";
        details.style.textDecoration = "underline";
        details.innerHTML = `Winds: ${wind}<br>Pressure: ${pressure}<br>Movement: ${movement}`;
        stormListItem.appendChild(details);

        const fourDigitWallet = wallet.length === 3 ? wallet.slice(0, 2) + '0' + wallet.slice(2) : wallet;
        const coneGraphicUrl = `https://www.nhc.noaa.gov/storm_graphics/${fourDigitWallet}/${atcf}_5day_cone_with_line_and_wind.png`;
        const satelliteUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${atcf}/GEOCOLOR/${atcf}-GEOCOLOR-1000x1000.gif`;
        const IrSatUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${atcf}/13/${atcf}-13-1000x1000.gif`;

        const imgButtonDiv = document.createElement('div');
        imgButtonDiv.className = 'img-button-div';
        stormListItem.appendChild(imgButtonDiv);

        const coneButton = createImgButton('Cone Tracks', () => {
            currentImageType = 'cone';
            changeImageDisplay(coneImage, satImage, irImage);
        });
        const satelliteButton = createImgButton('Satellite', () => {
            currentImageType = 'sat';
            changeImageDisplay(satImage, coneImage, irImage);
        });
        const IrSatButton = createImgButton('Infrared Satellite', () => {
            currentImageType = 'ir';
            changeImageDisplay(irImage, coneImage, satImage);
        });

        imgButtonDiv.appendChild(coneButton);
        imgButtonDiv.appendChild(satelliteButton);
        imgButtonDiv.appendChild(IrSatButton);

        const coneImage = document.createElement('img');
        coneImage.className = `storm-image`;
        coneImage.src = coneGraphicUrl;
        coneImage.id = "coneImage";
        coneImage.style.display = "block";
        stormListItem.appendChild(coneImage);

        const satImage = document.createElement('img');
        satImage.className = `storm-image`;
        satImage.src = satelliteUrl;
        satImage.id = "satImage";
        satImage.style.display = "none";
        stormListItem.appendChild(satImage);

        const irImage = document.createElement('img');
        irImage.className = `storm-image`;
        irImage.src = IrSatUrl;
        irImage.id = "irImage";
        irImage.style.display = "none";
        stormListItem.appendChild(irImage);

        return stormListItem;
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

    function getHurricaneCategory(winds) {
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