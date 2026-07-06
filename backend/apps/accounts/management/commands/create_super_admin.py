"""
Management command to create a terminal Super Admin account.

Terminal-created Super Admins bypass onboarding checks per the auth design spec.
"""

import getpass

from django.core.management.base import BaseCommand

from apps.accounts.services import user_service


class Command(BaseCommand):
    """Create a Super Admin user via the management command path."""

    help = "Create a super admin user"

    def add_arguments(self, parser):
        parser.add_argument("--email", type=str, help="Email address")
        parser.add_argument("--first-name", type=str, help="First name")
        parser.add_argument("--last-name", type=str, help="Last name")
        parser.add_argument("--password", type=str, help="Password")

    def handle(self, *args, **options):
        email = options.get("email") or input("Email: ")
        first_name = options.get("first_name") or input("First name: ")
        last_name = options.get("last_name") or input("Last name: ")
        password = options.get("password") or getpass.getpass("Password: ")

        user = user_service.create_super_admin(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
        )
        self.stdout.write(
            self.style.SUCCESS(f"Successfully created super admin with email: {user.email} and password: {password}")
        )
