# 📊 COVID-19 Global Dashboard

A high-fidelity, interactive, and responsive web application designed for comprehensive tracking, simulation, and visualization of global COVID-19 metrics. Built with pure HTML5, Vanilla CSS3, JavaScript (ES6+), Chart.js, Leaflet.js, and PapaParse.

---

## 🌟 Project Overview

The **COVID-19 Global Dashboard** provides a modern, intuitive, and interactive interface for exploring worldwide pandemic statistics across 25 major countries and 6 continents. Featuring a rich dark-themed sidebar navigation combined with high-contrast light card layouts, the dashboard offers multi-view analytical perspectives, time-series simulations (2020–2026), and data heatmap summaries.

Each visualization card explicitly highlights its graph type via custom **Graph Type Badges** (e.g. `DONUT CHART`, `POLAR AREA CHART`, `LINE CHART`, `GAUGE CHART`, `TABLE HEATMAP`), ensuring maximum clarity and data literacy.

---

## ✨ Key Features

- 🗺️ **Interactive Global Map**: Visualizes country-level COVID-19 case distributions using custom Leaflet.js map markers categorized by low (<1M), medium (1M–10M), and high (>10M) case counts.
- 📈 **Diverse Data Visualizations**: Eliminates repetitive chart styles by combining **Donut**, **Polar Area**, **Line**, **Horizontal Bar**, **Grouped Bar**, **Scatter**, **Radar**, and **Gauge** charts.
- ⏳ **Timeline & Year Simulator**: Includes on-the-fly mathematical year simulation (2020–2026) using S-Curve epidemiological growth factors and linear vaccine progression multipliers.
- 🟩 **Dynamic Table Cell Heatmap**: Highlights critical data cells in the summary and full country tables using color-coded conditional thresholds:
  - **Vaccination Rate (%)**: Green (`≥ 75%`), Light Green (`≥ 68%`), Yellow (`≥ 64%`), Red (`< 64%`).
  - **Death Rate (%)**: Light Green (`< 1.0%`), Neutral (`1.0%–2.0%`), Red (`≥ 2.0%`).
  - **Recovery Rate (%)**: Green (`≥ 98%`), Light Green (`≥ 97%`), Red (`< 97%`).
- 🎯 **Interactive Sidebar Filters**: Filter global data instantaneously by **Continent**, **Country**, and **Year**.
- 📏 **Explicit Scale Indicators**: All charts feature explicit X/Y axis titles, tick markers, unit callbacks, and radial percentage scales.

---

## 🔍 Dashboard Views & Visualizations

### 1. 📊 Overview
- **KPI Summary Cards**: Total Population, Total Cases, Total Deaths, Recovered, and Vaccination Rate with live delta updates.
- **Cases by Continent** (`DONUT CHART`): Proportional continent breakdown of cumulative cases.
- **Top 10 Countries by Total Cases** (`HORIZONTAL BAR CHART`): Top case counts per nation.
- **Vaccination Rate by Continent** (`POLAR AREA CHART`): Radial continental vaccination comparisons.
- **Cases Over Time (Global)** (`LINE CHART`): Multi-series trendline for total cases, deaths, and recoveries.
- **Country Summary** (`TABLE HEATMAP`): Tabular country data with heatmap metric cells.
- **Vaccination Progress** (`GAUGE CHART`): Global population vaccination progress meter.

### 2. 🌍 Country Analysis
- **Cases vs Deaths by Country** (`GROUPED BAR CHART`): Side-by-side comparison of cases against fatalities.
- **Cases per Million** (`POLAR AREA CHART`): Normalized case impact per 1,000,000 citizens.
- **Active Cases Distribution** (`DOUGHNUT CHART`): Breakdown of active cases across top affected nations.
- **Death Rate Comparison** (`RADAR CHART`): Web-like mortality rate comparison across countries.
- **Full Country Data** (`TABLE HEATMAP`): Complete detailed dataset table.

### 3. 💉 Vaccination Analysis
- **Vaccination Rate by Country** (`AREA LINE CHART`): Smooth descending area chart for nation-wide vaccine coverage.
- **Vaccination vs Death Rate** (`SCATTER CHART`): Correlation analysis between vaccination rates and mortality.
- **Vaccination Coverage Distribution** (`VERTICAL BAR CHART`): Country count histogram across coverage percentage bins.
- **Global Vaccination** (`GAUGE CHART`): Average global vaccination indicator.

### 4. 👥 Population Analysis
- **Population by Continent** (`DOUGHNUT CHART`): Continental population distribution.
- **Population vs Total Cases** (`SCATTER CHART`): Correlation scatter plot connecting population size with case load.
- **Top Countries by Population** (`HORIZONTAL BAR CHART`): Population ranking of major nations.
- **Cases per Million vs Vaccination** (`SCATTER CHART`): Multi-variable metric correlation scatter plot.

---

## 🛠️ Tech Stack & Libraries

| Category | Technology |
| :--- | :--- |
| **Core Architecture** | HTML5, Vanilla CSS3, JavaScript (ES6+ Modules) |
| **Charting Library** | [Chart.js v4.4.4](https://www.chartjs.org/) |
| **Chart Data Labels** | [chartjs-plugin-datalabels v2.2.0](https://chartjs-plugin-datalabels.netlify.app/) |
| **Map Rendering** | [Leaflet.js v1.9.4](https://leafletjs.com/) |
| **CSV Parser** | [PapaParse v5.4.1](https://www.papaparse.com/) |
| **Typography & Styling** | Inter Google Font, Custom CSS Variables, Glassmorphism Aesthetics |

---

## 📁 Directory Structure

```
COVID-19-Global-Dashboard/
├── css/
│   └── styles.css                   # Custom Design System, Utility Classes, & Heatmap Styles
├── js/
│   ├── app.js                       # Main Event Coordinator & Navigation Handler
│   ├── charts.js                    # Chart.js Render Functions & Scale Definitions
│   ├── data.js                      # PapaParse Loader, Cleaning, & Year Simulation Logic
│   ├── filters.js                   # Filter Controls & Reset Bindings
│   └── map.js                       # Leaflet Map Module & Circle Marker Renderer
├── index.html                       # Core Application HTML Structure
├── sample_population_covid_data.csv # COVID-19 Global Dataset
└── README.md                        # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
To run this project locally, you only need a simple HTTP server (such as Node.js `http-server`, Python `http.server`, or VS Code Live Server).

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shiavmm/COVID-19-Global-Dashboard.git
   cd COVID-19-Global-Dashboard
   ```

2. **Start a local web server**:
   - **Using Node.js (`npx`)**:
     ```bash
     npx http-server -p 8085
     ```
   - **Using Python 3**:
     ```bash
     python -m http.server 8085
     ```

3. **Open in browser**:
   Navigate to `http://localhost:8085` to interact with the dashboard.

---

## 📄 Data Sources

- **Our World in Data** — [COVID-19 Dataset](https://ourworldindata.org/coronavirus)
- **Johns Hopkins University** — [CSSE COVID-19 Data](https://github.com/CSSEGISandData/COVID-19)

---

## 👤 Author

Designed and developed by **Shivam Pal**.
