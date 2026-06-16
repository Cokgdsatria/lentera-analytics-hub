from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings


@dataclass(frozen=True)
class StoredFile:
    filename: str
    content_type: str
    path: str


ALLOWED_SUFFIXES = {".pdf", ".png", ".jpg", ".jpeg"}


async def save_evidence_file(upload: UploadFile | None) -> StoredFile | None:
    if upload is None or not upload.filename:
        return None

    settings = get_settings()
    content_type = upload.content_type or "application/octet-stream"
    if content_type not in settings.allowed_upload_type_set:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported evidence file type.",
        )

    suffix = Path(upload.filename).suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Evidence must be a PDF, PNG, JPG, or JPEG file.",
        )

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    target_dir = settings.upload_dir_path
    target_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid4().hex}{suffix}"
    target_path = target_dir / safe_name

    total = 0
    with target_path.open("wb") as buffer:
        while chunk := await upload.read(1024 * 1024):
            total += len(chunk)
            if total > max_bytes:
                target_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Evidence file must be at most {settings.max_upload_size_mb}MB.",
                )
            buffer.write(chunk)

    return StoredFile(
        filename=upload.filename,
        content_type=content_type,
        path=str(target_path),
    )
