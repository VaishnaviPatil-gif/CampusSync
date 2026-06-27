from datetime import datetime, timezone
from typing import Dict, List, Optional
from repositories.wellness_repository import WellnessRepository

class SensorService:
    @staticmethod
    def record_reading(temp: Optional[float], hum: Optional[float], hr: Optional[float], stress: Optional[float] = None) -> dict:
        # If stress is not provided, calculate a mock stress level
        if stress is None:
            stress = SensorService.calculate_stress_level(temp, hum, hr)
            
        now = datetime.now(timezone.utc).isoformat()
        return WellnessRepository.add_sensor_reading(temp, hum, hr, stress, now)

    @staticmethod
    def get_latest_reading() -> Optional[dict]:
        return WellnessRepository.get_latest_sensor_reading()

    @staticmethod
    def get_history(limit: int = 50) -> List[dict]:
        return WellnessRepository.get_sensor_readings_history(limit)

    @staticmethod
    def calculate_stress_level(temp: Optional[float], hum: Optional[float], hr: Optional[float]) -> float:
        # Fallback calculations matching frontend logic
        t = temp if temp is not None else 27.0
        h = hum if hum is not None else 50.0
        r = hr if hr is not None else 72.0
        
        hr_score = min(100.0, max(0.0, (r - 60.0) * 1.5))
        temp_score = min(100.0, max(0.0, (t - 25.0) * 3.0))
        hum_score = min(100.0, max(0.0, (h - 40.0) * 1.2))
        
        return round(0.6 * hr_score + 0.25 * temp_score + 0.15 * hum_score, 1)
