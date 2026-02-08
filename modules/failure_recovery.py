class FailureAnalyzer:
    def __init__(self):
        self.failure_type = None

    def detect_failure(self, status):
        if status != "SUCCESS":
            print("Failure detected")
            return True
        return False

    def analyze_logs(self, log_message):
        print("Analyzing logs")
        if "timeout" in log_message.lower():
            self.failure_type = "TRANSIENT"
        else:
            self.failure_type = "CRITICAL"
        return self.failure_type


class RecoveryManager:
    def retry_failed_stage(self):
        print("Retrying failed stage")
        return "RETRY_SUCCESS"

    def rollback_deployment(self):
        print("Rollback deployment")
        return "ROLLBACK_DONE"


if __name__ == "__main__":
    analyzer = FailureAnalyzer()
    recovery = RecoveryManager()

    status = "FAILED"
    logs = "Build failed due to timeout"

    if analyzer.detect_failure(status):
        failure = analyzer.analyze_logs(logs)
        if failure == "TRANSIENT":
            recovery.retry_failed_stage()
        else:
            recovery.rollback_deployment()