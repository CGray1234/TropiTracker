document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');
    const hurricaneList = document.getElementById('hurricanes');

    const apiUrl = 'https://www.nhc.noaa.gov/CurrentStorms.json';
    const proxyUrl = 'https://corsproxy.io/?';

    fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            const activeHurricanes = data.activeStorms.filter(storm => storm.classification === 'HU');
            const activeTropicalStorms = data.activeStorms.filter(storm => storm.classification === 'TS');

            if (activeHurricanes.length === 1 && activeTropicalStorms.length === 1) {
                stormCount.textContent = `Found ${activeHurricanes.length} hurricane and ${activeTropicalStorms.length} tropical storm.`;
            } else if (activeHurricanes.length === 1) {
                stormCount.textContent = `Found ${activeHurricanes.length} hurricane and ${activeTropicalStorms.length} tropical storms.`;
            } else if (activeTropicalStorms.length === 1) {
                stormCount.textContent = `Found ${activeHurricanes.length} hurricanes and ${activeTropicalStorms.length} tropical storm.`;
            } else {
                stormCount.textContent = `Found ${activeHurricanes.length} hurricanes and ${activeTropicalStorms.length} tropical storms.`;
            }

            activeHurricanes.forEach(hurricane => {
                const hurricaneListItem = document.createElement('div');
                hurricaneListItem.id = hurricane.binNumber;
                hurricaneListItem.className = "hurricane-list-item";
                hurricaneListItem.innerHTML = `Hurricane ${hurricane.name}`;
                hurricaneList.appendChild(hurricaneListItem);

                const rssUrl = `https://www.nhc.noaa.gov/nhc_${hurricane.binNumber.toLowerCase()}.xml`;
                fetch(proxyUrl + rssUrl)
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {
                        const lastUpdate = data.getElementsByTagNameNS('*', "datetime")[0].textContent
                        const updateDiv = document.createElement('div');
                        updateDiv.className = "hurricane-update";
                        updateDiv.innerHTML = `Last updated: ${lastUpdate}`
                        hurricaneListItem.appendChild(updateDiv);

                        const headline = data.getElementsByTagNameNS('*', 'headline')[0].textContent;
                        const headlineDiv = document.createElement('div');
                        headlineDiv.className = "hurricane-headline";
                        headlineDiv.innerHTML = `${headline}`;
                        hurricaneListItem.appendChild(headlineDiv);

                        const coneBinNumber = hurricane.binNumber.length === 3 ? hurricane.binNumber.slice(0, 2) + '0' + hurricane.binNumber.slice(2) : hurricane.binNumber;
                        const coneGraphicUrl = `https://www.nhc.noaa.gov/storm_graphics/${coneBinNumber}/${hurricane.id.toUpperCase()}_5day_cone_with_line_and_wind.png`;
                        const coneGraphic = document.createElement('img');
                        coneGraphic.className = "cone-graphic"
                        coneGraphic.src = coneGraphicUrl;
                        hurricaneListItem.appendChild(coneGraphic);
                    })
                    .catch(error => {
                        console.error('Error fetching RSS feed:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.className = "error";
                        errorDiv.innerHTML = 'Error loading RSS feed';
                        hurricaneListItem.appendChild(errorDiv);
                    });
            });
        })
        .catch(error => {
            console.error('Error fetching hurricane data:', error);
            stormCount.textContent = 'Error loading data';
        });
});
