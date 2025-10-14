"""
Data Processing and Cleaning Pipeline
by using only Python's built-in CSV library
"""

import csv  # for reading/writing CSV files (train.csv in this case)
import logging  # For logging messages ( storing logs in our case)
import json  # Built-in library to save reports in json format to be specific
from datetime import datetime  # Built-in library for dates
from statistics import median  # Built-in library for math operations
from geopy.distance import geodesic  #  External library (for GPS distance)
import os

class DataProcessor:
    """Cleans and enriches raw taxi trip data"""
    
    def __init__(self, csv_path='data/train.csv'):
        """
        Initialize processor with data path
        Args:
            csv_path: Path to raw CSV file
        """
        self.csv_path = csv_path
        self.data = []  # List to hold all rows as dictionaries
        self.clean_data = []  # List to hold cleaned rows
        
        # Track what we remove for transparency
        self.exclusion_log = {
            'original_count': 0,
            'steps': [],
            'suspicious_records': []
        }
        
        # Setup logging to file
        os.makedirs('logs', exist_ok=True)
        logging.basicConfig(
            filename='logs/cleaning.log',
            level=logging.INFO,
            format='%(asctime)s - %(message)s'
        )
        
    def load_data(self):
        """Load CSV file into memory using Python's csv library"""
        
        print("Loading CSV data...")
        logging.info("Loading data from CSV")
        
        # Open CSV file and read all rows
        with open(self.csv_path, 'r', encoding='utf-8') as file:
            # DictReader reads CSV and converts each row to a dictionary
            # Example: {'id': '123', 'vendor_id': '2', 'pickup_datetime': '2016-01-01 00:00:00'}
            reader = csv.DictReader(file)
            
            # Store all rows in memory
            self.data = list(reader)
            self.clean_data = self.data.copy()  # Make a working copy
        
        self.exclusion_log['original_count'] = len(self.data)
        
        print(f"Loaded {len(self.data)} records")
        print(f"   Columns: {list(self.data[0].keys())}")
        
        logging.info(f"Loaded {len(self.data)} records")
        return self
    
    def handle_missing_values(self):
        """Remove or fill missing data"""
        
        print("\nHandling missing values...")
        before = len(self.clean_data)
        
        # Critical columns that must have values
        critical_cols = [
            'pickup_datetime', 
            'dropoff_datetime',
            'pickup_longitude', 
            'pickup_latitude',
            'dropoff_longitude', 
            'dropoff_latitude'
        ]
        
        # Filter out rows with missing critical values
        temp_data = []
        for row in self.clean_data:
            # Check if all critical columns have values (not empty string)
            has_all_critical = all(
                row.get(col, '').strip() != '' 
                for col in critical_cols
            )
            
            if has_all_critical:
                temp_data.append(row)
        
        self.clean_data = temp_data
        
        # Fill missing passenger_count with median
        # First, collect all non-empty passenger counts
        passenger_counts = []
        for row in self.clean_data:
            pc = row.get('passenger_count', '').strip()
            if pc and pc.replace('.', '').isdigit():
                passenger_counts.append(float(pc))
        
        # Calculate median (middle value)
        if passenger_counts:
            median_passengers = median(passenger_counts)
            
            # Fill missing values
            for row in self.clean_data:
                if not row.get('passenger_count', '').strip():
                    row['passenger_count'] = str(int(median_passengers))
        
        after = len(self.clean_data)
        removed = before - after
        
        self.exclusion_log['steps'].append({
            'step': 'missing_values',
            'removed': removed
        })
        
        print(f"   Removed {removed} rows with missing critical values")
        logging.info(f"Missing values: removed {removed} rows")
        return self
    
    def handle_duplicates(self):
        """Remove duplicate trip records"""
        
        print("Checking for duplicates...")
        before = len(self.clean_data)
        
        # Use set to track unique rows
        # Convert each row dict to a frozenset (immutable set) for comparison
        seen = set()
        unique_data = []
        
        for row in self.clean_data:
            # Create a unique identifier from all values
            row_tuple = tuple(sorted(row.items()))
            
            if row_tuple not in seen:
                seen.add(row_tuple)
                unique_data.append(row)
        
        self.clean_data = unique_data
        
        after = len(self.clean_data)
        removed = before - after
        
        self.exclusion_log['steps'].append({
            'step': 'duplicates',
            'removed': removed
        })
        
        print(f"   Removed {removed} duplicate records")
        logging.info(f"Duplicates: removed {removed} rows")
        return self
    
    def handle_invalid_records(self):
        """Remove logically impossible data"""
        
        print("Removing invalid records...")
        before = len(self.clean_data)
        
        temp_data = []
        
        for row in self.clean_data:
            try:
                # Parse coordinates
                pickup_lat = float(row['pickup_latitude'])
                pickup_lon = float(row['pickup_longitude'])
                dropoff_lat = float(row['dropoff_latitude'])
                dropoff_lon = float(row['dropoff_longitude'])
                
                # Check NYC boundaries
                valid_pickup = (40.5 <= pickup_lat <= 41.0 and 
                              -74.3 <= pickup_lon <= -73.7)
                valid_dropoff = (40.5 <= dropoff_lat <= 41.0 and 
                               -74.3 <= dropoff_lon <= -73.7)
                
                # Check passenger count
                passenger_count = int(float(row.get('passenger_count', 1)))
                valid_passengers = 1 <= passenger_count <= 6
                
                # Check trip duration
                trip_duration = int(float(row['trip_duration']))
                valid_duration = trip_duration > 0
                
                # Keep only if all validations pass
                if valid_pickup and valid_dropoff and valid_passengers and valid_duration:
                    temp_data.append(row)
                    
            except (ValueError, KeyError):
                # Skip rows with parsing errors
                continue
        
        self.clean_data = temp_data
        
        after = len(self.clean_data)
        removed = before - after
        
        self.exclusion_log['steps'].append({
            'step': 'invalid_records',
            'removed': removed
        })
        
        print(f"   Removed {removed} invalid records")
        logging.info(f"Invalid records: removed {removed} rows")
        return self
    
    def handle_outliers(self):
        """Remove extreme values that distort analysis"""
        
        print("Removing outliers...")
        before = len(self.clean_data)
        
        temp_data = []
        
        for row in self.clean_data:
            try:
                trip_duration = int(float(row['trip_duration']))
                
                # Keep trips between 1 minute and 3 hours
                if 60 <= trip_duration <= 10800:
                    temp_data.append(row)
                    
            except (ValueError, KeyError):
                continue
        
        self.clean_data = temp_data
        
        after = len(self.clean_data)
        removed = before - after
        
        self.exclusion_log['steps'].append({
            'step': 'outliers',
            'removed': removed
        })
        
        print(f"   Removed {removed} outlier records")
        logging.info(f"Outliers: removed {removed} rows")
        return self
    
    def normalize_timestamps(self):
        """Convert string dates to proper datetime format"""
        
        print("Normalizing timestamps...")
        
        for row in self.clean_data:
            try:
                # Parse datetime strings
                # Example: "2016-03-14 17:24:55" -> datetime object
                pickup_dt = datetime.strptime(
                    row['pickup_datetime'], 
                    '%Y-%m-%d %H:%M:%S'
                )
                dropoff_dt = datetime.strptime(
                    row['dropoff_datetime'], 
                    '%Y-%m-%d %H:%M:%S'
                )
                
                # Extract useful time components
                row['pickup_hour'] = str(pickup_dt.hour)
                row['pickup_day'] = str(pickup_dt.day)
                row['pickup_weekday'] = str(pickup_dt.weekday())  # 0=Monday
                
            except (ValueError, KeyError):
                # If parsing fails, set defaults
                row['pickup_hour'] = '0'
                row['pickup_day'] = '1'
                row['pickup_weekday'] = '0'
        
        print("   Timestamps normalized")
        logging.info("Timestamps normalized")
        return self
    
    def create_derived_features(self):
        """
        Create new features from existing data
        These help understand trip patterns better
        """
        
        print("\nCreating derived features...")
        
        # FEATURE 1: Trip Distance (in kilometers)
        print("   Calculating distances...")
        for row in self.clean_data:
            row['distance_km'] = str(self._calculate_distance(row))
        
        # FEATURE 2: Trip Speed (km/h)
        print("   Calculating speeds...")
        for row in self.clean_data:
            try:
                distance = float(row['distance_km'])
                duration_hours = float(row['trip_duration']) / 3600
                
                if duration_hours > 0:
                    speed = distance / duration_hours
                    row['trip_speed_kmh'] = str(round(speed, 2))
                else:
                    row['trip_speed_kmh'] = '0'
                    
            except (ValueError, ZeroDivisionError):
                row['trip_speed_kmh'] = '0'
        
        # FEATURE 3: Fare per Kilometer (if fare data exists)
        print("   Calculating fare efficiency...")
        for row in self.clean_data:
            try:
                # Check if fare_amount column exists
                if 'fare_amount' in row and row['fare_amount'].strip():
                    fare = float(row['fare_amount'])
                    distance = float(row['distance_km'])
                    
                    if distance > 0:
                        fare_per_km = fare / distance
                        row['fare_per_km'] = str(round(fare_per_km, 2))
                    else:
                        row['fare_per_km'] = ''
                else:
                    row['fare_per_km'] = ''
                    
            except (ValueError, ZeroDivisionError):
                row['fare_per_km'] = ''
        
        print("   Derived features created")
        logging.info("Created derived features: distance_km, trip_speed_kmh, fare_per_km")
        return self
    
    def flag_suspicious_records(self):
        """Identify but don't remove unusual trips"""
        
        print("Flagging suspicious records...")
        
        suspicious_count = 0
        
        for row in self.clean_data:
            try:
                speed = float(row['trip_speed_kmh'])
                distance = float(row['distance_km'])
                
                # Check for suspicious patterns
                is_suspicious = False
                reason = ''
                
                if speed > 80:
                    is_suspicious = True
                    reason = 'Speed too high'
                elif speed < 5:
                    is_suspicious = True
                    reason = 'Speed too low'
                elif distance < 0.1:
                    is_suspicious = True
                    reason = 'Distance too short'
                
                # Add flags to row
                row['is_suspicious'] = '1' if is_suspicious else '0'
                row['suspicious_reason'] = reason
                
                if is_suspicious:
                    suspicious_count += 1
                    
            except ValueError:
                row['is_suspicious'] = '0'
                row['suspicious_reason'] = ''
        
        print(f"   Flagged {suspicious_count} suspicious records (kept in dataset)")
        logging.info(f"Flagged {suspicious_count} suspicious records")
        return self
    
    def _calculate_distance(self, row):
        """
        Calculate distance between pickup and dropoff points
        Uses Haversine formula (accounts for Earth's curvature)
        """
        try:
            pickup = (
                float(row['pickup_latitude']), 
                float(row['pickup_longitude'])
            )
            dropoff = (
                float(row['dropoff_latitude']), 
                float(row['dropoff_longitude'])
            )
            
            # geodesic calculates the distance between two GPS points
            distance = geodesic(pickup, dropoff).kilometers
            return round(distance, 3)
            
        except (ValueError, KeyError):
            return 0
    
    def save_clean_data(self, output_path='data/train_clean.csv'):
        """Save processed data to new CSV file"""
        
        print(f"\nSaving cleaned data to {output_path}...")
        
        # Get all column names (including new ones we created)
        if self.clean_data:
            fieldnames = list(self.clean_data[0].keys())
            
            # Write to CSV file
            with open(output_path, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                
                # Write header row
                writer.writeheader()
                
                # Write all data rows
                writer.writerows(self.clean_data)
        
        print("   Clean data saved")
        logging.info(f"Saved clean data to {output_path}")
        return self
    
    def save_exclusion_report(self, output_path='logs/exclusions.json'):
        """Save detailed report of removed records"""
        
        print(f"Saving exclusion report to {output_path}...")
        
        # Add summary
        self.exclusion_log['final_count'] = len(self.clean_data)
        self.exclusion_log['total_removed'] = (
            self.exclusion_log['original_count'] - 
            self.exclusion_log['final_count']
        )
        
        # Save as JSON file
        with open(output_path, 'w') as f:
            json.dump(self.exclusion_log, f, indent=2)
        
        print("   Exclusion report saved")
        logging.info("Exclusion report saved")
        return self
    
    def print_summary(self):
        """Display processing summary"""
        
        # Count suspicious records
        suspicious_count = sum(
            1 for row in self.clean_data 
            if row.get('is_suspicious') == '1'
        )
        
        print("\n" + "="*60)
        print("DATA PROCESSING SUMMARY")
        print("="*60)
        print(f"Original records:  {self.exclusion_log['original_count']:,}")
        print(f"Final records:     {len(self.clean_data):,}")
        print(f"Total removed:     {self.exclusion_log['total_removed']:,}")
        print(f"Suspicious flags:  {suspicious_count:,}")
        print("="*60)
        
        return self


# Run this file directly to process data
if __name__ == '__main__':
    # Create processor and run full pipeline
    processor = DataProcessor('data/train.csv')
    
    processor.load_data() \
             .handle_missing_values() \
             .handle_duplicates() \
             .handle_invalid_records() \
             .handle_outliers() \
             .normalize_timestamps() \
             .create_derived_features() \
             .flag_suspicious_records() \
             .save_clean_data() \
             .save_exclusion_report() \
             .print_summary()
    
    print("\n Data processing complete!")