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

    const EMBEDDED_CSV_DATA = `Country,ISO3,Continent,Population,Total_Cases,Total_Deaths,Recovered,Vaccination_Rate,Cases_per_Million,Death_Rate,Recovery_Rate,Active_Cases
United States,USA,North America,339000000,104000000,1130000,101500000,81,306785,1.09,97.60,1370000
India,IND,Asia,1428000000,45000000,533000,44400000,75,31513,1.18,98.67,67000
Brazil,BRA,South America,216000000,37500000,703000,36200000,88,173611,1.87,96.53,597000
France,FRA,Europe,68000000,40100000,167000,39700000,81,589706,0.42,98.99,233000
Germany,DEU,Europe,84000000,38800000,183000,38300000,78,461905,0.47,98.71,317000
Japan,JPN,Asia,124000000,33800000,75000,33300000,83,272581,0.22,98.52,425000
South Korea,KOR,Asia,52000000,34500000,35000,34100000,87,663462,0.10,98.84,365000
Italy,ITA,Europe,59000000,26700000,196000,26300000,80,452542,0.73,98.50,204000
United Kingdom,GBR,Europe,68000000,24800000,232000,24400000,82,364706,0.94,98.39,168000
Russia,RUS,Europe,144000000,23000000,400000,22300000,61,159722,1.74,96.96,300000
Turkey,TUR,Asia,85000000,17200000,102000,17000000,69,202353,0.59,98.84,98000
Spain,ESP,Europe,48000000,13900000,122000,13700000,85,289583,0.88,98.56,78000
Australia,AUS,Oceania,26000000,11700000,24000,11500000,86,450000,0.21,98.29,176000
Vietnam,VNM,Asia,100000000,11600000,43000,11000000,93,116000,0.37,94.83,557000
Mexico,MEX,North America,128000000,7700000,335000,7200000,69,60156,4.35,93.51,165000
Indonesia,IDN,Asia,277000000,6800000,162000,6600000,73,24549,2.38,97.06,38000
Argentina,ARG,South America,46000000,10100000,130000,9900000,83,219565,1.29,98.02,70000
Netherlands,NLD,Europe,18000000,8600000,23000,8500000,78,477778,0.27,98.84,77000
Canada,CAN,North America,40000000,4700000,52000,4600000,84,117500,1.11,97.87,48000
South Africa,ZAF,Africa,60000000,4100000,102000,3998000,42,68333,2.49,97.51,0
Philippines,PHL,Asia,117000000,4100000,67000,4000000,68,35043,1.63,97.56,33000
Thailand,THA,Asia,72000000,4800000,35000,4700000,80,66667,0.73,97.92,65000
Malaysia,MYS,Asia,34000000,5200000,37000,5100000,84,152941,0.71,98.08,63000
Chile,CHL,South America,20000000,5300000,64000,5200000,92,265000,1.21,98.11,36000
Egypt,EGY,Africa,112000000,520000,25000,442000,38,4643,4.81,85.00,53000`;

    const GROWTH_FACTORS = {
        '2019': { cases: 0.001, vacc: 0.00 },
        '2020': { cases: 0.02, vacc: 0.00 },
        '2021': { cases: 0.15, vacc: 0.20 },
        '2022': { cases: 0.45, vacc: 0.45 },
        '2023': { cases: 0.72, vacc: 0.65 },
        '2024': { cases: 0.88, vacc: 0.82 },
        '2025': { cases: 0.96, vacc: 0.93 },
        '2026': { cases: 1.00, vacc: 1.00 },
        'All': { cases: 1.00, vacc: 1.00 }
    };

    function processParsedData(parsed) {
        rawData = parsed
            .filter(row => row.Country && row.Country.trim() !== '')
            .map(row => {
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
                const calculatedActive = cleanRow.Total_Cases - cleanRow.Total_Deaths - cleanRow.Recovered;
                if (cleanRow.Active_Cases !== calculatedActive) {
                    cleanRow.Active_Cases = Math.max(0, calculatedActive);
                }
                cleanRow.Cases_per_Million = cleanRow.Population > 0
                    ? Math.round((cleanRow.Total_Cases / cleanRow.Population) * 1000000)
                    : 0;
                cleanRow.Death_Rate = cleanRow.Total_Cases > 0
                    ? parseFloat(((cleanRow.Total_Deaths / cleanRow.Total_Cases) * 100).toFixed(2))
                    : 0;
                cleanRow.Recovery_Rate = cleanRow.Total_Cases > 0
                    ? parseFloat(((cleanRow.Recovered / cleanRow.Total_Cases) * 100).toFixed(2))
                    : 0;
                const coord = COORDS[cleanRow.ISO3];
                if (coord) {
                    cleanRow._lat = coord[0];
                    cleanRow._lng = coord[1];
                }
                return cleanRow;
            });
        return rawData;
    }

    /** Parse CSV from a URL with automatic inline fallback for local file:// mode */
    function loadCSV(url) {
        return new Promise((resolve) => {
            Papa.parse(url, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0 && results.data[0].Country) {
                        resolve(processParsedData(results.data));
                    } else {
                        parseEmbedded();
                    }
                },
                error: () => parseEmbedded()
            });

            function parseEmbedded() {
                Papa.parse(EMBEDDED_CSV_DATA, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (res) => resolve(processParsedData(res.data))
                });
            }
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

    /** Generate 2019-2026 yearly case trends showing increase and decrease trajectory */
    function getCaseTrendsSeries(data) {
        const totalCases = data.reduce((s, r) => s + (r.Total_Cases || 0), 0);
        const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
        const factors = [0.001, 0.02, 0.15, 0.45, 0.72, 0.88, 0.96, 1.00];

        let prevCumulative = 0;
        return years.map((year, i) => {
            const cumulative = Math.round(totalCases * factors[i]);
            const newCases = i === 0 ? cumulative : Math.max(0, cumulative - prevCumulative);
            prevCumulative = cumulative;
            return {
                year,
                cumulative,
                newCases
            };
        });
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
        getCaseTrendsSeries,
        getPopulationByContinent,
        getUnique,
        getRawData
    };
})();
