document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');

    const hurricaneList = document.getElementById('hurricanes');
    const depList = document.getElementById('depressions');
    const stormList = document.getElementById('storms');

    const apiUrl = `https://www.nhc.noaa.gov/CurrentStorms.json?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
    const proxyUrl = 'https://corsproxy.io/?';

    let hideHurricanes = true;
    let hideTS = true;
    let hideTD = true;

    const hurricaneButton = document.getElementById('hurricane-label');
    hurricaneButton.onclick = toggleHurricanes;

    const stormButton = document.getElementById('storm-label');
    stormButton.onclick = toggleStorms;

    const depButton = document.getElementById('depression-label');
    depButton.onclick = toggleDeps;

    function toggleHurricanes() {
        if (hideHurricanes == true) {
            document.getElementById('hurricanes').style.display = "block";
            hideHurricanes = false;
        } else {
            document.getElementById('hurricanes').style.display = "none";
            hideHurricanes = true;
        }
    }

    function toggleStorms() {
        if (hideTS == true) {
            document.getElementById('storms').style.display = "block";
            hideTS = false;
        } else {
            document.getElementById('storms').style.display = "none";
            hideTS = true;
        }
    }

    function toggleDeps() {
        if (hideTD == true) {
            document.getElementById('depressions').style.display = "block";
            hideTD = false;
        } else {
            document.getElementById('depressions').style.display = "none";
            hideTD = true;
        }
    }

    fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            const activeHurricanes = data.activeStorms.filter(storm => storm.classification === 'HU');
            const activeTropicalStorms = data.activeStorms.filter(storm => storm.classification === 'TS');
            const activeTropicalDeps = data.activeStorms.filter(storm => storm.classification === 'TD');

            let hurricaneProperGrammar = ""
            if (activeHurricanes.length == 1) {
                hurricaneProperGrammar = "Hurricane";
            } else {
                hurricaneProperGrammar = "Hurricanes";
            }

            let stormProperGrammar = ""
            if (activeTropicalStorms.length == 1) {
                stormProperGrammar = "Tropical Storm";
            } else {
                stormProperGrammar = "Tropical Storms";
            }

            let depProperGrammar = ""
            if (activeTropicalDeps.length == 1) {
                depProperGrammar = "Tropical Depression";
            } else {
                depProperGrammar = "Tropical Depressions";
            }

            stormCount.textContent = `Found ${activeHurricanes.length} ${hurricaneProperGrammar}, ${activeTropicalStorms.length} ${stormProperGrammar}, and ${activeTropicalDeps.length} ${depProperGrammar}.`;

            if (activeHurricanes.length == 0) {
                hurricaneButton.style.display = "none";
            } else {
                hurricaneButton.style.display = "block";
            }

            if (activeTropicalStorms.length == 0) {
                stormButton.style.display = "none";
            } else {
                stormButton.style.display = "block";
            }

            if (activeTropicalDeps.length == 0) {
                depButton.style.display = "none";
            } else {
                depButton.style.display = "block";
            }

            activeHurricanes.forEach(hurricane => {
                const hurricaneListItem = document.createElement('div');

                const dropdownRight = document.createElement('span');
                dropdownRight.className = "material-symbols-outlined";
                dropdownRight.innerHTML = " arrow_right ";
                hurricaneListItem.appendChild(dropdownRight);

                hurricaneListItem.id = hurricane.binNumber;
                hurricaneListItem.className = "hurricane-list-item";
                hurricaneListItem.innerHTML = `Hurricane ${hurricane.name}`;
                hurricaneList.appendChild(hurricaneListItem);

                const rssUrl = `https://www.nhc.noaa.gov/nhc_${hurricane.binNumber.toLowerCase()}.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
                fetch(proxyUrl + rssUrl)
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {
                        const winds = data.getElementsByTagNameNS('*', 'wind')[0].textContent.replace(/\D/g, '');
                        let category = ""
                        if (winds >= 157) {
                            category = '5 (major)';
                        } else if (winds >= 130) {
                            category = '4 (major)';
                        } else if (winds >= 111) {
                            category = '3 (major)';
                        } else if (winds >= 96) {
                            category = '2';
                        } else if (winds >= 74) {
                            category = '1';
                        } else {
                            category = 'Unknown';
                        }
                        hurricaneListItem.innerHTML = `Hurricane ${hurricane.name}: Category ${category}`;

                        const lastUpdate = data.getElementsByTagNameNS('*', "datetime")[0].textContent;
                        const updateDiv = document.createElement('div');
                        updateDiv.className = "hurricane-update";
                        updateDiv.innerHTML = `Last updated: ${lastUpdate}`;
                        hurricaneListItem.appendChild(updateDiv);

                        const headline = data.getElementsByTagNameNS('*', 'headline')[0].textContent;
                        const headlineDiv = document.createElement('div');
                        headlineDiv.className = "hurricane-headline";
                        headlineDiv.innerHTML = `${headline}`;
                        hurricaneListItem.appendChild(headlineDiv);

                        const imgButtonDiv = document.createElement('div');
                        imgButtonDiv.className = "img-button-div";
                        hurricaneListItem.appendChild(imgButtonDiv);

                        const fourDigitBinNumber = hurricane.binNumber.length === 3 ? hurricane.binNumber.slice(0, 2) + '0' + hurricane.binNumber.slice(2) : hurricane.binNumber;
                        const coneGraphicUrl = `https://www.nhc.noaa.gov/storm_graphics/${fourDigitBinNumber}/${hurricane.id.toUpperCase()}_5day_cone_with_line_and_wind.png`;
                        const satelliteUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${hurricane.id.toUpperCase()}/GEOCOLOR/${hurricane.id.toUpperCase()}-GEOCOLOR-1000x1000.gif`
                        const IrSatUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${hurricane.id.toUpperCase()}/13/${hurricane.id.toUpperCase()}-13-1000x1000.gif`

                        const coneImage = document.createElement('img');
                        coneImage.className = "hurricane-image";
                        coneImage.src = coneGraphicUrl;
                        hurricaneListItem.appendChild(coneImage);
                        coneImage.style.display = "block";

                        const satImage = document.createElement('img');
                        satImage.className = "hurricane-image";
                        satImage.src = satelliteUrl;
                        hurricaneListItem.appendChild(satImage);
                        satImage.style.display = "none";

                        const irImage = document.createElement('img');
                        irImage.className = "hurricane-image";
                        irImage.src = IrSatUrl;
                        hurricaneListItem.appendChild(satImage);
                        irImage.style.display = "none";

                        const coneButton = document.createElement('button');
                        coneButton.className = "img-button";
                        coneButton.innerHTML = "Cone Tracks";

                        const satelliteButton = document.createElement('button');
                        satelliteButton.className = "img-button";
                        satelliteButton.innerHTML = "Sattelite";

                        const IrSatButton = document.createElement('button');
                        IrSatButton.className = "img-button";
                        IrSatButton.innerHTML = "Infrared Sattelite";

                        coneButton.onclick = changeToCone;
                        satelliteButton.onclick = changeToSatellite;
                        IrSatButton.onclick = changeToIR;

                        imgButtonDiv.appendChild(coneButton);
                        imgButtonDiv.appendChild(satelliteButton);
                        imgButtonDiv.appendChild(IrSatButton);

                        hurricaneListItem.appendChild(satImage);
                        hurricaneListItem.appendChild(irImage);
                        hurricaneListItem.appendChild(coneImage);
                        
                        function changeToSatellite() {
                            satImage.style.display = "block";
                            irImage.style.display = "none";
                            coneImage.style.display = "none";
                        }

                        function changeToIR() {
                            satImage.style.display = "none";
                            irImage.style.display = "block";
                            coneImage.style.display = "none";
                        }

                        function changeToCone() {
                            satImage.style.display = "none";
                            irImage.style.display = "none";
                            coneImage.style.display = "block";
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching RSS feed:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.className = "error";
                        errorDiv.innerHTML = 'Error loading RSS feed';
                        hurricaneListItem.appendChild(errorDiv);
                    });
            });

            activeTropicalDeps.forEach(depression => {
                const depListItem = document.createElement('div');

                const dropdownRight = document.createElement('span');
                dropdownRight.className = "material-symbols-outlined";
                dropdownRight.innerHTML = " arrow_right ";
                depListItem.appendChild(dropdownRight);

                depListItem.id = depression.binNumber;
                depListItem.className = "dep-list-item";
                depListItem.innerHTML = `Tropical Depression ${depression.name}`;
                depList.appendChild(depListItem);

                const rssUrl = `https://www.nhc.noaa.gov/nhc_${depression.binNumber.toLowerCase()}.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
                fetch(proxyUrl + rssUrl)
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {
                        const lastUpdate = data.getElementsByTagNameNS('*', "datetime")[0].textContent;
                        const updateDiv = document.createElement('div');
                        updateDiv.className = "depression-update";
                        updateDiv.innerHTML = `Last updated: ${lastUpdate}`;
                        depListItem.appendChild(updateDiv);

                        const headline = data.getElementsByTagNameNS('*', 'headline')[0].textContent;
                        const headlineDiv = document.createElement('div');
                        headlineDiv.className = "depression-headline";
                        headlineDiv.innerHTML = `${headline}`;
                        depListItem.appendChild(headlineDiv);

                        const fourDigitBinNumber = depression.binNumber.length === 3 ? depression.binNumber.slice(0, 2) + '0' + depression.binNumber.slice(2) : depression.binNumber;
                        const coneGraphicUrl = `https://www.nhc.noaa.gov/storm_graphics/${fourDigitBinNumber}/${depression.id.toUpperCase()}_5day_cone_with_line_and_wind.png`;
                        const satelliteUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${depression.id.toUpperCase()}/GEOCOLOR/${depression.id.toUpperCase()}-GEOCOLOR-1000x1000.gif`
                        const IrSatUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${depression.id.toUpperCase()}/13/${depression.id.toUpperCase()}-13-1000x1000.gif`

                        const coneImage = document.createElement('img');
                        coneImage.className = "dep-image";
                        coneImage.src = coneGraphicUrl;
                        depListItem.appendChild(coneImage);
                        coneImage.style.display = "block";

                        const satImage = document.createElement('img');
                        satImage.className = "dep-image";
                        satImage.src = satelliteUrl;
                        depListItem.appendChild(satImage);
                        satImage.style.display = "none";

                        const irImage = document.createElement('img');
                        irImage.className = "dep-image";
                        irImage.src = IrSatUrl;
                        depListItem.appendChild(satImage);
                        irImage.style.display = "none";

                        const imgButtonDiv = document.createElement('div');
                        imgButtonDiv.className = "img-button-div";
                        depListItem.appendChild(imgButtonDiv);

                        const coneButton = document.createElement('button');
                        coneButton.className = "img-button";
                        coneButton.innerHTML = "Cone Tracks";

                        const satelliteButton = document.createElement('button');
                        satelliteButton.className = "img-button";
                        satelliteButton.innerHTML = "Sattelite";

                        const IrSatButton = document.createElement('button');
                        IrSatButton.className = "img-button";
                        IrSatButton.innerHTML = "Infrared Sattelite";

                        coneButton.onclick = changeToCone;
                        satelliteButton.onclick = changeToSatellite;
                        IrSatButton.onclick = changeToIR;

                        imgButtonDiv.appendChild(coneButton);
                        imgButtonDiv.appendChild(satelliteButton);
                        imgButtonDiv.appendChild(IrSatButton);

                        depListItem.appendChild(satImage);
                        depListItem.appendChild(irImage);
                        depListItem.appendChild(coneImage);
                        
                        function changeToSatellite() {
                            satImage.style.display = "block";
                            irImage.style.display = "none";
                            coneImage.style.display = "none";
                        }

                        function changeToIR() {
                            satImage.style.display = "none";
                            irImage.style.display = "block";
                            coneImage.style.display = "none";
                        }

                        function changeToCone() {
                            satImage.style.display = "none";
                            irImage.style.display = "none";
                            coneImage.style.display = "block";
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching RSS feed:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.className = "error";
                        errorDiv.innerHTML = 'Error loading RSS feed';
                        depListItem.appendChild(errorDiv);
                    });
                });

            activeTropicalStorms.forEach(storm => {
                const stormListItem = document.createElement('div');

                const dropdownRight = document.createElement('span');
                dropdownRight.className = "material-symbols-outlined";
                dropdownRight.innerHTML = " arrow_right ";
                stormListItem.appendChild(dropdownRight);

                stormListItem.id = storm.binNumber;
                stormListItem.className = "dep-list-item";
                stormListItem.innerHTML = `Tropical Storm ${storm.name}`;
                stormList.appendChild(stormListItem);

                const rssUrl = `https://www.nhc.noaa.gov/nhc_${storm.binNumber.toLowerCase()}.xml?timestamp=${new Date().getTime()}&date=${new Date().getDate()}`;
                fetch(proxyUrl + rssUrl)
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {
                        const lastUpdate = data.getElementsByTagNameNS('*', "datetime")[0].textContent;
                        const updateDiv = document.createElement('div');
                        updateDiv.className = "storm-update";
                        updateDiv.innerHTML = `Last updated: ${lastUpdate}`;
                        stormListItem.appendChild(updateDiv);

                        const headline = data.getElementsByTagNameNS('*', 'headline')[0].textContent;
                        const headlineDiv = document.createElement('div');
                        headlineDiv.className = "storm-headline";
                        headlineDiv.innerHTML = `${headline}`;
                        stormListItem.appendChild(headlineDiv);

                        const fourDigitBinNumber = storm.binNumber.length === 3 ? storm.binNumber.slice(0, 2) + '0' + storm.binNumber.slice(2) : storm.binNumber;
                        const coneGraphicUrl = `https://www.nhc.noaa.gov/storm_graphics/${fourDigitBinNumber}/${storm.id.toUpperCase()}_5day_cone_with_line_and_wind.png`;
                        const satelliteUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${storm.id.toUpperCase()}/GEOCOLOR/${storm.id.toUpperCase()}-GEOCOLOR-1000x1000.gif`
                        const IrSatUrl = `https://cdn.star.nesdis.noaa.gov/FLOATER/data/${storm.id.toUpperCase()}/13/${storm.id.toUpperCase()}-13-1000x1000.gif`

                        const coneImage = document.createElement('img');
                        coneImage.className = "dep-image";
                        coneImage.src = coneGraphicUrl;
                        stormListItem.appendChild(coneImage);
                        coneImage.style.display = "block";

                        const satImage = document.createElement('img');
                        satImage.className = "dep-image";
                        satImage.src = satelliteUrl;
                        stormListItem.appendChild(satImage);
                        satImage.style.display = "none";

                        const irImage = document.createElement('img');
                        irImage.className = "dep-image";
                        irImage.src = IrSatUrl;
                        stormListItem.appendChild(satImage);
                        irImage.style.display = "none";

                        const imgButtonDiv = document.createElement('div');
                        imgButtonDiv.className = "img-button-div";
                        stormListItem.appendChild(imgButtonDiv);

                        const coneButton = document.createElement('button');
                        coneButton.className = "img-button";
                        coneButton.innerHTML = "Cone Tracks";

                        const satelliteButton = document.createElement('button');
                        satelliteButton.className = "img-button";
                        satelliteButton.innerHTML = "Sattelite";

                        const IrSatButton = document.createElement('button');
                        IrSatButton.className = "img-button";
                        IrSatButton.innerHTML = "Infrared Sattelite";

                        coneButton.onclick = changeToCone;
                        satelliteButton.onclick = changeToSatellite;
                        IrSatButton.onclick = changeToIR;

                        imgButtonDiv.appendChild(coneButton);
                        imgButtonDiv.appendChild(satelliteButton);
                        imgButtonDiv.appendChild(IrSatButton);

                        stormListItem.appendChild(satImage);
                        stormListItem.appendChild(irImage);
                        stormListItem.appendChild(coneImage);
                        
                        function changeToSatellite() {
                            satImage.style.display = "block";
                            irImage.style.display = "none";
                            coneImage.style.display = "none";
                        }

                        function changeToIR() {
                            satImage.style.display = "none";
                            irImage.style.display = "block";
                            coneImage.style.display = "none";
                        }

                        function changeToCone() {
                            satImage.style.display = "none";
                            irImage.style.display = "none";
                            coneImage.style.display = "block";
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching RSS feed:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.className = "error";
                        errorDiv.innerHTML = 'Error loading RSS feed';
                        depListItem.appendChild(errorDiv);
                    });
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            stormCount.textContent = 'Error loading data';
        });
});
