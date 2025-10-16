function showSpinner() {
  document.getElementById('spinner').classList.remove('hidden');
}
function hideSpinner() {
  document.getElementById('spinner').classList.add('hidden');
}
const cache = {};

async function fetchWithCache(url) {
  if (cache[url]) return cache[url];
  const res = await fetch(url);
  const data = await res.json();
  cache[url] = data;
  return data;
}

// Example usage with your dashboard loading
async function loadDashboard() {
  showSpinner();
  try {
    // Load all overview charts and tables in parallel
    await Promise.all([
      loadSummaryData(),
      loadDurationDistribution(),
      loadDistanceDistribution(),
      loadSpeedDistribution(),
      loadPassengerDistribution(),
      loadLocationChart(),
      loadTopLocationsTable(),
      loadDataQualitySummary(),
      fetchVendorData().then(data => updateVendorChart(data, 'all')),
    ]);
  } catch (err) {
    console.error("Error loading dashboard:", err);
  } finally {
    hideSpinner();
  }
}

// ===== TAB NAVIGATION =====
const navLinks = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("main section");

navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    // Highlight active link
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // Hide all sections
    sections.forEach(s => (s.style.display = "none"));

    // Show selected section
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    targetSection.style.display = "block";

    // Load data for that tab only once
    if (targetId === "Time-analysis" && !targetSection.dataset.loaded) {
      showSpinner();
      loadTimeAnalysisData().finally(hideSpinner);
      targetSection.dataset.loaded = "true";
    }
    if (targetId === "Trip-statistics" && !targetSection.dataset.loaded) {
      showSpinner();
      loadTripStatsData().finally(hideSpinner);
      targetSection.dataset.loaded = "true";
    }
    if (targetId === "Location-insights" && !targetSection.dataset.loaded) {
      showSpinner();
      loadLocationInsightsData().finally(hideSpinner);
      targetSection.dataset.loaded = "true";
    }
    if (targetId === "Data-quality" && !targetSection.dataset.loaded) {
      showSpinner();
      loadDataQualityData().finally(hideSpinner);
      targetSection.dataset.loaded = "true";
    }
  });
});

async function loadSummaryData() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/stats/summary");
    const data = await response.json();

    document.getElementById("totalTrips").textContent = data.total_trips.toLocaleString();
    document.getElementById("avgDuration").textContent = data.avg_duration_minutes + " min";
    document.getElementById("avgDistance").textContent = data.avg_distance_km + " km";
    document.getElementById("avgSpeed").textContent = data.avg_speed_kmh + " km/h";
  } catch (error) {
    console.error("Error loading summary data:", error);
  }
}

// ------------------- Chart -------------------
const ctx = document.getElementById("hourlyChart").getContext("2d");

// Initial chart (daily by default)
let chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Number of Trips",
      data: [],
      backgroundColor: "rgba(199, 104, 8, 0.6)",
      borderColor: "rgb(199, 104, 8)",
      borderWidth: 1,
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
      x: { title: { display: true, text: "Time" }, ticks: { maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 12 } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "rgba(0,0,0,0.7)", titleFont: { size: 14 }, bodyFont: { size: 13 }, padding: 10 }
    }
  }
});

// API endpoints we currently have
const API_BASE = "http://127.0.0.1:5000";

// ---------------------- STATE ----------------------
let currentVendor = 'all';
let currentView = 'daily';
let cachedData = {}; // store fetched data per view

// ---------------------- FETCH DATA ----------------------
async function fetchData(view) {
  let endpoint = `${API_BASE}/api/stats/hourly`;
  if (view === 'weekly') endpoint = `${API_BASE}/api/stats/daily-patterns`;
  if (view === 'monthly') endpoint = `${API_BASE}/api/stats/monthly-trends`;

  const response = await fetch(endpoint);
  const data = await response.json();

  cachedData[view] = data; // cache for filtering
  return data;
}

