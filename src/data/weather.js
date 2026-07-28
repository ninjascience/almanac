import SunCalc from 'suncalc';

const CLIMATE_API = 'https://climate-api.open-meteo.com/v1/climate';
const ARCHIVE_API = 'https://archive-api.open-meteo.com/v1/archive';
const DAILY_PARAMS = 'temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum';

function celsiusToF(c) {
    return (c * 9) / 5 + 32;
}

// Average the 30-year daily values into per day-of-year normals (handles leap years).
function aggregateNormals(times, tmaxArr, tminArr, precipArr, rainArr) {
    const buckets = {}; // key: "MM-DD"
    for (let i = 0; i < times.length; i++) {
        const [, mo, dy] = times[i].split('-');
        const key = `${mo}-${dy}`;
        if (!buckets[key]) buckets[key] = { tmax: [], tmin: [], precip: [], rain: [] };
        if (tmaxArr[i] != null) buckets[key].tmax.push(celsiusToF(tmaxArr[i]));
        if (tminArr[i] != null) buckets[key].tmin.push(celsiusToF(tminArr[i]));
        if (precipArr[i] != null) buckets[key].precip.push(precipArr[i]);
        if (rainArr[i] != null) buckets[key].rain.push(rainArr[i]);
    }
    return Object.entries(buckets).map(([key, v]) => {
        const [mo, dy] = key.split('-').map(Number);
        const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const avgPrecip = avg(v.precip);
        const avgRain = avg(v.rain);
        return {
            mo, dy,
            tmax: avg(v.tmax),
            tmin: avg(v.tmin),
            precip: avgPrecip,
            rain: avgRain,
            snow: Math.max(0, avgPrecip - avgRain),
            tmax_record: v.tmax.length ? Math.max(...v.tmax) : 0,
            tmin_record: v.tmin.length ? Math.min(...v.tmin) : 0,
        };
    }).sort((a, b) => a.mo !== b.mo ? a.mo - b.mo : a.dy - b.dy);
}

export async function fetchNormals(lat, lon) {
    const url = new URL(CLIMATE_API);
    url.searchParams.set('latitude', lat.toFixed(4));
    url.searchParams.set('longitude', lon.toFixed(4));
    url.searchParams.set('start_date', '1991-01-01');
    url.searchParams.set('end_date', '2020-12-31');
    url.searchParams.set('daily', DAILY_PARAMS);
    url.searchParams.set('models', 'EC_Earth3P_HR');

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Climate API error ${res.status}`);
    const json = await res.json();
    const d = json.daily;
    return aggregateNormals(d.time, d.temperature_2m_max, d.temperature_2m_min, d.precipitation_sum, d.rain_sum ?? []);
}

// Returns actual daily data from Jan 1 of the current year through yesterday.
export async function fetchCurrentYear(lat, lon) {
    const now = new Date();
    const year = now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().slice(0, 10);

    const url = new URL(ARCHIVE_API);
    url.searchParams.set('latitude', lat.toFixed(4));
    url.searchParams.set('longitude', lon.toFixed(4));
    url.searchParams.set('start_date', `${year}-01-01`);
    url.searchParams.set('end_date', endDate);
    url.searchParams.set('daily', DAILY_PARAMS);
    url.searchParams.set('temperature_unit', 'fahrenheit');

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Archive API error ${res.status}`);
    const json = await res.json();
    const d = json.daily;
    return d.time.map((t, i) => {
        const [, mo, dy] = t.split('-').map(Number);
        const precip = d.precipitation_sum[i] ?? 0;
        const rain = d.rain_sum[i] ?? 0;
        return {
            mo,
            dy,
            tmax: d.temperature_2m_max[i],
            tmin: d.temperature_2m_min[i],
            precip,
            rain,
            snow: Math.max(0, precip - rain),
        };
    });
}

// Derive frost window from normals: last spring freeze → first fall freeze.
export function deriveFrostDates(normals, year) {
    const FREEZE = 32;
    let lastSpringFreeze = null;
    let firstFallFreeze = null;

    // Walk forward through the year for last spring freeze (up to July)
    for (const d of normals) {
        if (d.mo > 7) break;
        if (d.tmin <= FREEZE) lastSpringFreeze = new Date(year, d.mo - 1, d.dy).getTime();
    }

    // Walk backward through the year for first fall freeze (from August on)
    const fallNormals = normals.filter((d) => d.mo >= 8);
    for (const d of fallNormals) {
        if (d.tmin <= FREEZE) {
            firstFallFreeze = new Date(year, d.mo - 1, d.dy).getTime();
            break;
        }
    }

    return {
        start: lastSpringFreeze ?? new Date(year, 3, 15).getTime(),
        end: firstFallFreeze ?? new Date(year, 9, 15).getTime(),
    };
}

// Compute sunrise/sunset/dawn/dusk for every day of the current year at lat/lon.
export function computeSunTimes(lat, lon, year) {
    const result = [];
    const date = new Date(year, 0, 1);
    while (date.getFullYear() === year) {
        const times = SunCalc.getTimes(date, lat, lon);
        const toMinutes = (d) => d.getHours() * 60 + d.getMinutes();
        result.push({
            mo: date.getMonth() + 1,
            dy: date.getDate(),
            SUNRISE: toMinutes(times.sunrise),
            SUNSET: toMinutes(times.sunset),
            ADAWN: toMinutes(times.nauticalDawn),
            ADUSK: toMinutes(times.nauticalDusk),
            CDAWN: toMinutes(times.dawn),
            CDUSK: toMinutes(times.dusk),
        });
        date.setDate(date.getDate() + 1);
    }
    return result;
}
