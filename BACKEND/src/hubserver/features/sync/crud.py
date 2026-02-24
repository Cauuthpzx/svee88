from fastcrud import FastCRUD

from .model import SyncMetadata
from .schema import (
    SyncMetadataCreateInternal,
    SyncMetadataDelete,
    SyncMetadataRead,
    SyncMetadataUpdate,
    SyncMetadataUpdateInternal,
)

CRUDSyncMetadata = FastCRUD[
    SyncMetadata,
    SyncMetadataCreateInternal,
    SyncMetadataUpdate,
    SyncMetadataUpdateInternal,
    SyncMetadataDelete,
    SyncMetadataRead,
]
crud_sync_metadata = CRUDSyncMetadata(SyncMetadata)