// ---------------------- APPLY FILTERS ----------------------
function applyFilters() {
  currentView = document.getElementById("tripFilter").value;
  currentVendor = document.getElementById("vendorFilter").value;

  // Use cached data if exists, otherwise fetch
  if (cachedData[currentView]) {
    updateChartWithFilter(cachedData[currentView]);
  } else {
    fetchData(currentView).then(updateChartWithFilter);
  }
}

function updateChartWithFilter(data) {
  // Filter by vendor if not 'all'
  let filteredData = data;
  if (currentVendor !== 'all') {
    filteredData = data.filter(d => d.vendor_id == currentVendor || d.vendor_name == currentVendor);
  }

  let labels = [], counts = [];

  if (currentView === "daily") {
    labels = filteredData.map(d => d.hour + "h");
    counts = filteredData.map(d => d.trip_count);
    chart.config.type = "bar";
  } else if (currentView === "weekly") {
    labels = filteredData.map(d => d.day_name);
    counts = filteredData.map(d => d.trip_count);
    chart.config.type = "line";
  } else if (currentView === "monthly") {
    labels = filteredData.map(d => d.month);
    counts = filteredData.map(d => d.trip_count);
    chart.config.type = "bar";
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = counts;
  chart.update();
}

applyFilters();

document.getElementById("tripFilter").addEventListener("change", applyFilters);
document.getElementById("vendorFilter").addEventListener("change", applyFilters);
document.getElementById("applyFilter").addEventListener("click", applyFilters);

async function loadDurationDistribution() {
  const response = await fetch("http://127.0.0.1:5000/api/stats/duration-distribution");
  const data = await response.json();

  const labels = data.map(d => d.duration_range);
  const counts = data.map(d => d.trip_count);

  const ctx = document.getElementById("durationChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Number of Trips",
        data: counts,
        backgroundColor: "rgba(199, 104, 8, 0.6)",
        borderColor: "rgb(199, 104, 8)",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
        x: { title: { display: true, text: "Trip Duration" } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

async function loadLocationChart() {
  const response = await fetch("http://127.0.0.1:5000/api/boroughs");
  const data = await response.json();

  const labels = data.map(d => d.borough);
  const counts = data.map(d => d.trip_count);

  const ctx = document.getElementById("locationChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Number of Trips",
        data: counts,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
        x: { title: { display: true, text: "Borough" } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

async function loadDistanceDistribution() {
  try {
    const response = await fetch(`${API_BASE}/api/stats/distance-distribution`);
    const data = await response.json();

    const labels = data.map(d => d.distance_range);
    const counts = data.map(d => d.trip_count);

    const ctx = document.getElementById("distanceChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Number of Trips",
          data: counts,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
          x: { title: { display: true, text: "Trip Distance" } }
        },
        plugins: { legend: { display: false } }
      }
    });
  } catch (error) {
    console.error("Error loading distance distribution:", error);
  }
}

async function loadSpeedDistribution() {
  try {
    const response = await fetch(`${API_BASE}/api/stats/speed-distribution`);
    const data = await response.json();

    const labels = data.map(d => d.speed_range);
    const counts = data.map(d => d.trip_count);

    const ctx = document.getElementById("speedChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Number of Trips",
          data: counts,
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgb(255, 159, 64)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
          x: { title: { display: true, text: "Trip Speed" } }
        },
        plugins: { legend: { display: false } }
      }
    });
  } catch (error) {
    console.error("Error loading speed distribution:", error);
  }
}

async function loadPassengerDistribution() {
  try {
    const response = await fetch(`${API_BASE}/api/stats/passenger-distribution`);
    const data = await response.json();

    const labels = data.map(d => d.passenger_count);
    const counts = data.map(d => d.trip_count);

    const ctx = document.getElementById("passengerChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Number of Trips",
          data: counts,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
          x: { title: { display: true, text: "Passenger Count" } }
        },
        plugins: { legend: { display: false } }
      }
    });
  } catch (error) {
    console.error("Error loading passenger distribution:", error);
  }
}

