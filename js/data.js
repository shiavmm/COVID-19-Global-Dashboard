/* ===== data.js — CSV Parsing, Aggregation & Filtering ===== */

const DataModule = (() => {
    let rawData = [];

    // Country coordinates for map placement
    const COORDS = {
        'USA': [39.8, -98.5], 'IND': [20.6, 78.9], 'BRA': [-14.2, -51.9],
        'FRA': [46.2, 2.2], 'DEU': [51.2, 10.4], 'JPN': [36.2, 138.2],
        'KOR': [36.0, 128.0], 'ITA': [41.9, 12.5], 'GBR': [55.4, -3.4],
        'RUS': [61.5, 105.3], 'TUR': [38.9, 35.2], 'ESP': [40.5, -3.7],
        'AUS': [-25.3, 133.8], 'VNM': [14.1, 108.3], 'MEX': [23.6, -102.6],
        'IDN': [-0.8, 113.9], 'ARG': [-38.4, -63.6], 'NLD': [52.1, 5.3],
        'CAN': [56.1, -106.3], 'ZAF': [-30.6, 22.9], 'PHL': [12.9, 121.8],
        'THA': [15.9, 100.9], 'MYS': [4.2, 101.9], 'CHL': [-35.7, -71.5],
        'EGY': [26.8, 30.8]
    };

    const GROWTH_FACTORS = {
        '2020': { cases: 0.02, vacc: 0.00 },
        '2021': { cases: 0.15, vacc: 0.20 },
        '2022': { cases: 0.45, vacc: 0.45 },
        '2023': { cases: 0.72, vacc: 0.65 },
        '2024': { cases: 0.88, vacc: 0.82 },
        '2025': { cases: 0.96, vacc: 0.93 },
        '2026': { cases: 1.00, vacc: 1.00 },
        'All': { cases: 1.00, vacc: 1.00 }
    };

    /** Parse CSV from a URL using PapaParse and clean data */
    function loadCSV(url) {
        return new Promise((resolve, reject) => {
            Papa.parse(url, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    rawData = results.data
                        .filter(row => row.Country && row.Country.trim() !== '')
                        .map(row => {
                            // Clean/sanitize values
                            const cleanRow = {
                                Country: (row.Country || '').trim(),
                                ISO3: (row.ISO3 || '').trim().toUpperCase(),
                                Continent: (row.Continent || '').trim(),
                                Population: Math.max(0, parseInt(row.Population) || 0),
                                Total_Cases: Math.max(0, parseInt(row.Total_Cases) || 0),
                                Total_Deaths: Math.max(0, parseInt(row.Total_Deaths) || 0),
                                Recovered: Math.max(0, parseInt(row.Recovered) || 0),
                                Vaccination_Rate: Math.min(100, Math.max(0, parseFloat(row.Vaccination_Rate) || 0)),
                                Active_Cases: Math.max(0, parseInt(row.Active_Cases) || 0)
                            };

                            // Enforce mathematical consistency for raw data
                            const calculatedActive = cleanRow.Total_Cases - cleanRow.Total_Deaths - cleanRow.Recovered;
                            if (cleanRow.Active_Cases !== calculatedActive) {
                                cleanRow.Active_Cases = Math.max(0, calculatedActive);
                            }

                            // Calculate rates for consistency
                            cleanRow.Cases_per_Million = cleanRow.Population > 0
                                ? Math.round((cleanRow.Total_Cases / cleanRow.Population) * 1000000)
                                : 0;
                            cleanRow.Death_Rate = cleanRow.Total_Cases > 0
                                ? parseFloat(((cleanRow.Total_Deaths / cleanRow.Total_Cases) * 100).toFixed(2))
                                : 0;
                            cleanRow.Recovery_Rate = cleanRow.Total_Cases > 0
                                ? parseFloat(((cleanRow.Recovered / cleanRow.Total_Cases) * 100).toFixed(2))
                                : 0;

                            // Attach coordinates
                            const coord = COORDS[cleanRow.ISO3];
                            if (coord) {
                                cleanRow._lat = coord[0];
                                cleanRow._lng = coord[1];
                            }
                            return cleanRow;
                        });
                    resolve(rawData);
                },
                error: (err) => reject(err)
            });
        });
    }

    /** Apply year scaling and filters, returning matching rows */
    function applyFilters(data, filters) {
        // Step 1: Scale data by selected year if it's specified
        const year = filters.year || 'All';
        const factorInfo = GROWTH_FACTORS[year] || GROWTH_FACTORS['All'];
        const fCases = factorInfo.cases;
        const fVacc = factorInfo.vacc;

        const scaledData = data.map(row => {
            const scaledRow = { ...row };
            scaledRow.Total_Cases = Math.round(row.Total_Cases * fCases);
            scaledRow.Total_Deaths = Math.round(row.Total_Deaths * fCases);
            scaledRow.Recovered = Math.round(row.Recovered * fCases);
            scaledRow.Active_Cases = Math.max(0, scaledRow.Total_Cases - scaledRow.Total_Deaths - scaledRow.Recovered);
            scaledRow.Vaccination_Rate = Math.round(row.Vaccination_Rate * fVacc * 10) / 10;

            // Recalculate rates based on scaled numbers
            scaledRow.Cases_per_Million = scaledRow.Population > 0
                ? Math.round((scaledRow.Total_Cases / scaledRow.Population) * 1000000)
                : 0;
            scaledRow.Death_Rate = scaledRow.Total_Cases > 0
                ? parseFloat(((scaledRow.Total_Deaths / scaledRow.Total_Cases) * 100).toFixed(2))
                : 0;
            scaledRow.Recovery_Rate = scaledRow.Total_Cases > 0
                ? parseFloat(((scaledRow.Recovered / scaledRow.Total_Cases) * 100).toFixed(2))
                : 0;

            return scaledRow;
        });

        // Step 2: Apply other filters (Continent, Country, Population, Vaccination)
        return scaledData.filter(row => {
            if (filters.continent && filters.continent !== 'All' && row.Continent !== filters.continent) return false;
            if (filters.country && filters.country !== 'All' && row.Country !== filters.country) return false;
            if (row.Population < filters.popMin || row.Population > filters.popMax) return false;
            if (row.Vaccination_Rate < filters.vaccMin || row.Vaccination_Rate > filters.vaccMax) return false;
            return true;
        });
    }

    /** KPI summary totals */
    function getKPIs(data) {
        const totals = data.reduce((acc, r) => {
            acc.population += r.Population || 0;
            acc.cases += r.Total_Cases || 0;
            acc.deaths += r.Total_Deaths || 0;
            acc.recovered += r.Recovered || 0;
            acc.vaccWeighted += (r.Vaccination_Rate || 0) * (r.Population || 0);
            return acc;
        }, { population: 0, cases: 0, deaths: 0, recovered: 0, vaccWeighted: 0 });

        totals.vaccinationRate = totals.population > 0
            ? (totals.vaccWeighted / totals.population).toFixed(1)
            : 0;

        return totals;
    }

    /** Cases grouped by continent */
    function getCasesByContinent(data) {
        const map = {};
        data.forEach(r => {
            if (!map[r.Continent]) map[r.Continent] = 0;
            map[r.Continent] += r.Total_Cases || 0;
        });
        return map;
    }

    /** Top N countries by total cases */
    function getTopCountries(data, n = 10) {
        return [...data]
            .sort((a, b) => (b.Total_Cases || 0) - (a.Total_Cases || 0))
            .slice(0, n);
    }

    /** Vaccination rate averaged by continent (population-weighted) */
    function getVaccinationByContinent(data) {
        const map = {};
        data.forEach(r => {
            if (!map[r.Continent]) map[r.Continent] = { totalPop: 0, weightedVacc: 0 };
            map[r.Continent].totalPop += r.Population || 0;
            map[r.Continent].weightedVacc += (r.Vaccination_Rate || 0) * (r.Population || 0);
        });
        const result = {};
        Object.keys(map).forEach(c => {
            result[c] = map[c].totalPop > 0
                ? +(map[c].weightedVacc / map[c].totalPop).toFixed(1)
                : 0;
        });
        return result;
    }

    /** Generate synthetic time-series data for the line chart */
    function getTimeSeries(data) {
        const totalCases = data.reduce((s, r) => s + (r.Total_Cases || 0), 0);
        const totalDeaths = data.reduce((s, r) => s + (r.Total_Deaths || 0), 0);
        const totalRecovered = data.reduce((s, r) => s + (r.Recovered || 0), 0);

        // Simulate S-curve growth from 2020 to 2026
        const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
        const growthFactors = [0.02, 0.15, 0.45, 0.72, 0.88, 0.96, 1.0];

        return years.map((year, i) => ({
            year,
            cases: Math.round(totalCases * growthFactors[i]),
            deaths: Math.round(totalDeaths * growthFactors[i]),
            recovered: Math.round(totalRecovered * growthFactors[i])
        }));
    }

    /** Population by continent */
    function getPopulationByContinent(data) {
        const map = {};
        data.forEach(r => {
            if (!map[r.Continent]) map[r.Continent] = 0;
            map[r.Continent] += r.Population || 0;
        });
        return map;
    }

    /** Get unique values for a column */
    function getUnique(data, column) {
        return [...new Set(data.map(r => r[column]).filter(Boolean))].sort();
    }

    /** Get all raw data */
    function getRawData() {
        return rawData;
    }

    return {
        loadCSV,
        applyFilters,
        getKPIs,
        getCasesByContinent,
        getTopCountries,
        getVaccinationByContinent,
        getTimeSeries,
        getPopulationByContinent,
        getUnique,
        getRawData
    };
})();
