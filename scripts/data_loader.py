"""
Data Loader - Inserts cleaned data into SQLite database
Uses Python's csv library
"""

import sqlite3
import csv
import sys
import os

class DataLoader:
    """Loads cleaned CSV data into normalized database"""
    
    def __init__(self, db_path='database/nyc_taxi.db'):
        """
        Initialize database connection
        Args:
            db_path: Path to SQLite database
        """
        self.connection = sqlite3.connect(db_path)
        self.cursor = self.connection.cursor()
        self.location_cache = {}  # Cache location IDs to avoid duplicates
        
    def load_vendors(self):
        """Insert vendor (taxi company) master data"""
    
        print("Loading vendors...")
    
        # Note: The dataset only contains vendor_id (1, 2) without company names
        # Using generic names to demonstrate normalization
        # In production, these would be mapped from business documentation
        vendors = [
            (1, 'Vendor 1'),
            (2, 'Vendor 2')
        ]
    
        self.cursor.executemany("""
            INSERT OR IGNORE INTO vendors (vendor_id, vendor_name)
            VALUES (?, ?)
        """, vendors)
    
        self.connection.commit()
        print(f"   Loaded {len(vendors)} vendors")
    
    def load_locations(self, csv_path):
        """
        Extract and load unique locations from trips
        Args:
            csv_path: Path to cleaned CSV file
        """
        
        print("Loading locations...")
        
        # Read CSV and extract unique coordinates
        unique_locations = {}  # Use dict to track unique coords
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Get pickup coordinates
                pickup_key = (
                    float(row['pickup_latitude']), 
                    float(row['pickup_longitude'])
                )
                unique_locations[pickup_key] = True
                
                # Get dropoff coordinates
                dropoff_key = (
                    float(row['dropoff_latitude']), 
                    float(row['dropoff_longitude'])
                )
                unique_locations[dropoff_key] = True
        
        # Prepare location data with borough
        location_data = []
        for (lat, lon) in unique_locations.keys():
            borough = self._identify_borough(lat, lon)
            location_data.append((lat, lon, borough))
        
        # Insert into database
        self.cursor.executemany("""
            INSERT OR IGNORE INTO locations (latitude, longitude, borough)
            VALUES (?, ?, ?)
        """, location_data)
        
        self.connection.commit()
        print(f"   Loaded {len(location_data)} unique locations")
        
        # Build cache for fast lookup
        self._build_location_cache()
    
    def _identify_borough(self, lat, lon):
        """
        Classify coordinates into NYC boroughs
        Uses approximate geographic boundaries
        """
        # Manhattan: roughly 40.70-40.88°N, -74.02 to -73.91°W
        if 40.70 <= lat <= 40.88 and -74.02 <= lon <= -73.91:
            return 'Manhattan'
        
        # Brooklyn: roughly 40.57-40.74°N, -74.05 to -73.85°W
        elif 40.57 <= lat <= 40.74 and -74.05 <= lon <= -73.85:
            return 'Brooklyn'
        
        # Queens: roughly 40.54-40.80°N, -73.96 to -73.70°W
        elif 40.54 <= lat <= 40.80 and -73.96 <= lon <= -73.70:
            return 'Queens'
        
        # Bronx: roughly 40.79-40.92°N, -73.93 to -73.75°W
        elif 40.79 <= lat <= 40.92 and -73.93 <= lon <= -73.75:
            return 'Bronx'
        
        # Staten Island: roughly 40.50-40.65°N, -74.26 to -74.05°W
        elif 40.50 <= lat <= 40.65 and -74.26 <= lon <= -74.05:
            return 'Staten Island'
        
        else:
            return 'Unknown'
    
    def _build_location_cache(self):
        """Create dictionary mapping coordinates to location IDs"""
        
        self.cursor.execute("""
            SELECT location_id, latitude, longitude FROM locations
        """)
        
        for loc_id, lat, lon in self.cursor.fetchall():
            # Round coordinates to match CSV precision
            key = (round(lat, 8), round(lon, 8))
            self.location_cache[key] = loc_id
    
    def load_trips(self, csv_path='data/train_clean.csv', batch_size=1000):
        """
        Load trip records and metrics using csv library
        Args:
            csv_path: Path to cleaned CSV file
            batch_size: Number of rows to insert at once
        """
        
        print("Loading trips (this may take a while)...")
        
        trips_batch = []
        metrics_batch = []
        row_count = 0
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                row_count += 1
                
                # Show progress every 1000 rows
                if row_count % 1000 == 0:
                    print(f"   Processing {row_count} records...")
                
                try:
                    # Get location IDs from cache
                    pickup_key = (
                        round(float(row['pickup_latitude']), 8),
                        round(float(row['pickup_longitude']), 8)
                    )
                    dropoff_key = (
                        round(float(row['dropoff_latitude']), 8),
                        round(float(row['dropoff_longitude']), 8)
                    )
                    
                    pickup_loc_id = self.location_cache.get(pickup_key)
                    dropoff_loc_id = self.location_cache.get(dropoff_key)
                    
                    if not pickup_loc_id or not dropoff_loc_id:
                        continue  # Skip if location not found
                    
                    # Prepare trip data
                    trip = (
                        row['id'],
                        int(float(row['vendor_id'])),
                        row['pickup_datetime'],
                        row['dropoff_datetime'],
                        int(float(row.get('passenger_count', 1))),
                        pickup_loc_id,
                        dropoff_loc_id,
                        row.get('store_and_fwd_flag', 'N'),
                        int(float(row['trip_duration']))
                    )
                    trips_batch.append(trip)
                    
                    # Prepare metrics data
                    metric = (
                        row['id'],
                        float(row['distance_km']) if row['distance_km'] else None,
                        float(row['trip_speed_kmh']) if row['trip_speed_kmh'] else None,
                        float(row['fare_per_km']) if row.get('fare_per_km', '').strip() else None,
                        int(row.get('is_suspicious', 0)),
                        row.get('suspicious_reason', '')
                    )
                    metrics_batch.append(metric)
                    
                    # Insert batch when it reaches batch_size
                    if len(trips_batch) >= batch_size:
                        self._insert_batch(trips_batch, metrics_batch)
                        trips_batch = []
                        metrics_batch = []
                        
                except (ValueError, KeyError) as e:
                    # Skip rows with errors
                    continue
        
        # Insert remaining records
        if trips_batch:
            self._insert_batch(trips_batch, metrics_batch)
        
        print(f"   Loaded {row_count} trips with metrics")
    
    def _insert_batch(self, trips_data, metrics_data):
        """Insert a batch of trips and their metrics"""
        
        # Insert trips
        self.cursor.executemany("""
            INSERT OR IGNORE INTO trips 
            (trip_id, vendor_id, pickup_datetime, dropoff_datetime,
             passenger_count, pickup_location_id, dropoff_location_id,
             store_and_fwd_flag, trip_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, trips_data)
        
        # Insert metrics
        self.cursor.executemany("""
            INSERT OR IGNORE INTO trip_metrics 
            (trip_id, distance_km, trip_speed_kmh, fare_per_km,
             is_suspicious, suspicious_reason)
            VALUES (?, ?, ?, ?, ?, ?)
        """, metrics_data)
        
        self.connection.commit()
    
    def close(self):
        """Close database connection"""
        self.connection.close()


# Run this file directly to load data
if __name__ == '__main__':
    print("\n" + "="*60)
    print("LOADING DATA INTO DATABASE")
    print("="*60 + "\n")
    
    # Check if cleaned data exists
    if not os.path.exists('data/train_clean.csv'):
        print(" Error: Clean data not found!")
        print("   Please run data_processor.py first")
        sys.exit(1)
    
    # Initialize loader
    loader = DataLoader('database/nyc_taxi.db')
    
    # Load data in order (due to foreign keys)
    loader.load_vendors()
    loader.load_locations('data/train_clean.csv')
    loader.load_trips('data/train_clean.csv')
    
    loader.close()
    
    print("\n" + "="*60)
    print(" DATABASE LOADING COMPLETE!")
    print("="*60)