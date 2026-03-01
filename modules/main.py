from pipeline import CICDPipeline
from failure import FailureAnalyzer, RecoveryManager

pipeline = CICDPipeline()
pipeline.start_pipeline()

status = "FAILED"
logs = "Build failed due to timeout"

analyzer = FailureAnalyzer()
recovery = RecoveryManager()

if analyzer.detect_failure(status):
    failure_type = analyzer.analyze_logs(logs)
    result = recovery.recover(failure_type)
    pipeline.update_status(result)