from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.cms.models import FAQ
from apps.shared.audit.services import log_action


def get_faq_or_404(pk):
    try:
        return FAQ.objects.get(id=pk)
    except FAQ.DoesNotExist:
        raise NotFound("FAQ not found.")


def list_faqs():
    return FAQ.objects.all()


def list_active_faqs():
    return FAQ.objects.filter(is_active=True)


def create_faq(data: dict, actor=None) -> FAQ:
    with transaction.atomic():
        faq = FAQ.objects.create(**data)
        log_action(actor, "CREATE_FAQ", faq, faq.id)
        return faq


def update_faq(faq: FAQ, data: dict, actor=None) -> FAQ:
    with transaction.atomic():
        for key, value in data.items():
            setattr(faq, key, value)
        faq.save(update_fields=list(data.keys()))
    log_action(actor, "UPDATE_FAQ", faq, faq.id)
    return faq


def delete_faq(faq: FAQ, actor=None) -> None:
    with transaction.atomic():
        log_action(actor, "DELETE_FAQ", faq, faq.id)
        faq.delete()
