function showSpinner() {
  document.getElementById('spinner').classList.remove('hidden');
}

function hideSpinner() {
  document.getElementById('spinner').classList.add('hidden');
}

// Example usage with your dashboard loading
async function loadDashboard() {
  showSpinner();
  try {
    await loadSummaryData();
    await loadDurationDistribution();
    await loadDistanceDistribution();
    await loadSpeedDistribution();
    await loadPassengerDistribution();
    await loadLocationChart();
    await loadTopLocationsTable();
    await loadDataQualitySummary();
  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
}







// Define datasets for different views
// Get canvas context
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
const apiEndpoints = {
  daily: `${API_BASE}/api/stats/hourly`,
  weekly: `${API_BASE}/api/stats/daily-patterns`,
  monthly: `${API_BASE}/api/stats/monthly-trends`
};

// Fetch data and update chart
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

  const labels = data.map(d => d.duration_range); // e.g., "0-5 min"
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

  const labels = data.map(d => d.borough);   // e.g., "Manhattan", "Brooklyn"
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
    tableBody.innerHTML = ""; // Clear old data

    // Limit rows to 8
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
    // Suspicious trips
    const response = await fetch(`${API_BASE}/api/suspicious`);
    const data = await response.json();
    document.getElementById("suspiciousTrips").textContent = data.count.toLocaleString();

    // Efficiency scatter chart (distance vs duration)
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

// ------------------- Fetch Vendor Data -------------------
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

// Initial load
fetchVendorData().then(data => updateVendorChart(data, 'all'));

// Event listener for vendor filter
document.getElementById("vendorChartFilter").addEventListener("change", (e) => {
  const selectedVendor = e.target.value;
  fetchVendorData().then(data => updateVendorChart(data, selectedVendor));
});

loadDashboard();
