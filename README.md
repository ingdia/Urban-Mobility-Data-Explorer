# NYC TAXI BACKEND - QUICK START GUIDE

## Step-by-Step Setup Instructions

### STEP 1: Download the ZIP File from github to have the project on your local machine
Extract all files to a folder on your computer.

### STEP 2: Install Python Libraries
Open terminal/command prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- geopy (GPS distance calculator)

### STEP 3: Add Your Dataset ( Only if you don't have it)
- Download the NYC Taxi `train.csv` file
- Place it in the `data/` folder
- The file should be named exactly: `train.csv`

### STEP 4: Create Database
Run this command to create the database structure:
```bash
python database/schema.py
```

You should see:
 Tables created successfully
 Indexes created successfully

### STEP 5: Process the Data
Run this command to clean the CSV data:
```bash
python scripts/data_processor.py
```

This will:
- Remove missing values
- Remove duplicates
- Filter invalid records
- Create derived features (distance, speed, fare/km)
- Generate logs in `logs/` folder
- Save cleaned data to `data/train_clean.csv`

### STEP 6: Load Data into Database
Run this command to populate the database:
```bash
python scripts/data_loader.py
```

This will:
- Insert vendors
- Insert locations
- Insert trips and metrics
- May take several minutes depending on dataset size

### STEP 7: Test the Database
Run this command to verify if everything works:
```bash
python scripts/test_queries.py
```

You should see various statistics and query results.

### STEP 8: Start the API Server
Run this command to start the Flask API:
```bash
python app.py
```

Visit: http://127.0.0.1:5000/

## API Endpoints to Test

Open your browser and try these URLs:

### BASIC QUERIES
1. API Documentation (Lists all endpoints):
   http://127.0.0.1:5000/

2. Get trips (with pagination):
   http://127.0.0.1:5000/api/trips?limit=10

3. Get total trip count:
   http://127.0.0.1:5000/api/trips/count

### SUMMARY & KPIs
4. Overall summary statistics:
   http://127.0.0.1:5000/api/stats/summary

5. Vendor comparison:
   http://127.0.0.1:5000/api/stats/vendors

### TIME PATTERNS
6. Trips by hour of day:
   http://127.0.0.1:5000/api/stats/hourly

7. Trips by day of week:
   http://127.0.0.1:5000/api/stats/daily-patterns

8. Monthly trends over time:
   http://127.0.0.1:5000/api/stats/monthly-trends

9. Rush hour analysis (traffic patterns):
   http://127.0.0.1:5000/api/stats/rush-hour

### DISTRIBUTIONS
10. Trip duration distribution:
    http://127.0.0.1:5000/api/stats/duration-distribution

11. Trip distance distribution:
    http://127.0.0.1:5000/api/stats/distance-distribution

12. Trip speed distribution:
    http://127.0.0.1:5000/api/stats/speed-distribution

13. Passenger count distribution:
    http://127.0.0.1:5000/api/stats/passenger-distribution

### LOCATION ANALYSIS
14. Trips by borough:
    http://127.0.0.1:5000/api/boroughs

15. Top 20 pickup locations:
    http://127.0.0.1:5000/api/stats/top-locations

### DATA QUALITY
16. Suspicious trips:
    http://127.0.0.1:5000/api/suspicious

17. Trip efficiency analysis (distance vs duration):
    http://127.0.0.1:5000/api/stats/efficiency

## What Each Endpoint Provides

**For Frontend Dashboard, Use These:**

- **/api/stats/summary** → KPI cards (total trips, averages, date range)
- **/api/stats/hourly** → Line chart showing 24-hour pattern
- **/api/stats/daily-patterns** → Bar chart showing busiest days
- **/api/stats/monthly-trends** → Line chart showing trends over time
- **/api/stats/vendors** → Pie/bar chart comparing vendors
- **/api/stats/duration-distribution** → Histogram of trip lengths
- **/api/stats/distance-distribution** → Histogram of trip distances
- **/api/stats/speed-distribution** → Histogram of trip speeds
- **/api/stats/passenger-distribution** → Pie chart of passengers per trip
- **/api/stats/rush-hour** → Line chart showing traffic by hour
- **/api/boroughs** → Bar chart of trips by location
- **/api/stats/top-locations** → Map markers or table
- **/api/suspicious** → Table of data quality issues
- **/api/stats/efficiency** → Scatter plot (distance vs duration)

## Troubleshooting

### Error: "Module not found"
Solution: Install requirements again
```bash
pip install -r requirements.txt
```

### Error: "train.csv not found"
Solution: Make sure train.csv is in the data/ folder

### Error: "Database not found"
Solution: Run schema.py first
```bash
python database/schema.py
```

### Error: "Clean data not found"
Solution: Run data_processor.py first
```bash
python scripts/data_processor.py
```

## File Structure Overview

