"""
Flask API Server - Provides REST endpoints for future comprehensive dashboard
"""

from flask import Flask, jsonify, request
from flask_cors import CORS  # For handling cross-origin requests

import sqlite3
import os

app = Flask(__name__)

CORS(app)
DATABASE = 'database/nyc_taxi.db'

def get_db():
    """Create database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    """API documentation endpoint"""
    return jsonify({
        'message': 'NYC Taxi Analytics API',
        'endpoints': {
            'Basic Queries': {
                '/api/trips': 'Get individual trips (paginated)',
                '/api/trips/count': 'Get total trip count'
            },
            'Statistics': {
                '/api/stats/summary': 'Overall KPIs and summary',
                '/api/stats/vendors': 'Vendor comparison',
                '/api/stats/hourly': 'Trips by hour of day',
                '/api/stats/daily-patterns': 'Trips by day of week',
                '/api/stats/monthly-trends': 'Trips over time',
                '/api/stats/rush-hour': 'Rush hour analysis'
            },
            'Distributions': {
                '/api/stats/duration-distribution': 'Trip duration ranges',
                '/api/stats/distance-distribution': 'Trip distance ranges',
                '/api/stats/speed-distribution': 'Trip speed ranges',
                '/api/stats/passenger-distribution': 'Passenger count distribution'
            },
            'Location Analysis': {
                '/api/boroughs': 'Trips by borough',
                '/api/stats/top-locations': 'Most popular pickup locations'
            },
            'Data Quality': {
                '/api/suspicious': 'Flagged suspicious trips',
                '/api/stats/efficiency': 'Distance vs duration analysis'
            }
        }
    })

# ==================== BASIC QUERIES ROUTES ====================

@app.route('/api/trips')
def get_trips():
    """Get trips with optional filters"""
    vendor_id = request.args.get('vendor_id', type=int)
    start_date = request.args.get('start_date')
    limit = request.args.get('limit', default=100, type=int)
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM trips WHERE 1=1"
    params = []
    
    if vendor_id:
        query += " AND vendor_id = ?"
        params.append(vendor_id)
    
    if start_date:
        query += " AND DATE(pickup_datetime) >= ?"
        params.append(start_date)
    
    query += f" LIMIT {limit}"
    
    cursor.execute(query, params)
    trips = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'count': len(trips),
        'trips': trips
    })

@app.route('/api/trips/count')
def get_trip_count():
    """Get total number of trips"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM trips")
    result = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        'total_trips': result['total']
    })

# ==================== SUMMARY & KPIs ROUTES ====================

@app.route('/api/stats/summary')
def get_summary():
    """Get overall KPIs and summary statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Total trips
    cursor.execute("SELECT COUNT(*) as total FROM trips")
    total = cursor.fetchone()['total']
    
    # Suspicious trips
    cursor.execute("SELECT COUNT(*) as total FROM trip_metrics WHERE is_suspicious = 1")
    suspicious = cursor.fetchone()['total']
    
    # Averages
    cursor.execute("""
        SELECT 
            ROUND(AVG(trip_duration / 60.0), 2) as avg_duration_min,
            ROUND(AVG(distance_km), 2) as avg_distance_km,
            ROUND(AVG(trip_speed_kmh), 2) as avg_speed_kmh,
            ROUND(MAX(distance_km), 2) as max_distance_km,
            ROUND(MAX(trip_duration / 60.0), 2) as max_duration_min
        FROM trips t
        JOIN trip_metrics m ON t.trip_id = m.trip_id
    """)
    averages = cursor.fetchone()
    
    # Date range
    cursor.execute("""
        SELECT 
            MIN(pickup_datetime) as first_trip,
            MAX(pickup_datetime) as last_trip
        FROM trips
    """)
    dates = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        'total_trips': total,
        'suspicious_trips': suspicious,
        'clean_trips': total - suspicious,
        'avg_duration_minutes': averages['avg_duration_min'],
        'avg_distance_km': averages['avg_distance_km'],
        'avg_speed_kmh': averages['avg_speed_kmh'],
        'max_distance_km': averages['max_distance_km'],
        'max_duration_minutes': averages['max_duration_min'],
        'date_range': {
            'start': dates['first_trip'],
            'end': dates['last_trip']
        }
    })

@app.route('/api/stats/vendors')
def vendor_stats():
    """Get statistics grouped by vendor"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            v.vendor_name,
            COUNT(t.trip_id) as total_trips,
            ROUND(AVG(t.trip_duration / 60.0), 2) as avg_duration_min,
            ROUND(AVG(m.distance_km), 2) as avg_distance_km,
            ROUND(AVG(m.trip_speed_kmh), 2) as avg_speed_kmh
        FROM trips t
        JOIN vendors v ON t.vendor_id = v.vendor_id
        JOIN trip_metrics m ON t.trip_id = m.trip_id
        GROUP BY v.vendor_name
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