async function loadTopLocationsTable() {
  try {
    const response = await fetch(`${API_BASE}/api/stats/top-locations`);
    const data = await response.json();

    const tableBody = document.getElementById("topLocationsTableBody");
    tableBody.innerHTML = "";

    const topData = data.slice(0, 8);

    topData.forEach((location, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${location.borough}</td>
        <td>${location.latitude.toFixed(4)}</td>
        <td>${location.longitude.toFixed(4)}</td>
        <td>${location.trip_count.toLocaleString()}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading top locations table:", error);
    const tableBody = document.getElementById("topLocationsTableBody");
    tableBody.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
  }
}

async function loadDataQualitySummary() {
  try {
    const response = await fetch(`${API_BASE}/api/suspicious`);
    const data = await response.json();
    document.getElementById("suspiciousTrips").textContent = data.count.toLocaleString();

    const effResponse = await fetch(`${API_BASE}/api/stats/efficiency`);
    const effData = await effResponse.json();

    const ctx = document.getElementById("efficiencyChart").getContext("2d");
    new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [{
          label: "Distance vs Duration",
          data: effData.map(d => ({ x: d.distance_km, y: d.duration_minutes })),
          backgroundColor: "rgba(255, 206, 86, 0.7)"
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Distance (km)" } },
          y: { title: { display: true, text: "Duration (min)" } }
        },
        plugins: { legend: { display: true } }
      }
    });
  } catch (error) {
    console.error("Error loading data quality summary:", error);
  }
}

// ------------------- Vendor Chart -------------------
const vendorCtx = document.getElementById("vendorChart").getContext("2d");

let vendorChart = new Chart(vendorCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Number of Trips",
      data: [],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgb(54, 162, 235)",
      borderWidth: 1,
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
      x: { title: { display: true, text: "Vendor" } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "rgba(0,0,0,0.7)", titleFont: { size: 14 }, bodyFont: { size: 13 }, padding: 10 }
    }
  }
});

async function fetchVendorData() {
  const response = await fetch(`${API_BASE}/api/stats/vendors`);
  const data = await response.json();
  return data;
}

function updateVendorChart(data, selectedVendor) {
  let filteredData = data;

  if (selectedVendor !== 'all') {
    filteredData = data.filter(d => d.vendor_id == selectedVendor || d.vendor_name == selectedVendor);
  }

  vendorChart.data.labels = filteredData.map(d => d.vendor_name);
  vendorChart.data.datasets[0].data = filteredData.map(d => d.total_trips);
  vendorChart.update();
}

fetchVendorData().then(data => updateVendorChart(data, 'all'));

// ================= TIME ANALYSIS TAB =================
let timeAnalysisChart = null;

async function loadTimeAnalysisData() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/stats/trips-per-hour");
    const data = await response.json();

    const ctx = document.getElementById("timeAnalysisChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (timeAnalysisChart) {
      timeAnalysisChart.destroy();
    }

    timeAnalysisChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.hours,
        datasets: [{
          label: "Trips per Hour",
          data: data.counts,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: "Hour of the Day" } },
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
        },
        plugins: {
          legend: { display: true },
          tooltip: { backgroundColor: "rgba(0,0,0,0.7)", titleFont: { size: 14 }, bodyFont: { size: 13 } },
        },
      },
    });
  } catch (error) {
    console.error("Error loading time analysis data:", error);
  }
}

// ================= TRIP STATISTICS TAB =================
let tripStatsChart = null;

