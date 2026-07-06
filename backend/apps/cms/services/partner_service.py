from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.cms.models import Partner
from apps.shared.audit.services import log_action


def get_partner_or_404(pk):
    try:
        return Partner.objects.get(id=pk)
    except Partner.DoesNotExist:
        raise NotFound("Partner not found.")


def list_partners():
    return Partner.objects.all()


def list_active_partners():
    return Partner.objects.filter(is_active=True)


def create_partner(data: dict, actor=None) -> Partner:
    with transaction.atomic():
        partner = Partner.objects.create(**data)
        log_action(actor, "CREATE_PARTNER", partner, partner.id)
        return partner


def update_partner(partner: Partner, data: dict, actor=None) -> Partner:
    with transaction.atomic():
        for key, value in data.items():
            setattr(partner, key, value)
        partner.save(update_fields=list(data.keys()))
    
    log_action(actor, "UPDATE_PARTNER", partner, partner.id)
    return partner


def delete_partner(partner: Partner, actor=None) -> None:
    with transaction.atomic():
        log_action(actor, "DELETE_PARTNER", partner, partner.id)
        partner.delete()