```
nyc-taxi-backend/
│
├── data/                      # Your CSV files go here
│   └── train.csv              # Place your dataset here
│
├── database/                  # Database files
│   └── schema.py              # Creates database structure
│
├── scripts/                   # Processing scripts
│   ├── data_processor.py      # Cleans CSV data
│   ├── data_loader.py         # Loads data into DB
│   └── test_queries.py        # Tests database
│
├── logs/                      # Auto-generated logs
│
├── app.py                     # Flask API server
├── requirements.txt           # Python dependencies
└── README.md                  # Full documentation
```

## What Each Script Does

### database/schema.py
- Creates 4 tables: vendors, locations, trips, trip_metrics
- Adds 5 indexes for fast queries
- Sets up foreign key relationships

### scripts/data_processor.py
- Reads train.csv
- Removes missing values (critical columns)
- Removes duplicates
- Filters invalid coordinates (outside NYC)
- Removes outliers (trips too short/long)
- Normalizes timestamps
- Calculates distance, speed, fare per km
- Flags suspicious trips
- Saves to train_clean.csv

### scripts/data_loader.py
- Loads cleaned data into SQLite database
- Inserts vendors (2 taxi companies)
- Extracts unique locations
- Classifies into boroughs (Manhattan, Brooklyn, etc.)
- Inserts all trips with metrics

### scripts/test_queries.py
- Tests database with sample queries
- Shows statistics by vendor
- Shows peak hours
- Shows suspicious trips
- Verifies indexes are working

### app.py
- Starts Flask web server
- Provides REST API endpoints
- Returns data in JSON format
- Allows filtering by vendor, date, etc.


## Need Help?

1. Read README.md for detailed documentation
2. Check error messages carefully
3. Make sure you followed steps in order
4. Verify train.csv is in the correct location

## Next Steps (Frontend)


# NYC Taxi Trip Analysis - Backend

Full data processing and database system for NYC taxi trip dataset.

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Place Your Data
- Download `train.csv` from the NYC Taxi dataset
- Place it in the `data/` folder

### 3. Create Database Schema
```bash
python database/schema.py
```

### 4. Process Data
```bash
python scripts/data_processor.py
```
This will:
- Clean the raw CSV data
- Handle missing values and outliers
- Create derived features
- Save to `data/train_clean.csv`
- Generate logs in `logs/` folder

### 5. Load Data into Database
```bash
python scripts/data_loader.py
```

### 6. Test Database
```bash
python scripts/test_queries.py
```

### 7. Start API Server
```bash
python app.py
```
Visit: http://127.0.0.1:5000/

## API Endpoints

- `GET /api/trips` - Get trips (with filters)
- `GET /api/stats/vendors` - Vendor statistics
- `GET /api/stats/hourly` - Hourly trip distribution
- `GET /api/suspicious` - Suspicious trips
- `GET /api/boroughs` - Trips by borough

## Project Structure

```
├── data/
│   ├── train.csv              # Raw dataset (you provide)
│   └── train_clean.csv        # Cleaned dataset (generated)
├── database/
│   ├── schema.py              # Database structure
│   └── nyc_taxi.db           # SQLite database (generated)
├── scripts/
│   ├── data_processor.py      # Data cleaning pipeline
│   ├── data_loader.py         # Load data into DB
│   └── test_queries.py        # Test database queries
├── logs/
│   ├── cleaning.log           # Processing log (generated)
│   └── exclusions.json        # Removed records report (generated)
├── app.py                     # Flask API server
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Features Implemented

### Data Processing
Handle missing values
Remove duplicates
Filter invalid records
Remove outliers
Normalize timestamps
Create derived features (distance, speed, fare/km)
Flag suspicious records
Comprehensive logging

### Database Design
Normalized schema (3NF)
Foreign key relationships
Data integrity constraints
Efficient indexing
4 tables (vendors, locations, trips, trip_metrics)

### API
RESTful endpoints
Query filtering
Statistical aggregations
JSON responses

## Libraries Used

- **Flask** - Web framework for API
- **geopy** - Calculate GPS distances
- **csv** (built-in) - Read/write CSV files
- **sqlite3** (built-in) - Database operations
- **json** (built-in) - Save reports
- **logging** (built-in) - Track processing steps

## Assignment Requirements Checklist

### Task 1: Data Processing and Cleaning
- Load raw NYC dataset (CSV)
- Handle missing values
- Remove duplicates
- Filter invalid records
- Remove outliers
- Normalize timestamps
- Format coordinates
- Define 3 derived features:
  - Distance (km)
  - Speed (km/h)
  - Fare per km
- Log excluded records

### Task 2: Database Design and Implementation
- Normalized relational schema (3NF)
- Appropriate indexing (5 indexes)
- Implemented in SQLite
- Scripts to insert cleaned data
- Data integrity constraints
- Efficient queries

## Notes

- Uses only Python's built-in CSV library
- All codes written are heavily commented for easy understanding
- Follows best practices for data processing
- Production-ready with error handling and logging


