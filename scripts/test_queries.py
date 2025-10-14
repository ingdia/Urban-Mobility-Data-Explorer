"""
Test Database Queries
Verifies database works correctly and efficiently
"""

import sqlite3

def run_test_queries():
    """Run sample queries to test database"""
    
    print("\n" + "="*60)
    print("TESTING DATABASE QUERIES")
    print("="*60 + "\n")
    
    # Connect to database
    conn = sqlite3.connect('database/nyc_taxi.db')
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    cursor = conn.cursor()
    
    # Test 1: Count total records
    print("Test 1: Total Records")
    print("-" * 40)
    cursor.execute("SELECT COUNT(*) as count FROM trips")
    result = cursor.fetchone()
    print(f"Total trips: {result['count']:,}\n")
    
    # Test 2: Average trip stats by vendor
    print("Test 2: Stats by Vendor")
    print("-" * 40)
    cursor.execute("""
        SELECT 
            v.vendor_name,
            COUNT(t.trip_id) as total_trips,
            ROUND(AVG(t.trip_duration), 2) as avg_duration_sec,
            ROUND(AVG(m.distance_km), 2) as avg_distance_km,
            ROUND(AVG(m.trip_speed_kmh), 2) as avg_speed_kmh
        FROM trips t
        JOIN vendors v ON t.vendor_id = v.vendor_id
        JOIN trip_metrics m ON t.trip_id = m.trip_id
        GROUP BY v.vendor_name
    """)
    
    for row in cursor.fetchall():
        print(f"Vendor: {row['vendor_name']}")
        print(f"  Total trips: {row['total_trips']:,}")
        print(f"  Avg duration: {row['avg_duration_sec']} seconds")
        print(f"  Avg distance: {row['avg_distance_km']} km")
        print(f"  Avg speed: {row['avg_speed_kmh']} km/h\n")
    
    # Test 3: Trips by hour of day
    print("Test 3: Peak Hours (Top 5)")
    print("-" * 40)
    cursor.execute("""
        SELECT 
            CAST(strftime('%H', pickup_datetime) AS INTEGER) as hour,
            COUNT(*) as trip_count
        FROM trips
        GROUP BY hour
        ORDER BY trip_count DESC
        LIMIT 5
    """)
    
    for row in cursor.fetchall():
        print(f"Hour {row['hour']:02d}:00 - {row['trip_count']:,} trips")
    
    # Test 4: Suspicious trips
    print("\nTest 4: Suspicious Trips")
    print("-" * 40)
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM trip_metrics
        WHERE is_suspicious = 1
    """)
    result = cursor.fetchone()
    print(f"Total suspicious trips: {result['count']:,}")
    
    cursor.execute("""
        SELECT 
            suspicious_reason,
            COUNT(*) as count
        FROM trip_metrics
        WHERE is_suspicious = 1
        GROUP BY suspicious_reason
    """)
    
    print("\nBreakdown by reason:")
    for row in cursor.fetchall():
        print(f"  {row['suspicious_reason']}: {row['count']:,}")
    
    # Test 5: Popular boroughs
    print("\nTest 5: Trips by Borough")
    print("-" * 40)
    cursor.execute("""
        SELECT 
            l.borough,
            COUNT(t.trip_id) as trip_count
        FROM trips t
        JOIN locations l ON t.pickup_location_id = l.location_id
        WHERE l.borough != 'Unknown'
        GROUP BY l.borough
        ORDER BY trip_count DESC
    """)
    
    for row in cursor.fetchall():
        print(f"{row['borough']}: {row['trip_count']:,} trips")
    
    # Test 6: Query performance
    print("\nTest 6: Query Performance Check")
    print("-" * 40)
    cursor.execute("""
        EXPLAIN QUERY PLAN
        SELECT * FROM trips
        WHERE pickup_datetime BETWEEN '2016-01-01' AND '2016-01-31'
        AND vendor_id = 2
    """)
    
    print("Query plan (checks if indexes are used):")
    for row in cursor.fetchall():
        print(f"  {row[3]}")
    
    conn.close()
    
    print("\n" + "="*60)
    print(" ALL TESTS COMPLETED")
    print("="*60)


if __name__ == '__main__':
    run_test_queries()

