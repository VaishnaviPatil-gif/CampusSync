import threading
from datetime import datetime, timezone
from flask import request, jsonify
from services.sensor_service import SensorService

# Thread-safe in-memory cache for latest sensor data (performance/compatibility fallback)
latest_sensor_data = {}
latest_sensor_lock = threading.Lock()

def receive_sensor_data_controller():
    global latest_sensor_data
    data = request.get_json(silent=True) or {}
    
    # Normalize fields from Arduino/NodeMCU
    temp = data.get("temperature", data.get("temp"))
    hum = data.get("humidity", data.get("hum"))
    hr = data.get("heartRate", data.get("heart_rate", data.get("hr")))
    stress = data.get("stress")
    
    # Cast to numeric if not None
    temp_val = float(temp) if temp is not None else None
    hum_val = float(hum) if hum is not None else None
    hr_val = float(hr) if hr is not None else None
    stress_val = float(stress) if stress is not None else None
    
    # Record to SQLite database
    record = SensorService.record_reading(temp_val, hum_val, hr_val, stress_val)
    
    # Store in thread-safe memory
    with latest_sensor_lock:
        latest_sensor_data = {
            "temperature": record["temperature"],
            "humidity": record["humidity"],
            "heartRate": record["heart_rate"],
            "stress": record["stress_level"],
            "receivedAt": record["received_at"]
        }
        
    print(f"[FLASK SENSORS] Ingested and stored: {latest_sensor_data}")
    return jsonify({"success": True, "data": latest_sensor_data}), 200

def get_latest_sensor_data_controller():
    with latest_sensor_lock:
        data = latest_sensor_data.copy() if latest_sensor_data else {}
        
    # If cache is empty, check database
    if not data:
        db_record = SensorService.get_latest_reading()
        if db_record:
            data = {
                "temperature": db_record["temperature"],
                "humidity": db_record["humidity"],
                "heartRate": db_record["heart_rate"],
                "stress": db_record["stress_level"],
                "receivedAt": db_record["received_at"]
            }
            
    if not data:
        return jsonify({
            "temperature": None, 
            "humidity": None, 
            "heartRate": None, 
            "stress": None, 
            "receivedAt": None
        }), 200
        
    return jsonify(data), 200

def get_sensor_history_controller():
    limit = request.args.get("limit", 50)
    try:
        limit_val = int(limit)
    except ValueError:
        limit_val = 50
        
    records = SensorService.get_history(limit_val)
    formatted = []
    for r in records:
        formatted.append({
            "temperature": r["temperature"],
            "humidity": r["humidity"],
            "heartRate": r["heart_rate"],
            "stress": r["stress_level"],
            "receivedAt": r["received_at"]
        })
        
    return jsonify({"success": True, "data": formatted}), 200
