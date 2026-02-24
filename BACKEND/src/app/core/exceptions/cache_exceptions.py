class CacheIdentificationInferenceError(Exception):
    def __init__(self, message: str = "Cannot infer resource ID for the cached resource.") -> None:
        self.message = message
        super().__init__(self.message)


class InvalidRequestError(Exception):
    def __init__(self, message: str = "Unsupported request type.") -> None:
        self.message = message
        super().__init__(self.message)


class MissingClientError(Exception):
    def __init__(self, message: str = "Redis client does not exist.") -> None:
        self.message = message
        super().__init__(self.message)
