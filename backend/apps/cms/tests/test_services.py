from django.test import TestCase
from rest_framework.exceptions import NotFound, ValidationError

from apps.cms.models import HeroBanner, NewsArticle, Partner, AboutUs, FAQ, ContactRequest
from apps.cms.services.hero_banner_service import (
    create_hero_banner,
    update_hero_banner,
    delete_hero_banner,
    get_hero_banner_or_404,
)
from apps.cms.services.news_service import create_news_article, get_news_article_by_slug_or_404
from apps.cms.services.contact_request_service import (
    create_contact_request,
    list_contact_requests,
    get_contact_request_or_404,
    update_contact_request,
    delete_contact_request,
)
from apps.cms.services.faq_service import create_faq, get_faq_or_404
from apps.cms.constants import ContactStatus, ContactPriority


class HeroBannerServiceTest(TestCase):
    def test_create_banner_with_video(self):
        banner = create_hero_banner({"title": "Banner", "video_url": "https://example.com/vid"})
        self.assertEqual(banner.title, "Banner")

    def test_create_banner_with_image_and_video_raises_error(self):
        with self.assertRaises(ValidationError) as ctx:
            create_hero_banner({
                "title": "Bad",
                "image": "fake.jpg",
                "video_url": "https://example.com/vid",
            })
        self.assertIn("not both", str(ctx.exception).lower())

    def test_create_banner_without_media_raises_error(self):
        with self.assertRaises(ValidationError) as ctx:
            create_hero_banner({"title": "Bad"})
        self.assertIn("must be provided", str(ctx.exception).lower())

    def test_button_requires_url(self):
        with self.assertRaises(ValidationError):
            create_hero_banner({
                "title": "Bad",
                "video_url": "https://example.com/vid",
                "button_text": "Click",
            })

    def test_url_requires_button(self):
        with self.assertRaises(ValidationError):
            create_hero_banner({
                "title": "Bad",
                "video_url": "https://example.com/vid",
                "button_url": "https://example.com",
            })

    def test_get_or_404_raises_not_found(self):
        with self.assertRaises(NotFound):
            get_hero_banner_or_404("00000000-0000-0000-0000-000000000000")

    def test_update_banner(self):
        banner = create_hero_banner({"title": "Old", "video_url": "https://example.com/vid"})
        updated = update_hero_banner(banner, {"title": "New"})
        self.assertEqual(updated.title, "New")

    def test_delete_banner(self):
        banner = create_hero_banner({"title": "Del", "video_url": "https://example.com/vid"})
        delete_hero_banner(banner)
        with self.assertRaises(NotFound):
            get_hero_banner_or_404(banner.id)


class NewsServiceTest(TestCase):
    def test_get_article_by_slug(self):
        article = create_news_article({
            "title": "Test", "slug": "test-slug", "content": "Content",
        })
        found = get_news_article_by_slug_or_404("test-slug")
        self.assertEqual(found.id, article.id)

    def test_get_article_by_slug_not_found(self):
        with self.assertRaises(NotFound):
            get_news_article_by_slug_or_404("non-existent")

    def test_create_with_image_and_video_raises_error(self):
        with self.assertRaises(ValidationError):
            create_news_article({
                "title": "Bad", "slug": "bad", "content": "C",
                "image": "fake.jpg", "video_url": "https://example.com/vid",
            })


