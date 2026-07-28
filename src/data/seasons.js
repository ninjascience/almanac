// Astronomical equinox/solstice dates via Meeus (Astronomical Algorithms, ch. 27).

function toRad(deg) { return deg * Math.PI / 180; }

// JDE of a season event for a given year.
// event: 0=spring equinox, 1=summer solstice, 2=fall equinox, 3=winter solstice
function seasonJDE(year, event) {
    const Y = (year - 2000) / 1000;
    const Y2 = Y * Y, Y3 = Y2 * Y, Y4 = Y3 * Y;

    const JDE0s = [
        2451623.80984 + 365242.37404 * Y + 0.05169 * Y2 - 0.00411 * Y3 - 0.00057 * Y4,
        2451716.56767 + 365241.62603 * Y + 0.00325 * Y2 + 0.00888 * Y3 - 0.00030 * Y4,
        2451810.21715 + 365242.01767 * Y - 0.11575 * Y2 + 0.00337 * Y3 + 0.00078 * Y4,
        2451900.05952 + 365242.74049 * Y - 0.06223 * Y2 - 0.00823 * Y3 + 0.00032 * Y4,
    ];

    let JDE = JDE0s[event];

    const T = (JDE - 2451545.0) / 36525;
    const W = 35999.373 * T - 2.47;
    const dLambda = 1 + 0.0334 * Math.cos(toRad(W)) + 0.0007 * Math.cos(toRad(2 * W));

    const S =
        485 * Math.cos(toRad(324.96 + 1934.136 * T)) +
        203 * Math.cos(toRad(337.23 + 32964.467 * T)) +
        199 * Math.cos(toRad(342.08 + 20.186 * T)) +
        182 * Math.cos(toRad(27.85 + 445267.112 * T)) +
        156 * Math.cos(toRad(73.14 + 45036.886 * T)) +
        136 * Math.cos(toRad(171.52 + 22518.443 * T)) +
        77 * Math.cos(toRad(222.54 + 65928.934 * T)) +
        74 * Math.cos(toRad(296.72 + 3034.906 * T)) +
        70 * Math.cos(toRad(243.58 + 9037.513 * T)) +
        58 * Math.cos(toRad(119.81 + 33718.147 * T)) +
        52 * Math.cos(toRad(297.17 + 150.678 * T)) +
        50 * Math.cos(toRad(21.02 + 2281.226 * T)) +
        45 * Math.cos(toRad(247.54 + 29929.562 * T)) +
        44 * Math.cos(toRad(325.15 + 31555.956 * T)) +
        29 * Math.cos(toRad(60.93 + 4443.417 * T)) +
        18 * Math.cos(toRad(155.12 + 67555.328 * T)) +
        17 * Math.cos(toRad(288.79 + 4562.452 * T)) +
        16 * Math.cos(toRad(198.04 + 62894.029 * T)) +
        14 * Math.cos(toRad(199.76 + 31557.381 * T)) +
        12 * Math.cos(toRad(95.39 + 14577.848 * T)) +
        10 * Math.cos(toRad(49.11 + 31071.933 * T)) +
        10 * Math.cos(toRad(165.67 + 14917.838 * T)) +
        10 * Math.cos(toRad(146.84 + 60443.453 * T)) +
        10 * Math.cos(toRad(188.19 + 20426.571 * T)) +
        10 * Math.cos(toRad(113.17 + 16859.074 * T));

    JDE += (0.00001 * S) / dLambda;
    return JDE;
}

function jdToDate(jd) {
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;
    let a = z;
    if (z >= 2299161) {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d2 = Math.floor(365.25 * c);
    const e = Math.floor((b - d2) / 30.6001);
    const day = b - d2 - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    return new Date(Date.UTC(year, month - 1, Math.floor(day)));
}

// Returns seasons array in the shape expected by viz.js
export function seasonsForYear(year) {
    const spring = jdToDate(seasonJDE(year, 0));
    const summer = jdToDate(seasonJDE(year, 1));
    const fall = jdToDate(seasonJDE(year, 2));
    const winter = jdToDate(seasonJDE(year, 3));
    const nextSpring = jdToDate(seasonJDE(year + 1, 0));

    return [
        { name: 'Spring', start: spring.getTime(), end: summer.getTime() },
        { name: 'Summer', start: summer.getTime(), end: fall.getTime() },
        { name: 'Fall',   start: fall.getTime(),   end: winter.getTime() },
        { name: 'Winter', start: winter.getTime(), end: nextSpring.getTime() },
    ];
}
