from pydantic import BaseModel


class AgentCreate(BaseModel):
    owner: str
    username: str
    base_url: str
    cookie: str | None = None
    password: str | None = None


class AgentRead(BaseModel):
    id: int
    owner: str
    username: str
    base_url: str
    is_active: bool
    last_login_at: str | None = None
    created_at: str


class AgentUpdate(BaseModel):
    owner: str | None = None
    base_url: str | None = None
    cookie: str | None = None
    password: str | None = None
    is_active: bool | None = None
