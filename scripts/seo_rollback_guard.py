import os
import json
import subprocess
from datetime import datetime

LOG_FILE = "seo_change_log.json"

def log_seo_change(url, field, old_val, new_val, reason, confidence, status):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "url": url,
        "field": field,
        "old_value": old_val,
        "new_value": new_val,
        "reason": reason,
        "confidence": confidence,
        "validation_status": status
    }
    
    data = {"last_updated": datetime.utcnow().isoformat(), "changes": []}
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r") as f:
                data = json.load(f)
        except Exception:
            pass
            
    data["changes"].append(entry)
    with open(LOG_FILE, "w") as f:
        json.dump(data, f, indent=2)

def verify_site_health():
    print("Running pre-deployment validation checks...")
    result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
    if result.returncode != 0:
        print("BUILD FAILED! Triggering automatic rollback...")
        subprocess.run(["git", "checkout", "."], capture_output=True)
        return False
    print("Validation PASSED successfully.")
    return True

if __name__ == "__main__":
    success = verify_site_health()
    if not success:
        exit(1)
