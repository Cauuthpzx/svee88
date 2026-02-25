from .core.config import settings
from .core.setup import create_application
from .features import create_api_router

router = create_api_router()
app = create_application(router=router, settings=settings)
