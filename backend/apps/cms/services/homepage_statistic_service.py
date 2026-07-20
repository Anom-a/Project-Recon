from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.cms.models import HomepageStatistic
from apps.shared.audit.services import log_action

_DEFAULTS = {
    "future_engineers": 5_000_000,
    "programs": 120,
    "competitions": 500,
    "mission_current": 1_240_500,
    "mission_target": 5_000_000,
}


def get_stats() -> HomepageStatistic:
    """Return the current homepage stats row (newest), creating defaults if none exist.

    Admin can create multiple rows; public always reads the latest. Avoids
    MultipleObjectsReturned from bare get_or_create() when >1 row exists.
    """
    obj = HomepageStatistic.objects.order_by("-created_at").first()
    if obj is None:
        obj = HomepageStatistic.objects.create(**_DEFAULTS)
    return obj


def get_stats_or_404(pk) -> HomepageStatistic:
    """Retrieve a HomepageStatistic by PK or raise NotFound."""
    try:
        return HomepageStatistic.objects.get(id=pk)
    except HomepageStatistic.DoesNotExist:
        raise NotFound("Homepage statistics not found.")


def list_stats():
    """Return all homepage statistic records."""
    return HomepageStatistic.objects.all()


def create_stats(data: dict, actor=None) -> HomepageStatistic:
    """Create a new homepage statistic record and audit the action."""
    with transaction.atomic():
        stats = HomepageStatistic.objects.create(**data)
        log_action(actor, "CREATE_HOMEPAGE_STATS", stats, stats.id)
        return stats


def update_stats(data: dict, actor=None) -> HomepageStatistic:
    """Update the single homepage statistic record and audit the action."""
    stats = get_stats()
    with transaction.atomic():
        for key, value in data.items():
            setattr(stats, key, value)
        stats.save(update_fields=list(data.keys()))
    log_action(actor, "UPDATE_HOMEPAGE_STATS", stats, stats.id)
    return stats


def update_stats_by_instance(stats: HomepageStatistic, data: dict, actor=None) -> HomepageStatistic:
    """Update a specific homepage statistic instance and audit the action."""
    with transaction.atomic():
        for key, value in data.items():
            setattr(stats, key, value)
        stats.save(update_fields=list(data.keys()))
    log_action(actor, "UPDATE_HOMEPAGE_STATS", stats, stats.id)
    return stats


def delete_stats(stats: HomepageStatistic, actor=None) -> None:
    """Delete a homepage statistic record and audit the action."""
    with transaction.atomic():
        log_action(actor, "DELETE_HOMEPAGE_STATS", stats, stats.id)
        stats.delete()