# ==================== TIME PATTERNS ROUTES ====================

@app.route('/api/stats/hourly')
def hourly_stats():
    """Get trip counts by hour of day"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CAST(strftime('%H', pickup_datetime) AS INTEGER) as hour,
            COUNT(*) as trip_count
        FROM trips
        GROUP BY hour
        ORDER BY hour
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/daily-patterns')
def daily_patterns():
    """Get trips by day of week"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CASE CAST(strftime('%w', pickup_datetime) AS INTEGER)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END as day_name,
            COUNT(*) as trip_count,
            ROUND(AVG(trip_duration / 60.0), 2) as avg_duration_min
        FROM trips
        GROUP BY strftime('%w', pickup_datetime)
        ORDER BY CAST(strftime('%w', pickup_datetime) AS INTEGER)
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/monthly-trends')
def monthly_trends():
    """Get trips by month"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            strftime('%Y-%m', pickup_datetime) as month,
            COUNT(*) as trip_count,
            ROUND(AVG(trip_duration / 60.0), 2) as avg_duration_min,
            ROUND(AVG(distance_km), 2) as avg_distance_km
        FROM trips t
        JOIN trip_metrics m ON t.trip_id = m.trip_id
        GROUP BY month
        ORDER BY month
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/rush-hour')
def rush_hour_analysis():
    """Get average speed by hour (traffic indicator)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CAST(strftime('%H', pickup_datetime) AS INTEGER) as hour,
            COUNT(*) as trip_count,
            ROUND(AVG(trip_speed_kmh), 2) as avg_speed,
            CASE 
                WHEN CAST(strftime('%H', pickup_datetime) AS INTEGER) BETWEEN 7 AND 9 
                    THEN 'Morning Rush'
                WHEN CAST(strftime('%H', pickup_datetime) AS INTEGER) BETWEEN 17 AND 19 
                    THEN 'Evening Rush'
                ELSE 'Normal'
            END as period
        FROM trips t
        JOIN trip_metrics m ON t.trip_id = m.trip_id
        GROUP BY hour
        ORDER BY hour
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

# ==================== DISTRIBUTIONS ROUTES ====================

