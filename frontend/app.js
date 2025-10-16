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
    // Hourly trips
    const [hourlyRes, rushRes] = await Promise.all([
      fetch(`${API_BASE}/api/stats/hourly`),
      fetch(`${API_BASE}/api/stats/rush-hour`)
    ]);
    const hourlyData = await hourlyRes.json();
    const rushData = await rushRes.json();

    // Transform to existing structure expected by the chart logic
    const data = {
      hours: hourlyData.map(d => `${d.hour}`),
      counts: hourlyData.map(d => d.trip_count)
    };

    // Cards: Peak hour, Lowest hour
    if (hourlyData && hourlyData.length) {
      let peak = hourlyData.reduce((a, b) => (b.trip_count > a.trip_count ? b : a));
      let low = hourlyData.reduce((a, b) => (b.trip_count < a.trip_count ? b : a));
      document.getElementById("peakHour").textContent = `${peak.hour}:00 (${peak.trip_count.toLocaleString()} trips)`;
      document.getElementById("lowestHour").textContent = `${low.hour}:00 (${low.trip_count.toLocaleString()} trips)`;
    }

    // Rush hour average speed card and chart
    if (rushData && rushData.length) {
      const rushOnly = rushData.filter(r => r.period === 'Morning Rush' || r.period === 'Evening Rush');
      const avgRushSpeed = rushOnly.length ? (rushOnly.reduce((s, r) => s + (r.avg_speed || 0), 0) / rushOnly.length) : 0;
      document.getElementById("rushHourSpeed").textContent = `${avgRushSpeed.toFixed(2)} km/h`;

      const rushCtx = document.getElementById("rushHourChart").getContext("2d");
      if (window._rushHourChart) { window._rushHourChart.destroy(); }
      window._rushHourChart = new Chart(rushCtx, {
        type: "bar",
        data: {
          labels: rushData.map(r => `${r.hour}`),
          datasets: [{
            label: "Avg Speed (km/h)",
            data: rushData.map(r => r.avg_speed),
            backgroundColor: rushData.map(r => r.period.includes('Rush') ? "rgba(199, 104, 8, 0.7)" : "rgba(199, 104, 8, 0.35)"),
            borderColor: rushData.map(r => r.period.includes('Rush') ? "rgb(199, 104, 8)" : "rgb(199, 104, 8)"),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Hour" } },
            y: { beginAtZero: true, title: { display: true, text: "Avg Speed (km/h)" } }
          },
          plugins: { legend: { display: true } }
        }
      });
    }

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
    const [distRes, summaryRes, passRes, vendorsRes, dailyRes] = await Promise.all([
      fetch(`${API_BASE}/api/stats/distance-distribution`),
      fetch(`${API_BASE}/api/stats/summary`),
      fetch(`${API_BASE}/api/stats/passenger-distribution`),
      fetch(`${API_BASE}/api/stats/vendors`),
      fetch(`${API_BASE}/api/stats/daily-patterns`)
    ]);
    const data = await distRes.json();
    const summary = await summaryRes.json();
    const passengers = await passRes.json();
    const vendors = await vendorsRes.json();
    const daily = await dailyRes.json();

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

    // Populate cards
    document.getElementById("maxDistance").textContent = `${summary.max_distance_km} km`;
    document.getElementById("maxDuration").textContent = `${summary.max_duration_minutes} min`;
    if (passengers && passengers.length) {
      const mostCommon = passengers.reduce((a, b) => (b.trip_count > a.trip_count ? b : a));
      document.getElementById("commonPassengers").textContent = `${mostCommon.passenger_count} passengers`;
    }

    // Vendor comparison chart
    const vendorCmpCtx = document.getElementById("vendorComparisonChart").getContext("2d");
    if (window._vendorComparisonChart) { window._vendorComparisonChart.destroy(); }
    window._vendorComparisonChart = new Chart(vendorCmpCtx, {
      type: "bar",
      data: {
        labels: vendors.map(v => v.vendor_name),
        datasets: [{
          label: "Average Speed (km/h)",
          data: vendors.map(v => v.avg_speed_kmh),
          backgroundColor: "rgba(199, 104, 8, 0.6)",
          borderColor: "rgb(199, 104, 8)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Avg Speed (km/h)" } },
          x: { title: { display: true, text: "Vendor" } }
        },
        plugins: { legend: { display: false } }
      }
    });

    // Daily patterns chart
    const dailyCtx = document.getElementById("dailyPatternsChart").getContext("2d");
    if (window._dailyPatternsChart) { window._dailyPatternsChart.destroy(); }
    window._dailyPatternsChart = new Chart(dailyCtx, {
      type: "line",
      data: {
        labels: daily.map(d => d.day_name),
        datasets: [{
          label: "Trips",
          data: daily.map(d => d.trip_count),
          borderColor: "rgb(199, 104, 8)",
          backgroundColor: "rgba(199, 104, 8, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Trips" } },
          x: { title: { display: true, text: "Day" } }
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
    const [pickupResponse, boroughsResponse] = await Promise.all([
      fetch(`${API_BASE}/api/stats/top-locations`),
      fetch(`${API_BASE}/api/boroughs`)
    ]);
    const pickupData = await pickupResponse.json();
    const boroughsData = await boroughsResponse.json();

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
          x: { title: { display: true, text: "Borough" } }
        },
        plugins: { legend: { display: true } }
      }
    });

    // Dropoff heatmap (using boroughs data as example)
    const dropoffData = boroughsData;

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
          x: { title: { display: true, text: "Borough" } }
        },
        plugins: { legend: { display: true } }
      }
    });

    // Populate cards
    if (pickupData && pickupData.length) {
      document.getElementById("topPickupBorough").textContent = pickupData[0].borough;
    }
    if (boroughsData && boroughsData.length) {
      document.getElementById("topDropoffBorough").textContent = boroughsData[0].borough;
      const activeCount = boroughsData.filter(b => b.trip_count > 0).length;
      document.getElementById("activeBoroughs").textContent = `${activeCount}`;
    }

  } catch (error) {
    console.error("Error loading location insights:", error);
  }
}

