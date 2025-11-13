"""Custom application errors."""
from __future__ import annotations


class DomainValidationError(ValueError):
    """Raised when business rules are violated."""


class EntityNotFoundError(LookupError):
    """Raised when a requested entity does not exist."""
