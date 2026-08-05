/* ===== filters.js — Filter Controls & Apply/Reset Logic ===== */

const FiltersModule = (() => {
    const els = {};

    function init() {
        els.continent = document.getElementById('filter-continent');
        els.country = document.getElementById('filter-country');
        els.year = document.getElementById('filter-year');
        els.btnApply = document.getElementById('btn-apply-filters');
        els.btnReset = document.getElementById('btn-reset-filters');
        els.btnCollapse = document.getElementById('btn-collapse-filters');
        els.filtersBody = document.getElementById('filters-body');

        // Continent changes → filter country dropdown
        els.continent.addEventListener('change', () => {
            populateCountries(DataModule.getRawData(), els.continent.value);
        });

        // Collapse toggle
        els.btnCollapse.addEventListener('click', () => {
            els.filtersBody.classList.toggle('collapsed');
            els.btnCollapse.classList.toggle('collapsed');
        });
    }

    function populateContinents(data) {
        const continents = DataModule.getUnique(data, 'Continent');
        els.continent.innerHTML = '<option value="All">All</option>';
        continents.forEach(c => {
            els.continent.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }

    function populateCountries(data, continent) {
        let filtered = data;
        if (continent && continent !== 'All') {
            filtered = data.filter(r => r.Continent === continent);
        }
        const countries = DataModule.getUnique(filtered, 'Country');
        els.country.innerHTML = '<option value="All">All</option>';
        countries.forEach(c => {
            els.country.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }

    function getState() {
        return {
            continent: els.continent.value,
            country: els.country.value,
            year: els.year.value,
            popMin: 0,
            popMax: 1500000000,
            vaccMin: 0,
            vaccMax: 100
        };
    }

    function reset() {
        els.continent.value = 'All';
        els.country.value = 'All';
        els.year.value = 'All';
        // Re-populate country dropdown
        populateCountries(DataModule.getRawData(), 'All');
    }

    function onApply(callback) {
        els.btnApply.addEventListener('click', () => callback(getState()));
    }

    function onReset(callback) {
        els.btnReset.addEventListener('click', () => {
            reset();
            callback(getState());
        });
    }

    return { init, populateContinents, populateCountries, getState, reset, onApply, onReset };
})();
