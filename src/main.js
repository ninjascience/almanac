import './app.css';
import { getLocation } from './data/location.js';
import { fetchNormals, fetchCurrentYear, deriveFrostDates, computeSunTimes } from './data/weather.js';
import { moonPhasesForYear } from './data/moon.js';
import { seasonsForYear } from './data/seasons.js';
import { draw } from './viz.js';

async function init() {
    const year = new Date().getFullYear();

    // Get location (prompts browser geolocation, falls back to Portland)
    const location = await getLocation();
    document.getElementById('location-label').textContent =
        `Historical weather patterns · ${location.label}`;

    // Fetch all data in parallel
    const [normals, currentYear] = await Promise.all([
        fetchNormals(location.lat, location.lon),
        fetchCurrentYear(location.lat, location.lon),
    ]);

    // Compute derived data
    const sunTimes = computeSunTimes(location.lat, location.lon, year);
    const phases = moonPhasesForYear(year);
    const seasons = seasonsForYear(year);
    const frosts = deriveFrostDates(normals, year);

    draw({ normals, currentYear, sunTimes, phases, seasons, frosts, location });
}

init().catch((err) => {
    console.error('Almanac failed to load:', err);
});
