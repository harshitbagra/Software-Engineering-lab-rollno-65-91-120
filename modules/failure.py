class FailureAnalyzer:
    def detect_failure(self, status):
        return status != "SUCCESS"

    def analyze_logs(self, log):
        if "timeout" in log.lower():
            return "TRANSIENT"
        return "CRITICAL"


class RecoveryManager:
    def recover(self, failure_type):
        if failure_type == "TRANSIENT":
            print("Retrying failed stage...")
            return "RETRY_DONE"
        else:
            print("Rolling back deployment...")
            return "ROLLBACK_DONE"