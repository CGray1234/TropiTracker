document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');

    const apiUrl = 'https://www.nhc.noaa.gov/CurrentStorms.json'
    const proxyUrl = 'https://corsproxy.io/?';

    fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            const activeHurricanes = data.activeStorms.filter(storm => storm.classification === 'HU');
            const activeTropicalStorms = data.activeStorms.filter(storm => storm.classification === 'TS');
            stormCount.textContent = `Found ${activeHurricanes.length} hurricanes and ${activeTropicalStorms.length} tropical storms.`;
        })
        .catch(error => {
            console.error('Error fetching hurricane data:', error);
            stormCount.textContent = 'Error loading data';
        });
});