@app.route('/api/stats/duration-distribution')
def duration_distribution():
    """Get trip duration ranges"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CASE 
                WHEN trip_duration < 300 THEN '0-5 min'
                WHEN trip_duration < 600 THEN '5-10 min'
                WHEN trip_duration < 900 THEN '10-15 min'
                WHEN trip_duration < 1800 THEN '15-30 min'
                WHEN trip_duration < 3600 THEN '30-60 min'
                ELSE '60+ min'
            END as duration_range,
            COUNT(*) as trip_count
        FROM trips
        GROUP BY duration_range
        ORDER BY MIN(trip_duration)
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/distance-distribution')
def distance_distribution():
    """Get trip distance ranges"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CASE 
                WHEN distance_km < 1 THEN '0-1 km'
                WHEN distance_km < 3 THEN '1-3 km'
                WHEN distance_km < 5 THEN '3-5 km'
                WHEN distance_km < 10 THEN '5-10 km'
                WHEN distance_km < 20 THEN '10-20 km'
                ELSE '20+ km'
            END as distance_range,
            COUNT(*) as trip_count
        FROM trip_metrics
        WHERE distance_km IS NOT NULL
        GROUP BY distance_range
        ORDER BY MIN(distance_km)
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/speed-distribution')
def speed_distribution():
    """Get trip speed ranges"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CASE 
                WHEN trip_speed_kmh < 10 THEN '0-10 km/h'
                WHEN trip_speed_kmh < 20 THEN '10-20 km/h'
                WHEN trip_speed_kmh < 30 THEN '20-30 km/h'
                WHEN trip_speed_kmh < 40 THEN '30-40 km/h'
                ELSE '40+ km/h'
            END as speed_range,
            COUNT(*) as trip_count
        FROM trip_metrics
        WHERE trip_speed_kmh IS NOT NULL
        GROUP BY speed_range
        ORDER BY MIN(trip_speed_kmh)
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/passenger-distribution')
def passenger_distribution():
    """Get trips by passenger count"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            passenger_count,
            COUNT(*) as trip_count
        FROM trips
        GROUP BY passenger_count
        ORDER BY passenger_count
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

# ==================== LOCATION ANALYSIS ROUTES ====================

@app.route('/api/boroughs')
def borough_stats():
    """Get trip counts by NYC borough"""
    conn = get_db()
    cursor = conn.cursor()
    
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
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

@app.route('/api/stats/top-locations')
def top_locations():
    """Get most popular pickup locations"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            l.latitude,
            l.longitude,
            l.borough,
            COUNT(t.trip_id) as trip_count
        FROM trips t
        JOIN locations l ON t.pickup_location_id = l.location_id
        GROUP BY l.location_id
        ORDER BY trip_count DESC
        LIMIT 20
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

# ==================== DATA QUALITY ROUTES====================

@app.route('/api/suspicious')
def suspicious_trips():
    """Get flagged suspicious trips"""
    limit = request.args.get('limit', default=50, type=int)
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            t.trip_id,
            t.pickup_datetime,
            m.trip_speed_kmh,
            m.distance_km,
            m.suspicious_reason
        FROM trips t
        JOIN trip_metrics m ON t.trip_id = m.trip_id
        WHERE m.is_suspicious = 1
        ORDER BY m.trip_speed_kmh DESC
        LIMIT ?
    """, (limit,))
    
    trips = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'count': len(trips),
        'suspicious_trips': trips
    })

@app.route('/api/stats/efficiency')
def trip_efficiency():
    """Get distance vs duration comparison (sample for scatter plot)"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Sample 1000 trips for performance
    cursor.execute("""
        SELECT 
            distance_km,
            t.trip_duration / 60.0 as duration_minutes,
            trip_speed_kmh
        FROM trips t
        JOIN trip_metrics m ON t.trip_id = m.trip_id
        WHERE m.distance_km > 0 
        AND m.distance_km < 50
        AND t.trip_duration < 7200
        ORDER BY RANDOM()
        LIMIT 1000
    """)
    
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(stats)

# ==================== SERVER STARTUP ====================

if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        print("Error: Database not found!")
        print("   Please run the setup scripts first:")
        print("   1. python database/schema.py")
        print("   2. python scripts/data_processor.py")
        print("   3. python scripts/data_loader.py")
    else:
        print("Starting Flask API server...")
        print("   API docs available at: http://127.0.0.1:5000/")
        print("\n Available endpoint categories:")
        print("   - Basic Queries (trips, counts)")
        print("   - Statistics (summary, vendors, time patterns)")
        print("   - Distributions (duration, distance, speed, passengers)")
        print("   - Location Analysis (boroughs, top locations)")
        print("   - Data Quality (suspicious trips, efficiency)")    
        app.run(debug=True)
