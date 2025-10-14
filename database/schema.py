"""
Database Schema Definition
Creates all tables with proper relationships and constraints
"""

import sqlite3
import os

class DatabaseSchema:
    """Manages database creation and structure"""
    
    def __init__(self, db_path='database/nyc_taxi.db'):
        """
        Initialize database connection
        Args:
            db_path: Path where SQLite database file will be created
        """
        # Create database directory if it doesn't exist
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Connect to SQLite database (creates file if doesn't exist)
        self.connection = sqlite3.connect(db_path)
        self.cursor = self.connection.cursor()
        
        # Enable foreign key constraints (off by default in SQLite)
        self.cursor.execute("PRAGMA foreign_keys = ON")
        
    def create_tables(self):
        """Create all database tables with relationships"""
        
        print("Creating database tables...")
        
        # Table 1: Vendors (taxi companies)
        # Stores unique vendor information to avoid repeating company names
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendors (
                vendor_id INTEGER PRIMARY KEY,
                vendor_name TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Table 2: Locations (pickup/dropoff points)
        # Stores unique coordinate pairs to save space
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS locations (
                location_id INTEGER PRIMARY KEY AUTOINCREMENT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                borough TEXT,
                UNIQUE(latitude, longitude)
            )
        """)
        
        # Table 3: Trips (main data table)
        # Stores each taxi trip with references to vendors and locations
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS trips (
                trip_id TEXT PRIMARY KEY,
                vendor_id INTEGER NOT NULL,
                pickup_datetime TEXT NOT NULL,
                dropoff_datetime TEXT NOT NULL,
                passenger_count INTEGER,
                pickup_location_id INTEGER NOT NULL,
                dropoff_location_id INTEGER NOT NULL,
                store_and_fwd_flag TEXT DEFAULT 'N',
                trip_duration INTEGER NOT NULL,
                
                -- Foreign keys link to other tables
                FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
                FOREIGN KEY (pickup_location_id) REFERENCES locations(location_id),
                FOREIGN KEY (dropoff_location_id) REFERENCES locations(location_id),
                
                -- Data validation rules
                CHECK (passenger_count BETWEEN 1 AND 6),
                CHECK (trip_duration > 0)
            )
        """)
        
        # Table 4: Trip Metrics (calculated features)
        # Stores derived features like speed, distance
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS trip_metrics (
                metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id TEXT UNIQUE NOT NULL,
                distance_km REAL,
                trip_speed_kmh REAL,
                fare_per_km REAL,
                is_suspicious INTEGER DEFAULT 0,
                suspicious_reason TEXT,
                
                FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
            )
        """)
        
        self.connection.commit()
        print("Tables created successfully")
        
    def create_indexes(self):
        """Create indexes for faster queries"""
        
        print("Creating indexes...")
        
        # Index 1: Speed up date range queries
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pickup_datetime 
            ON trips(pickup_datetime)
        """)
        
        # Index 2: Speed up vendor filtering
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendor 
            ON trips(vendor_id)
        """)
        
        # Index 3: Speed up location queries
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_pickup_location 
            ON trips(pickup_location_id)
        """)
        
        # Index 4: Speed up suspicious record queries
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_suspicious 
            ON trip_metrics(is_suspicious) 
            WHERE is_suspicious = 1
        """)
        
        # Index 5: Speed up speed-based queries
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_speed 
            ON trip_metrics(trip_speed_kmh)
        """)
        
        self.connection.commit()
        print("Indexes created successfully")
        
    def close(self):
        """Close database connection"""
        self.connection.close()


# Run this file directly to create the database
if __name__ == '__main__':
    db = DatabaseSchema()
    db.create_tables()
    db.create_indexes()
    db.close()
    print("\n Database setup complete!")