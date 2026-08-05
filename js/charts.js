/* ===== charts.js — All Chart.js Renderers ===== */

const ChartsModule = (() => {
    // Store chart instances for destroy-before-recreate
    const instances = {};

    const CONTINENT_COLORS = {
        'Asia': '#3B82F6',
        'Europe': '#F59E0B',
        'North America': '#10B981',
        'South America': '#06B6D4',
        'Africa': '#EF4444',
        'Oceania': '#8B5CF6'
    };

    const GRADIENT_COLORS = [
        '#3B82F6', '#10B981', '#F59E0B', '#06B6D4', '#EF4444', '#8B5CF6', '#EC4899',
        '#14B8A6', '#F97316', '#6366F1'
    ];

    function formatNum(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toString();
    }

    function destroyChart(id) {
        if (instances[id]) {
            instances[id].destroy();
            delete instances[id];
        }
    }

    /* ----- Donut Chart: Cases by Continent ----- */
    function renderDonut(canvasId, dataMap) {
        destroyChart(canvasId);
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        const total = values.reduce((a, b) => a + b, 0);
        const colors = labels.map(l => CONTINENT_COLORS[l] || '#94A3B8');

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '62%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            borderRadius: 5,
                            useBorderRadius: true,
                            padding: 12,
                            font: { size: 11, family: "'Inter', sans-serif" },
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}  ${formatNum(data.datasets[0].data[i])} (${((data.datasets[0].data[i] / total) * 100).toFixed(1)}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: 'transparent',
                                    index: i,
                                    hidden: false
                                }));
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${formatNum(ctx.raw)} (${((ctx.raw / total) * 100).toFixed(1)}%)`
                        }
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                afterDraw(chart) {
                    const { ctx: c, chartArea } = chart;
                    const cx = (chartArea.left + chartArea.right) / 2;
                    const cy = (chartArea.top + chartArea.bottom) / 2;
                    c.save();
                    c.textAlign = 'center';
                    c.textBaseline = 'middle';
                    c.font = "800 1.4rem 'Inter', sans-serif";
                    c.fillStyle = '#1E293B';
                    c.fillText(formatNum(total), cx, cy - 8);
                    c.font = "500 0.65rem 'Inter', sans-serif";
                    c.fillStyle = '#94A3B8';
                    c.fillText('Total Cases', cx, cy + 12);
                    c.restore();
                }
            }]
        });
    }

    /* ----- Horizontal Bar Chart: Top 10 Countries ----- */
    function renderTopCountries(canvasId, data) {
        destroyChart(canvasId);
        const labels = data.map(r => r.Country);
        const values = data.map(r => r.Total_Cases);

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: '#3B82F6',
                    borderRadius: 4,
                    borderSkipped: false,
                    barPercentage: 0.7,
                    categoryPercentage: 0.85
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${formatNum(ctx.raw)} cases`
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (val) => formatNum(val),
                        font: { size: 10, weight: 600, family: "'Inter', sans-serif" },
                        color: '#64748B',
                        padding: { left: 4 }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Total Cases', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        grid: { color: '#F1F5F9', drawBorder: false },
                        ticks: {
                            callback: (v) => formatNum(v),
                            font: { size: 10 },
                            color: '#94A3B8'
                        },
                        border: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Country', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: '#475569' },
                        border: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    /* ----- Vertical Bar Chart: Vaccination Rate by Continent ----- */
    function renderVaccContinent(canvasId, dataMap) {
        destroyChart(canvasId);
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        const colors = labels.map(l => CONTINENT_COLORS[l] || '#94A3B8');

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.map(c => c + 'CC'),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12, font: { size: 9, family: "'Inter', sans-serif" }, color: '#475569' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
                        }
                    },
                    datalabels: {
                        formatter: (val) => val + '%',
                        font: { size: 9, weight: 600, family: "'Inter', sans-serif" },
                        color: '#1e293b'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            display: true,
                            callback: (v) => v + '%',
                            font: { size: 9, family: "'Inter', sans-serif" },
                            color: '#94A3B8',
                            backdropColor: 'rgba(255, 255, 255, 0.75)'
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    /* ----- Line Chart: Cases Over Time ----- */
    function renderTimeline(canvasId, seriesData) {
        destroyChart(canvasId);
        const labels = seriesData.map(d => d.year);

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Total Cases',
                        data: seriesData.map(d => d.cases),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2.5
                    },
                    {
                        label: 'Total Deaths',
                        data: seriesData.map(d => d.deaths),
                        borderColor: '#EF4444',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2
                    },
                    {
                        label: 'Recovered',
                        data: seriesData.map(d => d.recovered),
                        borderColor: '#10B981',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 3,
                            borderRadius: 2,
                            useBorderRadius: true,
                            padding: 16,
                            font: { size: 11, family: "'Inter', sans-serif" }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)}`
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Count', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        grid: { color: '#F1F5F9', drawBorder: false },
                        ticks: {
                            callback: (v) => formatNum(v),
                            font: { size: 10 },
                            color: '#94A3B8'
                        },
                        border: { display: false }
                    },
                    x: {
                        title: { display: true, text: 'Year', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: '#475569' },
                        border: { display: false }
                    }
                }
            }
        });
    }

    /* ----- Gauge Chart: Vaccination Progress ----- */
    function renderGauge(canvasId, value, labelId) {
        destroyChart(canvasId);
        const numValue = parseFloat(value) || 0;

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [numValue, 100 - numValue],
                    backgroundColor: [
                        createGaugeGradient(ctx, numValue),
                        '#E2E8F0'
                    ],
                    borderWidth: 0,
                    hoverOffset: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                rotation: -90,
                circumference: 180,
                cutout: '78%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    datalabels: { display: false }
                }
            }
        });

        // Update label
        if (labelId) {
            document.getElementById(labelId).textContent = numValue + '%';
        }
    }

    function createGaugeGradient(ctx, value) {
        const gradient = ctx.createLinearGradient(0, 0, 250, 0);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(0.5, '#06B6D4');
        gradient.addColorStop(1, '#10B981');
        return gradient;
    }

    /* ----- Country Analysis Charts ----- */
    function renderCountryCompare(canvasId, data) {
        destroyChart(canvasId);
        const sorted = [...data].sort((a, b) => b.Total_Cases - a.Total_Cases).slice(0, 15);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.map(r => r.Country),
                datasets: [
                    {
                        label: 'Total Cases',
                        data: sorted.map(r => r.Total_Cases),
                        backgroundColor: '#3B82F6CC',
                        borderRadius: 4,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Total Deaths',
                        data: sorted.map(r => r.Total_Deaths),
                        backgroundColor: '#EF4444CC',
                        borderRadius: 4,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { boxWidth: 12, font: { size: 11 } } },
                    datalabels: { display: false }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Cases / Deaths Count', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    x: {
                        title: { display: true, text: 'Country', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { font: { size: 9 }, color: '#475569', maxRotation: 45 },
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }

    function renderCasesPerMillion(canvasId, data) {
        destroyChart(canvasId);
        const sorted = [...data].sort((a, b) => b.Cases_per_Million - a.Cases_per_Million).slice(0, 10);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: sorted.map(r => r.Country),
                datasets: [{
                    data: sorted.map(r => r.Cases_per_Million),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(6, 182, 212, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                        'rgba(20, 184, 166, 0.7)',
                        'rgba(249, 115, 22, 0.7)',
                        'rgba(99, 102, 241, 0.7)'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12, font: { size: 9, family: "'Inter', sans-serif" }, color: '#475569' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${formatNum(ctx.raw)} per million`
                        }
                    },
                    datalabels: {
                        formatter: (val) => formatNum(val),
                        font: { size: 8, weight: 600, family: "'Inter', sans-serif" },
                        color: '#1e293b'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            display: true,
                            callback: (v) => formatNum(v),
                            font: { size: 9, family: "'Inter', sans-serif" },
                            color: '#94A3B8',
                            backdropColor: 'rgba(255, 255, 255, 0.75)'
                        },
                        grid: {
                            color: '#f1f5f9'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function renderActiveCases(canvasId, data) {
        destroyChart(canvasId);
        const sorted = [...data].sort((a, b) => b.Active_Cases - a.Active_Cases).slice(0, 10);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sorted.map(r => r.Country),
                datasets: [{
                    data: sorted.map(r => r.Active_Cases),
                    backgroundColor: GRADIENT_COLORS,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '40%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 10, font: { size: 10 }, padding: 8 }
                    },
                    tooltip: {
                        callbacks: { label: ctx => ` ${ctx.label}: ${formatNum(ctx.raw)}` }
                    },
                    datalabels: { display: false }
                }
            }
        });
    }

    function renderDeathRate(canvasId, data) {
        destroyChart(canvasId);
        const sorted = [...data].sort((a, b) => b.Death_Rate - a.Death_Rate).slice(0, 10);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: sorted.map(r => r.Country),
                datasets: [{
                    label: 'Death Rate (%)',
                    data: sorted.map(r => r.Death_Rate),
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: '#EF4444',
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#EF4444',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        formatter: v => v + '%',
                        font: { size: 9, weight: 600, family: "'Inter', sans-serif" },
                        color: '#ef4444'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            display: true,
                            callback: (v) => v + '%',
                            font: { size: 9, family: "'Inter', sans-serif" },
                            color: '#94A3B8',
                            backdropColor: 'rgba(255, 255, 255, 0.75)'
                        },
                        grid: { color: '#f1f5f9' },
                        angleLines: { color: '#f1f5f9' },
                        pointLabels: {
                            font: { size: 10, family: "'Inter', sans-serif" },
                            color: '#475569'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    /* ----- Vaccination Analysis Charts ----- */
    function renderVaccCountry(canvasId, data) {
        destroyChart(canvasId);
        const sorted = [...data].sort((a, b) => b.Vaccination_Rate - a.Vaccination_Rate);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sorted.map(r => r.Country),
                datasets: [{
                    label: 'Vaccination Rate (%)',
                    data: sorted.map(r => r.Vaccination_Rate),
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderColor: '#3B82F6',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end', align: 'top',
                        formatter: v => v + '%',
                        font: { size: 8, weight: 600 },
                        color: '#475569'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true, max: 100,
                        title: { display: true, text: 'Vaccination Rate (%)', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { callback: v => v + '%', font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    x: {
                        title: { display: true, text: 'Country', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { font: { size: 9 }, color: '#475569', maxRotation: 45 },
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function renderVaccVsDeath(canvasId, data) {
        destroyChart(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Countries',
                    data: data.map(r => ({ x: r.Vaccination_Rate, y: r.Death_Rate, label: r.Country })),
                    backgroundColor: '#3B82F6AA',
                    borderColor: '#3B82F6',
                    borderWidth: 1.5,
                    pointRadius: 6,
                    pointHoverRadius: 9
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.raw.label}: Vacc ${ctx.raw.x}%, Death ${ctx.raw.y}%`
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Vaccination Rate (%)', font: { size: 11 } },
                        ticks: { font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Death Rate (%)', font: { size: 11 } },
                        ticks: { font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    }
                }
            }
        });
    }

    function renderVaccDistribution(canvasId, data) {
        destroyChart(canvasId);
        const bins = { '90-100%': 0, '80-89%': 0, '70-79%': 0, '60-69%': 0, '<60%': 0 };
        data.forEach(r => {
            const v = r.Vaccination_Rate;
            if (v >= 90) bins['90-100%']++;
            else if (v >= 80) bins['80-89%']++;
            else if (v >= 70) bins['70-79%']++;
            else if (v >= 60) bins['60-69%']++;
            else bins['<60%']++;
        });

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(bins),
                datasets: [{
                    label: 'Countries',
                    data: Object.values(bins),
                    backgroundColor: ['#10B981CC', '#22D3EECC', '#F59E0BCC', '#FB923CCC', '#EF4444CC'],
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end', align: 'top',
                        font: { size: 12, weight: 700 },
                        color: '#475569'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false },
                        title: { display: true, text: 'Number of Countries', font: { size: 11 } }
                    },
                    x: {
                        ticks: { font: { size: 11 }, color: '#475569' },
                        grid: { display: false },
                        border: { display: false },
                        title: { display: true, text: 'Vaccination Rate Range', font: { size: 11 } }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    /* ----- Population Analysis Charts ----- */
    function renderPopContinent(canvasId, dataMap) {
        destroyChart(canvasId);
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        const colors = labels.map(l => CONTINENT_COLORS[l] || '#94A3B8');

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 10, font: { size: 11 }, padding: 10,
                            generateLabels: chart => chart.data.labels.map((l, i) => ({
                                text: `${l}  ${formatNum(chart.data.datasets[0].data[i])}`,
                                fillStyle: chart.data.datasets[0].backgroundColor[i],
                                strokeStyle: 'transparent',
                                index: i
                            }))
                        }
                    },
                    datalabels: { display: false }
                }
            }
        });
    }

    function renderPopVsCases(canvasId, data) {
        destroyChart(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Countries',
                    data: data.map(r => ({ x: r.Population, y: r.Total_Cases, label: r.Country })),
                    backgroundColor: Object.values(CONTINENT_COLORS),
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    pointRadius: 7,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.raw.label}: Pop ${formatNum(ctx.raw.x)}, Cases ${formatNum(ctx.raw.y)}`
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Population', font: { size: 11 } },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Total Cases', font: { size: 11 } },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    }
                }
            }
        });
    }

    function renderPopTop(canvasId, data) {
        destroyChart(canvasId);
        const sorted = [...data].sort((a, b) => b.Population - a.Population).slice(0, 10);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.map(r => r.Country),
                datasets: [{
                    data: sorted.map(r => r.Population),
                    backgroundColor: GRADIENT_COLORS,
                    borderRadius: 4,
                    barPercentage: 0.7
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end', align: 'end',
                        formatter: v => formatNum(v),
                        font: { size: 9, weight: 600 },
                        color: '#64748B'
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Population', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Country', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { font: { size: 10 }, color: '#475569' },
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function renderCpmVsVacc(canvasId, data) {
        destroyChart(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Countries',
                    data: data.map(r => ({ x: r.Cases_per_Million, y: r.Vaccination_Rate, label: r.Country })),
                    backgroundColor: '#8B5CF6AA',
                    borderColor: '#8B5CF6',
                    borderWidth: 1.5,
                    pointRadius: 6,
                    pointHoverRadius: 9
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.raw.label}: CPM ${formatNum(ctx.raw.x)}, Vacc ${ctx.raw.y}%`
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Cases per Million', font: { size: 11 } },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Vaccination Rate (%)', font: { size: 11 } },
                        ticks: { font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    }
                }
            }
        });
    }

    /* ----- Case Increase & Decrease Trends (2019–2026) ----- */
    function renderCaseTrends(canvasId, trendData) {
        destroyChart(canvasId);
        const labels = trendData.map(d => d.year);
        const newCasesData = trendData.map(d => d.newCases);
        const cumulativeData = trendData.map(d => d.cumulative);

        // Color bars: Surge years (2019-2022) in red/coral, Declining/stabilizing years (2023-2026) in emerald/green
        const barColors = trendData.map((d, idx) => {
            if (idx <= 3) return 'rgba(239, 68, 68, 0.8)'; // Red/coral for surge increase
            return 'rgba(16, 185, 129, 0.8)'; // Green for slowdown/decrease
        });

        const ctx = document.getElementById(canvasId).getContext('2d');
        instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Annual New Cases (Yearly Increase / Decrease)',
                        data: newCasesData,
                        backgroundColor: barColors,
                        borderRadius: 6,
                        barPercentage: 0.55,
                        order: 2,
                        yAxisID: 'yNew'
                    },
                    {
                        type: 'line',
                        label: 'Cumulative Total Cases',
                        data: cumulativeData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        fill: true,
                        tension: 0.35,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 8,
                        order: 1,
                        yAxisID: 'yTotal'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 12, font: { size: 11, family: "'Inter', sans-serif" }, color: '#475569' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${formatNum(ctx.raw)}`
                        }
                    },
                    datalabels: {
                        formatter: (v, ctx) => {
                            if (ctx.datasetIndex === 0 && v > 0) return formatNum(v);
                            return '';
                        },
                        anchor: 'end',
                        align: 'top',
                        font: { size: 9, weight: 600, family: "'Inter', sans-serif" },
                        color: '#475569'
                    }
                },
                scales: {
                    yNew: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: { display: true, text: 'Annual New Cases (Increase/Decrease)', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#94A3B8' },
                        grid: { color: '#F1F5F9' },
                        border: { display: false }
                    },
                    yTotal: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: 'Cumulative Total Cases', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#3B82F6' },
                        ticks: { callback: v => formatNum(v), font: { size: 10 }, color: '#3B82F6' },
                        grid: { display: false },
                        border: { display: false }
                    },
                    x: {
                        title: { display: true, text: 'Year (2019 – 2026)', font: { size: 11, weight: 500, family: "'Inter', sans-serif" }, color: '#64748B' },
                        ticks: { font: { size: 11, weight: 600 }, color: '#475569' },
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    return {
        renderDonut,
        renderTopCountries,
        renderVaccContinent,
        renderTimeline,
        renderCaseTrends,
        renderGauge,
        renderCountryCompare,
        renderCasesPerMillion,
        renderActiveCases,
        renderDeathRate,
        renderVaccCountry,
        renderVaccVsDeath,
        renderVaccDistribution,
        renderPopContinent,
        renderPopVsCases,
        renderPopTop,
        renderCpmVsVacc
    };
})();