async function loadTripStatsData() {
  try {
    // Using distance distribution as example - adjust endpoint as needed
    const response = await fetch(`${API_BASE}/api/stats/distance-distribution`);
    const data = await response.json();

    const ctx = document.getElementById("tripStatsChart").getContext("2d");
    
    if (tripStatsChart) {
      tripStatsChart.destroy();
    }

    tripStatsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(d => d.distance_range),
        datasets: [{
          label: "Trip Count by Distance",
          data: data.map(d => d.trip_count),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
          x: { title: { display: true, text: "Distance Range" } }
        },
        plugins: { legend: { display: true } }
      }
    });
  } catch (error) {
    console.error("Error loading trip statistics:", error);
  }
}

// ================= LOCATION INSIGHTS TAB =================
let pickupHeatmapChart = null;
let dropoffHeatmapChart = null;

async function loadLocationInsightsData() {
  try {
    // Pickup heatmap
    const pickupResponse = await fetch(`${API_BASE}/api/stats/top-locations`);
    const pickupData = await pickupResponse.json();

    const pickupCtx = document.getElementById("pickupHeatmapChart").getContext("2d");
    
    if (pickupHeatmapChart) {
      pickupHeatmapChart.destroy();
    }

    pickupHeatmapChart = new Chart(pickupCtx, {
      type: "bar",
      data: {
        labels: pickupData.slice(0, 10).map(d => d.borough),
        datasets: [{
          label: "Pickup Locations",
          data: pickupData.slice(0, 10).map(d => d.trip_count),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
          x: { title: { display: true, text: "Borough" } }
        },
        plugins: { legend: { display: true } }
      }
    });

    // Dropoff heatmap (using boroughs data as example)
    const dropoffResponse = await fetch(`${API_BASE}/api/boroughs`);
    const dropoffData = await dropoffResponse.json();

    const dropoffCtx = document.getElementById("dropoffHeatmapChart").getContext("2d");
    
    if (dropoffHeatmapChart) {
      dropoffHeatmapChart.destroy();
    }

    dropoffHeatmapChart = new Chart(dropoffCtx, {
      type: "bar",
      data: {
        labels: dropoffData.map(d => d.borough),
        datasets: [{
          label: "Dropoff Locations",
          data: dropoffData.map(d => d.trip_count),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Trips" } },
          x: { title: { display: true, text: "Borough" } }
        },
        plugins: { legend: { display: true } }
      }
    });

  } catch (error) {
    console.error("Error loading location insights:", error);
  }
}

// ================= DATA QUALITY TAB =================
let missingDataChart = null;
let outlierDataChart = null;

async function loadDataQualityData() {
  try {
    // Missing data chart (example data structure)
    const missingCtx = document.getElementById("missingDataChart").getContext("2d");
    
    if (missingDataChart) {
      missingDataChart.destroy();
    }

    // Sample data - adjust based on your API
    missingDataChart = new Chart(missingCtx, {
      type: "bar",
      data: {
        labels: ["Distance", "Duration", "Passenger Count", "Fare Amount"],
        datasets: [{
          label: "Missing Data Points",
          data: [150, 75, 200, 50], // Replace with actual API data
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgb(255, 159, 64)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Count" } },
          x: { title: { display: true, text: "Field" } }
        },
        plugins: { legend: { display: true } }
      }
    });

    // Outlier data chart
    const suspiciousResponse = await fetch(`${API_BASE}/api/suspicious`);
    const suspiciousData = await suspiciousResponse.json();

    const outlierCtx = document.getElementById("outlierDataChart").getContext("2d");
    
    if (outlierDataChart) {
      outlierDataChart.destroy();
    }

    outlierDataChart = new Chart(outlierCtx, {
      type: "pie",
      data: {
        labels: ["Valid Trips", "Suspicious Trips"],
        datasets: [{
          data: [10000 - suspiciousData.count, suspiciousData.count], // Adjust total as needed
          backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
          borderColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)"],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          title: { display: true, text: 'Data Quality Overview' }
        }
      }
    });

  } catch (error) {
    console.error("Error loading data quality data:", error);
  }
}

// Initialize dashboard on load
loadDashboard();