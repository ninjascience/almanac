const PORTLAND_FALLBACK = { lat: 45.505, lon: -122.675, label: 'Portland, OR' };

export async function getLocation() {
    if (!navigator.geolocation) return PORTLAND_FALLBACK;

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    label: `${pos.coords.latitude.toFixed(2)}°N, ${Math.abs(pos.coords.longitude).toFixed(2)}°W`,
                });
            },
            () => {
                document.getElementById('location-prompt').hidden = false;
                resolve(PORTLAND_FALLBACK);
            },
            { timeout: 8000 }
        );
    });
}
