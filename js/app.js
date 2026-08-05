/* ===== app.js — Main Controller, Navigation & Initialization ===== */

(function () {
    'use strict';

    /* ---------- Number Formatting ---------- */
    function fmt(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toLocaleString();
    }

    /* ---------- Navigation ---------- */
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.dataset.view;

            // Toggle active nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Toggle active view
            views.forEach(v => v.classList.remove('active'));
            const target = document.getElementById('view-' + viewId);
            if (target) target.classList.add('active');

            // Resize map when overview becomes visible
            if (viewId === 'overview') {
                MapModule.resize();
            }

            // Render sub-view charts on first visit
            renderSubView(viewId);
        });
    });

    /* ---------- Track rendered views ---------- */
    const renderedViews = new Set(['overview']);
    let currentData = [];

    function renderSubView(viewId) {
        if (renderedViews.has(viewId)) return;
        renderedViews.add(viewId);

        const data = currentData;
        if (!data.length) return;

        switch (viewId) {
            case 'country':
                ChartsModule.renderCountryCompare('chart-country-compare', data);
                ChartsModule.renderCasesPerMillion('chart-cases-per-million', data);
                ChartsModule.renderActiveCases('chart-active-cases', data);
                ChartsModule.renderDeathRate('chart-death-rate', data);
                renderCountryFullTable(data);
                break;
            case 'vaccination':
                ChartsModule.renderVaccCountry('chart-vacc-country', data);
                ChartsModule.renderVaccVsDeath('chart-vacc-vs-death', data);
                ChartsModule.renderVaccDistribution('chart-vacc-distribution', data);
                const kpis = DataModule.getKPIs(data);
                ChartsModule.renderGauge('chart-vacc-gauge', kpis.vaccinationRate, 'vacc-gauge-value');
                break;
            case 'population':
                const popByContinent = DataModule.getPopulationByContinent(data);
                ChartsModule.renderPopContinent('chart-pop-continent', popByContinent);
                ChartsModule.renderPopVsCases('chart-pop-vs-cases', data);
                ChartsModule.renderPopTop('chart-pop-top', data);
                ChartsModule.renderCpmVsVacc('chart-cpm-vacc', data);
                break;
        }
    }

    /* ---------- Cell Heatmap Helper ---------- */
    function getTableCell(value, type) {
        let className = '';
        let displayValue = value !== undefined && value !== null ? value.toLocaleString() + '%' : '—';
        
        if (type === 'vacc') {
            if (value >= 75.0) {
                className = 'cell-green';
            } else if (value >= 68.0) {
                className = 'cell-green-light';
            } else if (value >= 64.0) {
                className = 'cell-yellow';
            } else {
                className = 'cell-red';
            }
        } else if (type === 'death') {
            if (value < 1.0) {
                className = 'cell-green-light';
            } else if (value >= 2.0) {
                className = 'cell-red';
            }
        } else if (type === 'recovery') {
            if (value >= 98.0) {
                className = 'cell-green';
            } else if (value >= 97.0) {
                className = 'cell-green-light';
            } else {
                className = 'cell-red';
            }
        }
        
        return `<td class="${className}" style="text-align: center; font-weight: 500;">${displayValue}</td>`;
    }

    /* ---------- Country Full Table ---------- */
    function renderCountryFullTable(data) {
        const tbody = document.getElementById('country-full-table-body');
        if (!tbody) return;
        tbody.innerHTML = data.map(r => `
            <tr>
                <td class="text-left"><strong>${r.Country}</strong></td>
                <td class="text-left">${r.Continent}</td>
                <td class="text-right">${r.Population.toLocaleString()}</td>
                <td class="text-right">${(r.Total_Cases || 0).toLocaleString()}</td>
                <td class="text-right">${(r.Total_Deaths || 0).toLocaleString()}</td>
                <td class="text-right">${(r.Recovered || 0).toLocaleString()}</td>
                <td class="text-right">${(r.Active_Cases || 0).toLocaleString()}</td>
                <td class="text-right">${(r.Cases_per_Million || 0).toLocaleString()}</td>
                ${getTableCell(r.Death_Rate, 'death')}
                ${getTableCell(r.Recovery_Rate, 'recovery')}
                ${getTableCell(r.Vaccination_Rate, 'vacc')}
            </tr>
        `).join('');
    }

    /* ---------- Summary Table ---------- */
    function renderSummaryTable(data) {
        const tbody = document.getElementById('summary-table-body');
        if (!tbody) return;

        tbody.innerHTML = data.map(r => {
            const vaccRate = r.Vaccination_Rate || 0;
            const deathRate = r.Death_Rate || 0;
            const recoveryRate = r.Recovery_Rate || 0;

            return `
                <tr>
                    <td class="text-left"><strong>${r.Country}</strong></td>
                    <td class="text-right">${r.Population.toLocaleString()}</td>
                    <td class="text-right">${(r.Total_Cases || 0).toLocaleString()}</td>
                    <td class="text-right">${(r.Total_Deaths || 0).toLocaleString()}</td>
                    <td class="text-right">${(r.Recovered || 0).toLocaleString()}</td>
                    ${getTableCell(vaccRate, 'vacc')}
                    ${getTableCell(deathRate, 'death')}
                    ${getTableCell(recoveryRate, 'recovery')}
                </tr>
            `;
        }).join('');
    }

    /* ---------- KPI Update ---------- */
    function updateKPIs(kpis) {
        document.getElementById('kpi-pop-value').textContent = fmt(kpis.population);
        document.getElementById('kpi-cases-value').textContent = fmt(kpis.cases);
        document.getElementById('kpi-deaths-value').textContent = fmt(kpis.deaths);
        document.getElementById('kpi-recovered-value').textContent = fmt(kpis.recovered);
        document.getElementById('kpi-vacc-value').textContent = kpis.vaccinationRate + '%';

        // Simulate delta badges
        document.getElementById('kpi-cases-delta').textContent = '+' + fmt(Math.round(kpis.cases * 0.0046));
        document.getElementById('kpi-deaths-delta').textContent = '+' + fmt(Math.round(kpis.deaths * 0.0017));
        document.getElementById('kpi-recovered-delta').textContent = '+' + fmt(Math.round(kpis.recovered * 0.004));
    }

    /* ---------- Full Dashboard Render ---------- */
    function renderAll(data) {
        currentData = data;

        // Update last updated date based on selected year
        const selectedYear = FiltersModule.getState ? FiltersModule.getState().year : 'All';
        const dateOptions = { day: '2-digit', month: 'long' };
        const dayMonth = new Date().toLocaleDateString('en-GB', dateOptions); // e.g. "05 August"
        const displayYear = selectedYear === 'All' ? '2026' : selectedYear;
        const lastUpdatedEl = document.getElementById('last-updated-date');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = `${dayMonth} ${displayYear}`;
        }

        // KPIs
        const kpis = DataModule.getKPIs(data);
        updateKPIs(kpis);

        // Map
        MapModule.update(data);

        // Donut — Cases by Continent
        const casesByContinent = DataModule.getCasesByContinent(data);
        ChartsModule.renderDonut('chart-donut', casesByContinent);

        // Top 10 bar chart
        const top10 = DataModule.getTopCountries(data, 10);
        ChartsModule.renderTopCountries('chart-top10', top10);

        // Vaccination by continent
        const vaccByContinent = DataModule.getVaccinationByContinent(data);
        ChartsModule.renderVaccContinent('chart-vacc-continent', vaccByContinent);

        // Timeline
        const timeSeries = DataModule.getTimeSeries(data);
        ChartsModule.renderTimeline('chart-timeline', timeSeries);

        // Case Increase & Decrease Trends (2019-2026)
        const trendsSeries = DataModule.getCaseTrendsSeries(data);
        ChartsModule.renderCaseTrends('chart-trends', trendsSeries);

        // Summary table
        renderSummaryTable(data);

        // Gauge
        ChartsModule.renderGauge('chart-gauge', kpis.vaccinationRate, 'gauge-value');

        // Reset rendered sub-views so they re-render with filtered data
        renderedViews.clear();
        renderedViews.add('overview');

        // If we are currently on a sub-view, re-render it immediately!
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            const activeView = activeNav.dataset.view;
            if (activeView !== 'overview') {
                renderSubView(activeView);
            }
        }
    }

    /* ---------- Init ---------- */
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Set dynamic last updated date
            const dateOptions = { day: '2-digit', month: 'long', year: 'numeric' };
            const today = new Date().toLocaleDateString('en-GB', dateOptions);
            document.getElementById('last-updated-date').textContent = today;

            // Init map
            MapModule.init('map-container');

            // Load data
            const data = await DataModule.loadCSV('sample_population_covid_data.csv');

            // Init filters
            FiltersModule.init();
            FiltersModule.populateContinents(data);
            FiltersModule.populateCountries(data, 'All');

            // Render everything
            renderAll(data);

            // Filter callbacks
            FiltersModule.onApply((filterState) => {
                const filtered = DataModule.applyFilters(data, filterState);
                renderAll(filtered);
            });

            FiltersModule.onReset((filterState) => {
                renderAll(data);
            });

        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    });

    // Handle window resize for map
    window.addEventListener('resize', () => MapModule.resize());

})();