// ================= DATA QUALITY TAB =================
let missingDataChart = null;
let outlierDataChart = null;

async function loadDataQualityData() {
  try {
    // High-level summary and supporting datasets
    const [summaryRes, suspiciousRes, effRes, distRes, boroughsRes] = await Promise.all([
      fetch(`${API_BASE}/api/stats/summary`),
      fetch(`${API_BASE}/api/suspicious`),
      fetch(`${API_BASE}/api/stats/efficiency`),
      fetch(`${API_BASE}/api/stats/distance-distribution`),
      fetch(`${API_BASE}/api/boroughs`)
    ]);
    const summary = await summaryRes.json();
    const suspiciousData = await suspiciousRes.json();
    const effData = await effRes.json();
    const distData = await distRes.json();
    const boroughsData = await boroughsRes.json();

    document.getElementById("totalSuspicious").textContent = summary.suspicious_trips.toLocaleString();
    document.getElementById("cleanTrips").textContent = summary.clean_trips.toLocaleString();
    const qualityPct = summary.total_trips ? ((summary.clean_trips / summary.total_trips) * 100).toFixed(2) : 0;
    document.getElementById("qualityPercentage").textContent = `${qualityPct}%`;

    // Data completeness (approximations based on available endpoints)
    const totalTrips = summary.total_trips || 0;
    const distanceCovered = distData.reduce((s, d) => s + (d.trip_count || 0), 0);
    const boroughsCovered = boroughsData.reduce((s, d) => s + (d.trip_count || 0), 0);
    const distancePct = totalTrips ? Math.min(100, Math.round((distanceCovered / totalTrips) * 100)) : 0;
    const durationPct = totalTrips ? 100 : 0; // duration available for all trips in this dataset
    const locationPct = totalTrips ? Math.min(100, Math.round((boroughsCovered / totalTrips) * 100)) : 0;

    const distanceFill = document.getElementById("distanceProgress");
    const durationFill = document.getElementById("durationProgress");
    const locationFill = document.getElementById("locationProgress");
    const distancePercentText = document.getElementById("distancePercent");
    const durationPercentText = document.getElementById("durationPercent");
    const locationPercentText = document.getElementById("locationPercent");

    if (distanceFill) distanceFill.style.width = `${distancePct}%`;
    if (durationFill) durationFill.style.width = `${durationPct}%`;
    if (locationFill) locationFill.style.width = `${locationPct}%`;
    if (distancePercentText) distancePercentText.textContent = `${distancePct}%`;
    if (durationPercentText) durationPercentText.textContent = `${durationPct}%`;
    if (locationPercentText) locationPercentText.textContent = `${locationPct}%`;

    // Missing data chart (placeholder as API not available for missingness)
    const missingCtx = document.getElementById("missingDataChart").getContext("2d");
    
    if (missingDataChart) {
      missingDataChart.destroy();
    }

    missingDataChart = new Chart(missingCtx, {
      type: "bar",
      data: {
        labels: ["Distance", "Duration", "Passenger Count", "Fare Amount"],
        datasets: [{
          label: "Missing Data Points",
          data: [0, 0, 0, 0],
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
    const outlierCtx = document.getElementById("outlierDataChart").getContext("2d");
    
    if (outlierDataChart) {
      outlierDataChart.destroy();
    }

    outlierDataChart = new Chart(outlierCtx, {
      type: "pie",
      data: {
        labels: ["Valid Trips", "Suspicious Trips"],
        datasets: [{
          data: [summary.clean_trips, summary.suspicious_trips],
          backgroundColor: ["rgba(199, 104, 8, 0.6)", "rgba(199, 104, 8, 0.3)"],
          borderColor: ["rgb(199, 104, 8)", "rgb(199, 104, 8)"],
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

    // Suspicious table
    const tableBody = document.getElementById("suspiciousTableBody");
    tableBody.innerHTML = "";
    const rows = suspiciousData.suspicious_trips || [];
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.trip_id}</td>
        <td>${r.pickup_datetime}</td>
        <td>${(r.trip_speed_kmh ?? 0).toFixed(2)}</td>
        <td>${(r.distance_km ?? 0).toFixed(2)}</td>
        <td>${r.suspicious_reason || ''}</td>
      `;
      tableBody.appendChild(tr);
    });

    // Suspicious analysis chart: count by reason
    const reasonCounts = {};
    rows.forEach(r => {
      const key = r.suspicious_reason || 'Unknown';
      reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    });
    const suspAnaCtx = document.getElementById("suspiciousAnalysisChart").getContext("2d");
    if (window._suspiciousAnalysisChart) { window._suspiciousAnalysisChart.destroy(); }
    window._suspiciousAnalysisChart = new Chart(suspAnaCtx, {
      type: "bar",
      data: {
        labels: Object.keys(reasonCounts),
        datasets: [{
          label: "Count",
          data: Object.values(reasonCounts),
          backgroundColor: "rgba(201, 203, 207, 0.6)",
          borderColor: "rgb(201, 203, 207)",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Count" } },
          x: { title: { display: true, text: "Reason" } }
        },
        plugins: { legend: { display: false } }
      }
    });

  } catch (error) {
    console.error("Error loading data quality data:", error);
  }
}

// Initialize dashboard on load
loadDashboard();