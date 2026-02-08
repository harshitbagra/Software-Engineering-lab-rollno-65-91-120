class CICDPipeline:
    def __init__(self, pipeline_id):
        self.pipeline_id = pipeline_id
        self.status = "INITIALIZED"

    def start_pipeline(self):
        print("Pipeline started")
        self.status = "RUNNING"
        return self.status

    def update_status(self, status):
        self.status = status
        print("Pipeline status:", self.status)


class BuildManager:
    def __init__(self):
        self.build_status = "NOT_STARTED"

    def fetch_source_code(self):
        print("Fetching source code")
        return True

    def build_application(self):
        print("Building application")
        self.build_status = "SUCCESS"
        return self.build_status


if __name__ == "__main__":
    pipeline = CICDPipeline(101)
    build_manager = BuildManager()

    pipeline.start_pipeline()

    if build_manager.fetch_source_code():
        result = build_manager.build_application()
        pipeline.update_status(result)