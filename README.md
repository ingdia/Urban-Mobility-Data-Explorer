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


