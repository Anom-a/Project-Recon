"""URL routing for the audit API.

Registers the ``AuditLogViewSet`` under the ``audit/`` prefix,
yielding:

* ``GET /api/v1/audit/``
* ``GET /api/v1/audit/{id}/``
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.shared.audit.api.views import AuditLogViewSet

router = DefaultRouter()
router.register(r"", AuditLogViewSet, basename="audit")

urlpatterns = [
    path("", include(router.urls)),
]
