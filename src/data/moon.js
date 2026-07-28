// Moon phase calculation using the Meeus algorithm (Astronomical Algorithms, ch. 49).

const PHASE_NAMES = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];

function julianToDate(jd) {
    // Convert Julian Day Number to JS Date (UTC)
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;
    let a = z;
    if (z >= 2299161) {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);

    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;

    const dayInt = Math.floor(day);
    const fractional = day - dayInt;
    const hours = fractional * 24;
    return new Date(Date.UTC(year, month - 1, dayInt, Math.round(hours)));
}

// Returns JD of phase k (integer = new, +0.25 = first quarter, +0.5 = full, +0.75 = last quarter)
function moonPhaseJD(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const T4 = T3 * T;

    let JDE = 2451550.09766 + 29.530588861 * k
        + 0.00015437 * T2 - 0.000000150 * T3 + 0.00000000073 * T4;

    const M = toRad(2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3);
    const Mprime = toRad(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
    const F = toRad(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
    const Omega = toRad(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);

    const phase = k - Math.floor(k);

    if (Math.abs(phase) < 0.01 || Math.abs(phase - 1) < 0.01) {
        // New Moon
        JDE += -0.40720 * Math.sin(Mprime) + 0.17241 * Math.sin(M)
            + 0.01608 * Math.sin(2 * Mprime) + 0.01039 * Math.sin(2 * F)
            + 0.00739 * Math.sin(Mprime - M) - 0.00514 * Math.sin(Mprime + M)
            + 0.00208 * Math.sin(2 * M) - 0.00111 * Math.sin(Mprime - 2 * F)
            - 0.00057 * Math.sin(Mprime + 2 * F) + 0.00056 * Math.sin(2 * Mprime + M)
            - 0.00042 * Math.sin(3 * Mprime) + 0.00042 * Math.sin(M + 2 * F)
            + 0.00038 * Math.sin(M - 2 * F) - 0.00024 * Math.sin(2 * Mprime - M)
            - 0.00017 * Math.sin(Omega) - 0.00007 * Math.sin(Mprime + 2 * M);
    } else if (Math.abs(phase - 0.5) < 0.01) {
        // Full Moon
        JDE += -0.40614 * Math.sin(Mprime) + 0.17302 * Math.sin(M)
            + 0.01614 * Math.sin(2 * Mprime) + 0.01043 * Math.sin(2 * F)
            + 0.00734 * Math.sin(Mprime - M) - 0.00515 * Math.sin(Mprime + M)
            + 0.00209 * Math.sin(2 * M) - 0.00111 * Math.sin(Mprime - 2 * F)
            - 0.00057 * Math.sin(Mprime + 2 * F) + 0.00056 * Math.sin(2 * Mprime + M)
            - 0.00042 * Math.sin(3 * Mprime) + 0.00042 * Math.sin(M + 2 * F)
            + 0.00038 * Math.sin(M - 2 * F) - 0.00024 * Math.sin(2 * Mprime - M)
            - 0.00017 * Math.sin(Omega) - 0.00007 * Math.sin(Mprime + 2 * M);
    } else {
        // First / Last Quarter
        JDE += -0.62801 * Math.sin(Mprime) + 0.17172 * Math.sin(M)
            - 0.01183 * Math.sin(Mprime + M) + 0.00862 * Math.sin(2 * Mprime)
            + 0.00804 * Math.sin(2 * F) + 0.00454 * Math.sin(Mprime - M)
            + 0.00204 * Math.sin(2 * M) - 0.00180 * Math.sin(Mprime - 2 * F)
            - 0.00070 * Math.sin(Mprime + 2 * F) - 0.00040 * Math.sin(3 * Mprime)
            - 0.00034 * Math.sin(2 * Mprime - M) + 0.00032 * Math.sin(M + 2 * F)
            + 0.00032 * Math.sin(M - 2 * F) - 0.00028 * Math.sin(Mprime + 2 * M)
            + 0.00027 * Math.sin(2 * Mprime + M) - 0.00017 * Math.sin(Omega)
            - 0.00005 * Math.sin(Mprime - M - 2 * F) + 0.00004 * Math.sin(2 * Mprime + 2 * F)
            - 0.00004 * Math.sin(Mprime + M + 2 * F) + 0.00004 * Math.sin(Mprime - 2 * M)
            + 0.00003 * Math.sin(Mprime + M - 2 * F) + 0.00003 * Math.sin(3 * M)
            + 0.00002 * Math.sin(2 * Mprime - 2 * F) + 0.00002 * Math.sin(Mprime - M + 2 * F)
            - 0.00002 * Math.sin(3 * Mprime + M);

        // Quarter-phase only: W correction
        const W = 0.00306 - 0.00038 * Math.cos(M) + 0.00026 * Math.cos(Mprime)
            - 0.00002 * Math.cos(Mprime - M) + 0.00002 * Math.cos(Mprime + M)
            + 0.00002 * Math.cos(2 * F);
        JDE += (phase < 0.5 ? W : -W);
    }

    return JDE;
}

function toRad(deg) { return deg * Math.PI / 180; }

// Starting k value for a given year (approximate)
function kForYear(year) {
    return Math.floor((year - 2000) * 12.3685);
}

export function moonPhasesForYear(year) {
    const phases = [];
    const start = new Date(year, 0, 1).getTime();
    const end = new Date(year + 1, 0, 1).getTime();

    let k = kForYear(year) - 2;

    for (let attempt = 0; attempt < 60; attempt++, k += 0.25) {
        for (let phaseOffset = 0; phaseOffset < 1; phaseOffset += 0.25) {
            const kk = Math.floor(k) + phaseOffset;
            const jd = moonPhaseJD(kk);
            const date = julianToDate(jd);
            const t = date.getTime();
            if (t >= start && t < end) {
                const phaseIndex = Math.round(phaseOffset * 4) % 4;
                phases.push({ date, phase: PHASE_NAMES[phaseIndex] });
            }
        }
    }

    return phases.sort((a, b) => a.date - b.date);
}
