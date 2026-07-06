import os

from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


ALLOWED_FILE_EXTENSIONS = frozenset({
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".pdf", ".doc", ".docx",
})

MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def validate_file_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file extension '{ext}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_FILE_EXTENSIONS))}."
        )


def validate_file_size(value):
    if value.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"File size exceeds {MAX_FILE_SIZE_MB} MB "
            f"({value.size / 1024 / 1024:.1f} MB)."
        )


def validate_uploaded_file(value):
    validate_file_extension(value)
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
