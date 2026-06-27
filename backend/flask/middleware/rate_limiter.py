import time
from flask import request, jsonify

# In-memory store for client IP request times
ip_requests = {}

def check_rate_limit():
    ip = request.remote_addr or "unknown"
    now = time.time()
    period = 900  # 15 minutes in seconds
    limit = 100   # Max requests in period
    
    if ip not in ip_requests:
        ip_requests[ip] = []
        
    # Keep only requests within the active sliding window
    ip_requests[ip] = [t for t in ip_requests[ip] if now - t < period]
    
    if len(ip_requests[ip]) >= limit:
        return jsonify({
            "success": False,
            "error": {
                "code": 429,
                "message": "Too many requests from this IP, please try again later."
            }
        }), 429
        
    ip_requests[ip].append(now)
