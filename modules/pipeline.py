class CICDPipeline:
    def __init__(self):
        self.status = "INITIALIZED"

    def start_pipeline(self):
        print("Pipeline started")
        self.status = "RUNNING"
        return self.status

    def update_status(self, new_status):
        self.status = new_status
        print("Pipeline Status:", self.status)
