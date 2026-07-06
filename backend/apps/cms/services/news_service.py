from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError

from apps.cms.models import NewsArticle
from apps.shared.audit.services import log_action


def get_news_article_or_404(pk):
    try:
        return NewsArticle.objects.get(id=pk)
    except NewsArticle.DoesNotExist:
        raise NotFound("News article not found.")


def get_news_article_by_slug_or_404(slug):
    try:
        return NewsArticle.objects.get(slug=slug, is_active=True)
    except NewsArticle.DoesNotExist:
        raise NotFound("News article not found.")


def list_news_articles():
    return NewsArticle.objects.all()


def list_active_news_articles():
    return NewsArticle.objects.filter(is_active=True)


def create_news_article(data: dict, actor=None) -> NewsArticle:
    _validate_media(data)
    _validate_button(data)
    with transaction.atomic():
        article = NewsArticle.objects.create(**data)
        log_action(actor, "CREATE_NEWS_ARTICLE", article, article.id)
        return article


def update_news_article(article: NewsArticle, data: dict, actor=None) -> NewsArticle:
    _validate_media(data)
    _validate_button(data)
    with transaction.atomic():
        for key, value in data.items():
            setattr(article, key, value)
        article.save(update_fields=list(data.keys()))
    log_action(actor, "UPDATE_NEWS_ARTICLE", article, article.id)
    return article


def delete_news_article(article: NewsArticle, actor=None) -> None:
    with transaction.atomic():
        log_action(actor, "DELETE_NEWS_ARTICLE", article, article.id)
        article.delete()


def _validate_media(data: dict):
    image = data.get("image")
    video_url = data.get("video_url")
    if image and video_url:
        raise ValidationError(
            "Only one of image or video_url may be provided, not both."
        )


def _validate_button(data: dict):
    button_text = data.get("button_text")
    button_url = data.get("button_url")
    if button_text and not button_url:
        raise ValidationError("button_url is required when button_text is provided.")
    if button_url and not button_text:
        raise ValidationError("button_text is required when button_url is provided.")
