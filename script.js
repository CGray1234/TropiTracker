document.addEventListener('DOMContentLoaded', () => {
    const stormCount = document.getElementById('storm-count');

    const apiUrl = 'https://www.nhc.noaa.gov/CurrentStorms.json';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const activeHurricanes = data.activeStorms.filter(storm => storm.stormType === 'HU');
            const activeTropicalStorms = data.activeStorms.filter(storm => storm.stormType === 'TS');
            stormCount.textContent = `Found ${activeHurricanes.length} hurricanes and ${activeTropicalStorms.length} tropical storms.`;
        })
        .catch(error => {
            console.error('Error fetching hurricane data:', error);
            stormCount.textContent = 'Error loading data';
        });
});