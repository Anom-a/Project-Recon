import os

from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


ALLOWED_FILE_EXTENSIONS = frozenset({
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".pdf", ".doc", ".docx",
})

ALLOWED_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def validate_file_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file extension '{ext}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_FILE_EXTENSIONS))}."
        )


_UNKNOWN_MIME_TYPES = frozenset({
    "application/octet-stream",
    "text/plain",
})


def validate_file_mime_type(value):
    ext = os.path.splitext(value.name)[1].lower()
    expected_mime = ALLOWED_MIME_TYPES.get(ext)
    if expected_mime and value.content_type:
        if value.content_type != expected_mime and value.content_type not in _UNKNOWN_MIME_TYPES:
            raise ValidationError(
                f"File content type '{value.content_type}' does not match "
                f"expected type '{expected_mime}' for extension '{ext}'."
            )


def validate_file_size(value):
    if value.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"File size exceeds {MAX_FILE_SIZE_MB} MB "
            f"({value.size / 1024 / 1024:.1f} MB)."
        )


def validate_uploaded_file(value):
    validate_file_extension(value)
    validate_file_mime_type(value)
    validate_file_size(value)


@deconstructible
class FileExtensionValidator:
    def __call__(self, value):
        validate_file_extension(value)


@deconstructible
class FileSizeValidator:
    def __call__(self, value):
        validate_file_size(value)


@deconstructible
class UploadedFileValidator:
    def __call__(self, value):
        validate_uploaded_file(value)
