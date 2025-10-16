# Urban Mobility Data Explorer 

A comprehensive data analytics platform for exploring NYC taxi trip data, featuring interactive visualizations, real-time insights, and advanced data quality analysis.

## Table of Contents

- [Project Overview](#project-overview)
- [Team Members](#team-members)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Backend Components](#backend-components)
- [Frontend Components](#frontend-components)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Data Processing Pipeline](#data-processing-pipeline)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)



##  Project Overview

The Urban Mobility Data Explorer is a full-stack web application designed to analyze and visualize NYC taxi trip data. The platform provides comprehensive insights into transportation patterns, traffic analysis, location-based trends, and data quality metrics through an intuitive dashboard interface.

### Key Capabilities
- *Real-time Data Processing*: Efficient handling of large-scale taxi trip datasets
- *Interactive Visualizations*: Dynamic charts and graphs for data exploration
- *Multi-dimensional Analysis*: Time-based, location-based, and statistical analysis
- *Data Quality Assessment*: Automated detection of suspicious or anomalous trip records
- *Responsive Design*: Optimized for desktop, tablet, and mobile devices

##  Team Members

### Backend Engineers
- *Data Processing & ETL Pipeline*: Responsible for data ingestion, cleaning, transformation, and loading processes using Python's built-in libraries (csv, sqlite3)
- *API Development*: Designed and implemented RESTful endpoints for data access and analytics using Flask framework
- *Database Management*: Optimized SQLite database schema and query performance with proper indexing
- *Data Quality Framework*: Developed algorithms for detecting suspicious trip patterns and anomaly detection

### System Architecture
- *Infrastructure Design*: Planned scalable system architecture and data flow patterns
- *Performance Optimization*: Implemented caching strategies and query optimization for large datasets
- *Security Implementation*: Ensured data privacy and API security measures with CORS support
- *Integration Management*: Coordinated frontend-backend communication protocols and error handling

### Frontend Developer
- *User Interface Design*: Created intuitive and responsive dashboard layouts using HTML5, CSS3, and vanilla JavaScript
- *Data Visualization*: Implemented interactive charts using Chart.js with theme-consistent styling
- *User Experience*: Designed smooth navigation and data interaction patterns with loading states
- *Responsive Implementation*: Ensured cross-device compatibility and accessibility for mobile, tablet, and desktop

## Project Structure


Urban-Mobility-Data-Explorer/
├── 📄 app.py                          # Flask API server (main backend)
├── 📄 requirements.txt                # Python dependencies
├── 📄 README.md                       # Project documentation
│
├── 📁 data/                          # Raw and processed datasets
│   ├── 📄 README.md                  # Data documentation
│   ├── 📄 train.csv                  # Original NYC taxi dataset
│   └── 📄 train_clean.csv           # Processed/cleaned dataset
│
├── 📁 database/                      # Database management
│   ├── 📄 schema.py                  # Database schema creation
│   └── 📄 nyc_taxi.db               # SQLite database file
│
├── 📁 scripts/                       # Data processing scripts
│   ├── 📄 data_processor.py          # Data cleaning and transformation
│   ├── 📄 data_loader.py            # Database loading utilities
│   └── 📄 test_queries.py           # Database testing queries
│
├── 📁 frontend/                      # Web application frontend
│   ├── 📄 index.html                # Main HTML structure
│   ├── 📄 styles.css                # CSS styling and responsive design
│   ├── 📄 app.js                    # JavaScript functionality and API integration
│   └── 📁 images/                   # Static assets
│       └── 📄 image.png             # Logo and icons
│
└── 📁 logs/                          # Processing logs and reports
    ├── 📄 README.md                 # Logging documentation
    ├── 📄 cleaning.log              # Data processing logs
    └── 📄 exclusions.json           # Data exclusion report


## 🏗 System Architecture


┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (HTML/CSS/JS) │◄──►│   (Flask)       │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST Endpoints│    │ • Trips Table   │
│ • Visualizations│    │ • Data Processing│    │ • Metrics Table │
│ • Responsive UI │    │ • CORS Support  │    │ • Locations     │
└─────────────────┘    └─────────────────┘    └─────────────────┘


### Data Flow
1. *Data Ingestion*: Raw CSV data processed through ETL pipeline
2. *Data Storage*: Structured data stored in normalized SQLite database
3. *API Layer*: Flask REST API provides data access endpoints
4. *Frontend*: React-like vanilla JS dashboard consumes API data
5. *Visualization*: Chart.js renders interactive data visualizations

## ✨ Features

### 📊 Dashboard Overview
- *Key Performance Indicators*: Total trips, average duration, distance, and speed
- *Interactive Charts*: Hourly, daily, weekly, and monthly trip patterns
- *Distribution Analysis*: Duration, distance, speed, and passenger count distributions
- *Location Insights*: Borough-wise trip analysis and top pickup locations
- *Vendor Performance*: Comparative analysis of taxi service providers

### ⏰ Time Analysis
- *Peak Hour Detection*: Identifies busiest hours and traffic patterns
- *Rush Hour Analysis*: Average speed analysis during peak traffic times
- *Temporal Patterns*: Day-of-week and seasonal trend analysis
- *Interactive Filtering*: Real-time data filtering by time periods and vendors

### 📈 Trip Statistics
- *Statistical Summaries*: Maximum distance, duration, and passenger patterns
- *Comparative Analysis*: Vendor performance metrics and daily patterns
- *Distribution Visualization*: Comprehensive statistical breakdowns
- *Trend Analysis*: Historical data trends and patterns

### 🗺 Location Insights
- *Geographic Analysis*: Borough-wise trip distribution and patterns
- *Hotspot Identification*: Most popular pickup and dropoff locations
- *Spatial Trends*: Geographic concentration of taxi services
- *Location Performance*: Trip volume and efficiency by area

### 🔍 Data Quality
- *Anomaly Detection*: Automated identification of suspicious trip records
- *Data Completeness*: Assessment of missing or incomplete data fields
- *Quality Metrics*: Comprehensive data quality scoring and reporting
- *Flagged Records*: Detailed analysis of problematic data entries

## 🛠 Technology Stack

### Backend Technologies
- *Python 3.8+*: Core programming language
- *Flask 3.0.0*: Web framework for REST API development
- *SQLite*: Lightweight, serverless database for data storage
- *Geopy 2.4.0*: Geographic distance calculations between GPS coordinates
- *Python Built-in Libraries*:
  - csv: CSV file reading and writing
  - sqlite3: Database operations
  - json: JSON data handling
  - logging: Logging and error tracking
  - datetime: Date and time operations
  - statistics: Statistical calculations
  - os: Operating system interface

### Frontend Technologies
- *HTML5*: Semantic markup structure with modern elements
- *CSS3*: Responsive styling, animations, and grid layouts
- *Vanilla JavaScript (ES6+)*: Interactive functionality without frameworks
- *Chart.js*: Professional data visualization library
- *Font Awesome*: Comprehensive icon library
- *Google Fonts (Poppins)*: Typography and design consistency

### Development & Deployment
- *Git*: Version control and collaboration
- *VS Code*: Integrated development environment
- *Chrome DevTools*: Debugging and performance analysis
- *Python HTTP Server*: Local development server
- *CORS*: Cross-origin resource sharing for API access

## 🚀 Installation & Setup

### Prerequisites
- *Python 3.8 or higher* (Download from [python.org](https://python.org))
- *pip* (Python package manager - usually included with Python)
- *Modern web browser* (Chrome, Firefox, Safari, Edge)
- *Git* (for cloning the repository)

### Step-by-Step Setup

#### 1. Clone the Repository
bash
git clone https://github.com/your-username/Urban-Mobility-Data-Explorer.git
cd Urban-Mobility-Data-Explorer


#### 2. Install Python Dependencies
bash
pip install -r requirements.txt


This installs:
- flask==3.0.0 - Web framework for API
- geopy==2.4.0 - Geographic distance calculations

#### 3. Database Setup
Create the database schema and tables:
bash
python database/schema.py


This creates:
- SQLite database file (database/nyc_taxi.db)
- All required tables with relationships
- Performance indexes for faster queries

#### 4. Data Processing Pipeline
Process the raw NYC taxi data:

*Step 4a: Clean and Transform Data*
bash
python scripts/data_processor.py


This script:
- Loads raw CSV data from data/train.csv
- Removes missing values, duplicates, and invalid records
- Calculates distances using GPS coordinates
- Computes trip speeds and flags suspicious records
- Saves cleaned data to data/train_clean.csv
- Generates processing logs in logs/cleaning.log

*Step 4b: Load Data into Database*
bash
python scripts/data_loader.py


This script:
- Loads vendor master data
- Extracts and loads unique locations with borough classification
- Inserts trip records and calculated metrics
- Builds location cache for performance

#### 5. Start the Backend API Server
bash
python app.py


The Flask API will start at http://127.0.0.1:5000

You should see:

Starting Flask API server...
   API docs available at: http://127.0.0.1:5000/

 Available endpoint categories:
   - Basic Queries (trips, counts)
   - Statistics (summary, vendors, time patterns)
   - Distributions (duration, distance, speed, passengers)
   - Location Analysis (boroughs, top locations)
   - Data Quality (suspicious trips, efficiency)


#### 6. Launch the Frontend
Open a new terminal and navigate to the frontend directory:

*Option A: Direct File Opening*
bash
cd frontend
# Open index.html in your web browser


*Option B: Local Web Server (Recommended)*
bash
cd frontend
python -m http.server 8000


Then open http://localhost:8000 in your browser.

### Verification Steps

1. *Backend API Test*: Visit http://127.0.0.1:5000/ to see API documentation
2. *Frontend Test*: Open the dashboard and verify all tabs load data
3. *Database Test*: Run python scripts/test_queries.py to verify data integrity

### Quick Start (All-in-One)
For a complete setup in one go:
bash
# Clone and install
git clone https://github.com/ingdia/Urban-Mobility-Data-Explorer.git
cd Urban-Mobility-Data-Explorer
pip install -r requirements.txt

# Setup database and data
python database/schema.py
python scripts/data_processor.py
python scripts/data_loader.py

# Start backend (Terminal 1)
python app.py

# Start frontend (Terminal 2)
cd frontend && python -m http.server 8000


## 🔧 Backend Components

### Flask API Server (app.py)
The main backend application providing REST endpoints for data access:

*Key Features:*
- *CORS Support*: Enables cross-origin requests from frontend
- *Database Connection Management*: Efficient SQLite connection handling
- *Error Handling*: Graceful error responses and logging
- *Response Formatting*: Consistent JSON response structure

*Core Functions:*
- get_db(): Creates database connection with row factory
- Route handlers for all API endpoints
- Data validation and sanitization
- Query optimization with proper indexing

### Database Schema (database/schema.py)
Manages database structure and relationships:

*Tables Created:*
- vendors: Taxi company information
- locations: GPS coordinates with borough classification
- trips: Main trip records with foreign key relationships
- trip_metrics: Calculated features (distance, speed, suspicious flags)

*Performance Optimizations:*
- Foreign key constraints enabled
- Strategic indexes on frequently queried columns
- Unique constraints to prevent duplicates

### Data Processing (scripts/data_processor.py)
Comprehensive ETL pipeline for data cleaning:

*Processing Steps:*
1. *Data Loading*: CSV file reading with error handling
2. *Missing Value Handling*: Critical field validation and median imputation
3. *Duplicate Removal*: Hash-based duplicate detection
4. *Invalid Record Filtering*: Geographic and logical validation
5. *Outlier Detection*: Statistical outlier removal
6. *Timestamp Normalization*: Date parsing and feature extraction
7. *Derived Features*: Distance calculation, speed computation
8. *Suspicious Flagging*: Anomaly detection without data loss

*Quality Assurance:*
- Detailed logging to logs/cleaning.log
- Exclusion report in logs/exclusions.json
- Processing summary with statistics

### Data Loading (scripts/data_loader.py)
Efficient database population with normalization:

*Loading Process:*
1. *Vendor Master Data*: Static vendor information
2. *Location Extraction*: Unique coordinate identification
3. *Borough Classification*: Geographic boundary mapping
4. *Batch Processing*: Memory-efficient bulk inserts
5. *Cache Building*: Location ID lookup optimization

*Performance Features:*
- Batch processing (1000 records per batch)
- Location caching for fast lookups
- Progress tracking for large datasets
- Error handling for malformed records

## Frontend Components

### HTML Structure (frontend/index.html)
Semantic markup with modern HTML5 features:

*Structure:*
- *Header*: Logo, navigation, and branding
- *Main Content*: Tabbed interface with sections
- *Footer*: Copyright and attribution
- *Loading States*: Spinner overlay for user feedback

*Sections:*
- Overview: Dashboard summary and KPIs
- Time Analysis: Temporal patterns and rush hour analysis
- Trip Statistics: Statistical distributions and comparisons
- Location Insights: Geographic analysis and hotspots
- Data Quality: Anomaly detection and completeness metrics

### CSS Styling (frontend/styles.css)
Responsive design with modern CSS features:

*Design System:*
- *Color Palette*: Brand orange (rgb(199, 104, 8)) with variations
- *Typography*: Poppins font family for consistency
- *Layout*: CSS Grid and Flexbox for responsive design
- *Animations*: Smooth transitions and hover effects

*Responsive Breakpoints:*
- Desktop: Full layout with side-by-side charts
- Tablet (768px): Stacked layout with adjusted spacing
- Mobile (480px): Single-column layout with touch-friendly controls

*Component Styles:*
- Cards: Shadow effects with hover animations
- Charts: Consistent sizing and responsive behavior
- Tables: Zebra striping and hover effects
- Forms: Styled inputs and buttons with focus states

### JavaScript Functionality (frontend/app.js)
Interactive features and API integration:

*Core Features:*
- *Tab Navigation*: Smooth section switching with data loading
- *API Integration*: Fetch calls to Flask backend endpoints
- *Chart Rendering*: Chart.js integration with theme colors
- *Data Caching*: Client-side caching for performance
- *Error Handling*: Graceful error management and user feedback

*Chart Management:*
- Dynamic chart creation and destruction
- Theme-consistent color schemes
- Responsive chart resizing
- Interactive tooltips and legends

*Data Loading Patterns:*
- Lazy loading: Data fetched only when tabs are accessed
- Parallel requests: Multiple API calls for efficiency
- Loading states: Visual feedback during data fetching
- Error recovery: Fallback handling for failed requests

##  Data Processing Pipeline

### Overview
The data processing pipeline transforms raw NYC taxi data into a clean, normalized database suitable for analytics and visualization.

### Pipeline Stages

#### Stage 1: Data Ingestion
*Input*: data/train.csv (Raw NYC taxi dataset)
*Process*: CSV file reading with error handling
*Output*: In-memory data structure with validation

#### Stage 2: Data Cleaning
*Processes*:
1. *Missing Value Handling*: Remove records with critical missing fields
2. *Duplicate Detection*: Hash-based duplicate identification and removal
3. *Invalid Record Filtering*: Geographic boundary validation (NYC area)
4. *Outlier Removal*: Statistical outlier detection (duration limits)

#### Stage 3: Feature Engineering
*New Features Created*:
- distance_km: Haversine distance calculation between GPS points
- trip_speed_kmh: Calculated speed based on distance and duration
- fare_per_km: Fare efficiency metric (if fare data available)
- pickup_hour, pickup_day, pickup_weekday: Temporal features

#### Stage 4: Quality Assessment
*Suspicious Record Detection*:
- Speed > 80 km/h (unrealistic for NYC traffic)
- Speed < 5 km/h (possible data error)
- Distance < 0.1 km (very short trips)

#### Stage 5: Data Normalization
*Database Structure*:
- *Vendors Table*: Master data for taxi companies
- *Locations Table*: Unique GPS coordinates with borough classification
- *Trips Table*: Main trip records with foreign key relationships
- *Trip Metrics Table*: Calculated features and quality flags

### Data Flow Diagram

Raw CSV → Data Cleaning → Feature Engineering → Quality Assessment → Database Loading
   ↓           ↓              ↓                    ↓                    ↓
train.csv → train_clean.csv → Enhanced Data → Suspicious Flags → SQLite DB


### Performance Metrics
- *Processing Speed*: ~1000 records per second
- *Memory Usage*: Optimized for large datasets
- *Error Handling*: Graceful handling of malformed records
- *Logging*: Comprehensive audit trail

##  Troubleshooting

### Common Issues and Solutions

#### Backend Issues

*Problem*: ModuleNotFoundError: No module named 'flask'
bash
# Solution: Install dependencies
pip install -r requirements.txt


*Problem*: sqlite3.OperationalError: no such table
bash
# Solution: Create database schema first
python database/schema.py


*Problem*: FileNotFoundError: data/train.csv
bash
# Solution: Ensure data file exists
ls data/
# If missing, download the NYC taxi dataset


*Problem*: API returns empty data
bash
# Solution: Check if data was loaded
python scripts/test_queries.py
# If empty, run data loading
python scripts/data_loader.py


#### Frontend Issues

*Problem*: Charts not loading
- *Check*: Browser console for JavaScript errors
- *Solution*: Ensure Flask API is running on port 5000
- *Verify*: CORS is enabled in Flask app

*Problem*: Data not displaying
- *Check*: Network tab in browser DevTools
- *Solution*: Verify API endpoints are responding
- *Test*: Visit http://127.0.0.1:5000/ directly

*Problem*: Responsive design issues
- *Check*: CSS media queries are working
- *Solution*: Clear browser cache and reload
- *Verify*: Viewport meta tag is present

#### Database Issues

*Problem*: Slow query performance
bash
# Solution: Recreate indexes
python database/schema.py


*Problem*: Database locked errors
bash
# Solution: Close all connections and restart
# Check for running Python processes
ps aux | grep python


*Problem*: Foreign key constraint errors
bash
# Solution: Load data in correct order
python scripts/data_loader.py


### Performance Optimization

#### Backend Optimization
- *Database Indexing*: Ensure all indexes are created
- *Query Optimization*: Use EXPLAIN QUERY PLAN for slow queries
- *Connection Pooling*: Implement for production use
- *Caching*: Add Redis for frequently accessed data

#### Frontend Optimization
- *Chart Performance*: Limit data points for large datasets
- *Lazy Loading*: Load data only when tabs are accessed
- *Caching*: Implement client-side caching for API responses
- *Compression*: Enable gzip compression for static assets

### Debugging Tools

#### Backend Debugging
bash
# Enable Flask debug mode
export FLASK_DEBUG=1
python app.py

# Check database contents
sqlite3 database/nyc_taxi.db
.tables
SELECT COUNT(*) FROM trips;


#### Frontend Debugging
javascript
// Enable console logging
console.log('API Response:', data);

// Check API connectivity
fetch('http://127.0.0.1:5000/api/stats/summary')
  .then(response => response.json())
  .then(data => console.log(data));


### Log Analysis

#### Processing Logs
bash
# View data processing logs
tail -f logs/cleaning.log

# Check exclusion report
cat logs/exclusions.json


#### Error Patterns
- *Memory Issues*: Reduce batch size in data_loader.py
- *Timeout Issues*: Increase timeout values
- *Permission Issues*: Check file permissions

##  API Documentation

### Base URL

http://127.0.0.1:5000


### Endpoints

#### Basic Queries
- GET /api/trips - Retrieve paginated trip data
- GET /api/trips/count - Get total trip count

#### Statistics
- GET /api/stats/summary - Overall KPIs and summary statistics
- GET /api/stats/vendors - Vendor comparison metrics
- GET /api/stats/hourly - Trips by hour of day
- GET /api/stats/daily-patterns - Trips by day of week
- GET /api/stats/monthly-trends - Trips over time
- GET /api/stats/rush-hour - Rush hour analysis

#### Distributions
- GET /api/stats/duration-distribution - Trip duration ranges
- GET /api/stats/distance-distribution - Trip distance ranges
- GET /api/stats/speed-distribution - Trip speed ranges
- GET /api/stats/passenger-distribution - Passenger count distribution

#### Location Analysis
- GET /api/boroughs - Trips by NYC borough
- GET /api/stats/top-locations - Most popular pickup locations

#### Data Quality
- GET /api/suspicious - Flagged suspicious trips
- GET /api/stats/efficiency - Distance vs duration analysis

### Example API Response
json
{
  "total_trips": 1000000,
  "suspicious_trips": 5000,
  "clean_trips": 995000,
  "avg_duration_minutes": 15.5,
  "avg_distance_km": 3.2,
  "avg_speed_kmh": 12.4,
  "max_distance_km": 45.6,
  "max_duration_minutes": 120.0
}


##  Frontend Guide

### Component Structure

frontend/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── app.js             # JavaScript functionality and API integration
└── images/            # Static assets
    └── image.png      # Logo and icons


### Key Features

#### Responsive Design
- *Mobile-first approach*: Optimized for all screen sizes
- *Flexible grid system*: Adaptive layout for different devices
- *Touch-friendly interface*: Optimized for mobile interactions

#### Interactive Elements
- *Tab navigation*: Smooth transitions between analysis sections
- *Dynamic filtering*: Real-time data filtering and visualization updates
- *Loading states*: User feedback during data processing
- *Error handling*: Graceful error management and user notifications

#### Data Visualization
- *Chart.js integration*: Professional-grade chart rendering
- *Theme consistency*: Brand-aligned color schemes and styling
- *Interactive tooltips*: Detailed data information on hover
- *Responsive charts*: Automatic resizing for different screen sizes

##  Database Schema

### Tables

#### trips
- trip_id (INTEGER, PRIMARY KEY)
- vendor_id (INTEGER, FOREIGN KEY)
- pickup_datetime (TEXT)
- dropoff_datetime (TEXT)
- passenger_count (INTEGER)
- trip_duration (INTEGER)
- pickup_location_id (INTEGER, FOREIGN KEY)
- dropoff_location_id (INTEGER, FOREIGN KEY)

#### trip_metrics
- trip_id (INTEGER, PRIMARY KEY)
- distance_km (REAL)
- trip_speed_kmh (REAL)
- is_suspicious (INTEGER)
- suspicious_reason (TEXT)

#### locations
- location_id (INTEGER, PRIMARY KEY)
- latitude (REAL)
- longitude (REAL)
- borough (TEXT)

#### vendors
- vendor_id (INTEGER, PRIMARY KEY)
- vendor_name (TEXT)
- created_at (TEXT)

### Relationships
- Trips → Vendors (Many-to-One)
- Trips → Locations (Many-to-One for pickup/dropoff)
- Trips → Trip Metrics (One-to-One)

### Indexes
- idx_pickup_datetime: Optimizes time-based queries
- idx_vendor: Speeds up vendor filtering
- idx_pickup_location: Accelerates location queries
- idx_suspicious: Fast suspicious record lookups
- idx_speed: Optimizes speed-based analysis

##  Usage Examples

### Analyzing Peak Hours
1. Navigate to the "Time Analysis" tab
2. View the hourly trip distribution chart
3. Identify peak hours (typically 8-9 AM and 5-6 PM)
4. Analyze rush hour speed patterns

### Exploring Location Patterns
1. Go to "Location Insights" tab
2. Examine borough-wise trip distribution
3. Identify top pickup locations
4. Analyze geographic concentration patterns

### Assessing Data Quality
1. Access the "Data Quality" tab
2. Review suspicious trip flags
3. Examine data completeness metrics
4. Investigate flagged records for anomalies


### Code Standards
- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add comments for complex logic
- Write comprehensive docstrings
- Ensure responsive design principles

### Testing
- Test all API endpoints
- Verify frontend functionality across browsers
- Check responsive design on different devices
- Validate data accuracy and performance



##  Acknowledgments

- NYC Taxi & Limousine Commission for providing the dataset
- Chart.js community for excellent visualization tools
- Flask community for the robust web framework
- All contributors and team members for their dedication

---

*Contact Information*
- Project Repository: [[GitHub Repository URL](https://github.com/ingdia/Urban-Mobility-Data-Explorer)]