class ContactRequestServiceTest(TestCase):
    def test_create_contact_request(self):
        cr = create_contact_request({
            "name": "John", "email": "john@test.com",
            "subject": "Help", "description": "I need help",
        })
        self.assertIsNotNone(cr.id)
        self.assertEqual(cr.name, "John")
        self.assertEqual(cr.email, "john@test.com")
        self.assertEqual(cr.subject, "Help")
        self.assertEqual(cr.description, "I need help")
        self.assertEqual(cr.status, ContactStatus.OPEN)
        self.assertEqual(cr.priority, ContactPriority.MEDIUM)

    def test_create_with_all_fields(self):
        cr = create_contact_request({
            "name": "Jane", "email": "jane@test.com",
            "phone": "+251911234567", "subject": "Urgent",
            "description": "Please help ASAP",
            "status": ContactStatus.OPEN,
            "priority": ContactPriority.URGENT,
        })
        self.assertEqual(cr.phone, "+251911234567")
        self.assertEqual(cr.priority, ContactPriority.URGENT)

    def test_create_without_name_raises_error(self):
        with self.assertRaises(ValidationError):
            create_contact_request({
                "email": "john@test.com", "subject": "Help", "description": "Desc",
            })

    def test_create_with_empty_name_raises_error(self):
        with self.assertRaises(ValidationError):
            create_contact_request({
                "name": "   ", "email": "john@test.com",
                "subject": "Help", "description": "Desc",
            })

    def test_create_without_email_raises_error(self):
        with self.assertRaises(ValidationError):
            create_contact_request({
                "name": "John", "subject": "Help", "description": "Desc",
            })

    def test_create_without_subject_raises_error(self):
        with self.assertRaises(ValidationError):
            create_contact_request({
                "name": "John", "email": "john@test.com", "description": "Desc",
            })

    def test_create_with_empty_subject_raises_error(self):
        with self.assertRaises(ValidationError):
            create_contact_request({
                "name": "John", "email": "john@test.com",
                "subject": "", "description": "Desc",
            })

    def test_create_without_description_raises_error(self):
        with self.assertRaises(ValidationError):
            create_contact_request({
                "name": "John", "email": "john@test.com", "subject": "Help",
            })

    def test_list_contact_requests(self):
        create_contact_request({
            "name": "A", "email": "a@t.com", "subject": "S1", "description": "D1",
        })
        create_contact_request({
            "name": "B", "email": "b@t.com", "subject": "S2", "description": "D2",
        })
        qs = list_contact_requests()
        self.assertEqual(qs.count(), 2)

    def test_get_or_404_found(self):
        cr = create_contact_request({
            "name": "Find", "email": "find@t.com", "subject": "Find", "description": "D",
        })
        found = get_contact_request_or_404(cr.id)
        self.assertEqual(found.id, cr.id)

    def test_get_or_404_not_found(self):
        with self.assertRaises(NotFound):
            get_contact_request_or_404("00000000-0000-0000-0000-000000000000")

    def test_update_status(self):
        cr = create_contact_request({
            "name": "John", "email": "john@t.com", "subject": "S", "description": "D",
        })
        updated = update_contact_request(cr, {"status": ContactStatus.IN_PROGRESS})
        self.assertEqual(updated.status, ContactStatus.IN_PROGRESS)

    def test_update_priority(self):
        cr = create_contact_request({
            "name": "John", "email": "john@t.com", "subject": "S", "description": "D",
        })
        updated = update_contact_request(cr, {"priority": ContactPriority.HIGH})
        self.assertEqual(updated.priority, ContactPriority.HIGH)

    def test_update_multiple_fields(self):
        cr = create_contact_request({
            "name": "John", "email": "john@t.com", "subject": "S", "description": "D",
        })
        updated = update_contact_request(cr, {
            "name": "Jane",
            "email": "jane@t.com",
            "phone": "+251911111111",
        })
        self.assertEqual(updated.name, "Jane")
        self.assertEqual(updated.email, "jane@t.com")
        self.assertEqual(updated.phone, "+251911111111")

    def test_update_invalid_status_raises_error(self):
        cr = create_contact_request({
            "name": "John", "email": "john@t.com", "subject": "S", "description": "D",
        })
        with self.assertRaises(ValidationError):
            update_contact_request(cr, {"status": "INVALID"})

    def test_update_invalid_priority_raises_error(self):
        cr = create_contact_request({
            "name": "John", "email": "john@t.com", "subject": "S", "description": "D",
        })
        with self.assertRaises(ValidationError):
            update_contact_request(cr, {"priority": "INVALID"})

    def test_delete_contact_request(self):
        cr = create_contact_request({
            "name": "Del", "email": "del@t.com", "subject": "Del", "description": "D",
        })
        delete_contact_request(cr)
        with self.assertRaises(NotFound):
            get_contact_request_or_404(cr.id)

    def test_ordering_newest_first(self):
        cr1 = create_contact_request({
            "name": "Old", "email": "o@t.com", "subject": "O", "description": "D",
        })
        cr2 = create_contact_request({
            "name": "New", "email": "n@t.com", "subject": "N", "description": "D",
        })
        qs = list_contact_requests()
        self.assertEqual(qs[0].id, cr2.id)
        self.assertEqual(qs[1].id, cr1.id)


class FAQServiceTest(TestCase):
    def test_create_faq(self):
        faq = create_faq({"question": "Q?", "answer": "A."})
        self.assertEqual(faq.question, "Q?")

    def test_get_or_404_found(self):
        faq = create_faq({"question": "Q?", "answer": "A."})
        found = get_faq_or_404(faq.id)
        self.assertEqual(found.id, faq.id)

    def test_get_or_404_not_found(self):
        with self.assertRaises(NotFound):
            get_faq_or_404("00000000-0000-0000-0000-000000000000")
