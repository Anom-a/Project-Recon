from django.db import transaction
from rest_framework.exceptions import NotFound

from apps.cms.models import AboutUs
from apps.shared.audit.services import log_action

def get_about_us_or_404(pk):
    try:
        return AboutUs.objects.get(id=pk)
    except AboutUs.DoesNotExist:
        raise NotFound("About Us section not found.")


def get_about_us_by_slug_or_404(slug):
    try:
        return AboutUs.objects.get(slug=slug, is_active=True)
    except AboutUs.DoesNotExist:
        raise NotFound("About Us section not found.")


def list_about_us():
    return AboutUs.objects.all()


def list_active_about_us():
    return AboutUs.objects.filter(is_active=True)


def create_about_us(data: dict, actor=None) -> AboutUs:
    with transaction.atomic():
        about = AboutUs.objects.create(**data)
        log_action(actor, "CREATE_ABOUT", about, about.id)
        return about

def update_about_us(about: AboutUs, data: dict, actor=None) -> AboutUs:
    with transaction.atomic():
        for key, value in data.items():
            setattr(about, key, value)
        about.save(update_fields=list(data.keys()))
    log_action(actor, "UPDATE_ABOUT", about, about.id)
    return about


def delete_about_us(about: AboutUs, actor=None) -> None:
    with transaction.atomic():
        about.delete()
    log_action(actor, "DELETE_ABOUT", about, about.id)
