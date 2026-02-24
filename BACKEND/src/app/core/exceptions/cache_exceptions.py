class CacheIdentificationInferenceError(Exception):
    def __init__(self, message: str = "Không thể suy luận id cho tài nguyên đang được lưu vào bộ nhớ đệm.") -> None:
        self.message = message
        super().__init__(self.message)


class InvalidRequestError(Exception):
    def __init__(self, message: str = "Loại yêu cầu không được hỗ trợ.") -> None:
        self.message = message
        super().__init__(self.message)


class MissingClientError(Exception):
    def __init__(self, message: str = "Client không tồn tại.") -> None:
        self.message = message
        super().__init__(self.message)
