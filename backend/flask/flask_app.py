import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from database.db import init_db
from routes.auth_routes import auth_bp
from routes.sensor_routes import sensor_bp
from routes.student_routes import student_bp
from routes.teacher_routes import teacher_bp
from routes.parent_routes import parent_bp
from routes.notification_routes import notification_bp
from routes.alert_routes import alert_bp
from middleware.rate_limiter import check_rate_limit

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize DB
    with app.app_context():
        init_db()
        
    # Register global rate limiting
    app.before_request(check_rate_limit)
        
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(sensor_bp, url_prefix="/api")
    app.register_blueprint(student_bp, url_prefix="/api")
    app.register_blueprint(teacher_bp, url_prefix="/api")
    app.register_blueprint(parent_bp, url_prefix="/api")
    app.register_blueprint(notification_bp, url_prefix="/api")
    app.register_blueprint(alert_bp, url_prefix="/api")
    
    # Root static routes
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    @app.route("/", methods=["GET"])
    def serve_index():
        return send_from_directory(Config.BASE_DIR, "index.html")

    @app.route("/<path:asset_path>", methods=["GET"])
    def serve_assets(asset_path: str):
        return send_from_directory(Config.BASE_DIR, asset_path)

    # Centralized Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {"success": False, "error": {"code": 400, "message": getattr(error, "description", "Bad request")}}, 400

    @app.errorhandler(401)
    def unauthorized(error):
        return {"success": False, "error": {"code": 401, "message": getattr(error, "description", "Unauthorized")}}, 401

    @app.errorhandler(403)
    def forbidden(error):
        return {"success": False, "error": {"code": 403, "message": getattr(error, "description", "Forbidden")}}, 403

    @app.errorhandler(404)
    def not_found(error):
        return {"success": False, "error": {"code": 404, "message": getattr(error, "description", "Not found")}}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"success": False, "error": {"code": 500, "message": "Internal server error"}}, 500

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
