from .features import create_api_router
from .core.config import settings
from .core.setup import create_application

router = create_api_router()
app = create_application(router=router, settings=settings)
