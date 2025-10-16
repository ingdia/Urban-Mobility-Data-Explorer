async function loadSummaryData() {
  try {
    // Replace with your Flask backend URL if different
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

loadSummaryData();


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

loadSummaryData();

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
async function updateChart(view) {
  const response = await fetch(apiEndpoints[view]);
  const data = await response.json();

  let labels = [];
  let counts = [];

  if (view === "daily") {
    labels = data.map(d => d.hour + "h");
    counts = data.map(d => d.trip_count);
  } else if (view === "weekly") {
    labels = data.map(d => d.day_name);
    counts = data.map(d => d.trip_count);
  } else if (view === "monthly") {
    labels = data.map(d => d.month);
    counts = data.map(d => d.trip_count);
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = counts;
  chart.config.type = view === "daily" || view === "monthly" ? "bar" : "line";

  chart.update();
}

// Initial load
updateChart("daily");

// Event listener for dropdown
document.getElementById("tripFilter").addEventListener("change", e => {
  updateChart(e.target.value);
});


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

loadDurationDistribution();
loadLocationChart();