from functools import wraps
from flask import request, jsonify, g
from utils.jwt_utils import decode_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
                
        if not token:
            return jsonify({"success": False, "error": {"code": 401, "message": "Token is missing"}}), 401
            
        payload = decode_token(token)
        if not payload:
            return jsonify({"success": False, "error": {"code": 401, "message": "Token is invalid or expired"}}), 401
            
        g.user = payload
        return f(*args, **kwargs)
        
    return decorated

def role_required(roles):
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, "user") or not g.user:
                return jsonify({"success": False, "error": {"code": 401, "message": "Unauthorized"}}), 401
                
            user_role = g.user.get("role")
            if user_role not in roles:
                return jsonify({"success": False, "error": {"code": 403, "message": "Access forbidden for this role"}}), 403
                
            return f(*args, **kwargs)
        return decorated
    return decorator
