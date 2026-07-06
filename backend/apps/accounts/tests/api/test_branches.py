"""Branch API endpoint tests."""
from rest_framework import status

from apps.accounts.models import Branch
from apps.accounts.tests.api.base import AccountsAPITestCase


class BranchAPITestCase(AccountsAPITestCase):
    """Branch CRUD, manager assignment, and status lifecycle tests."""

    # ── List ──────────────────────────────────────────────

    def test_list_branches_as_super_admin(self):
        self.authenticate_as()
        response = self.client.get(f"{self.base_url}/branches/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [b["name"] for b in response.json()]
        self.assertIn("Main Branch", names)

    def test_list_branches_as_student_returns_403(self):
        self.authenticate_as(self.student)
        response = self.client.get(f"{self.base_url}/branches/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_branches_unauthenticated_returns_401(self):
        response = self.client.get(f"{self.base_url}/branches/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Create ────────────────────────────────────────────

    def test_create_branch_as_super_admin(self):
        self.authenticate_as()
        response = self.client.post(
            f"{self.base_url}/branches/",
            {"name": "Hawassa Branch", "code": "haw"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["code"], "HAW")

    def test_create_branch_denied_for_student(self):
        self.authenticate_as(self.student)
        response = self.client.post(
            f"{self.base_url}/branches/",
            {"name": "Denied Branch", "code": "DEN"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_branch_duplicate_code_returns_400(self):
        self.authenticate_as()
        Branch.objects.create(name="Existing", code="EXIST")
        response = self.client.post(
            f"{self.base_url}/branches/",
            {"name": "Another", "code": "EXIST"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Detail ────────────────────────────────────────────

    def test_get_branch_detail(self):
        self.authenticate_as()
        response = self.client.get(f"{self.base_url}/branches/{self.branch.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Main Branch")

    def test_get_branch_detail_nonexistent_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.get(f"{self.base_url}/branches/{fake_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Update ────────────────────────────────────────────

    def test_update_branch(self):
        self.authenticate_as()
        response = self.client.patch(
            f"{self.base_url}/branches/{self.branch.id}/",
            {"city": "Addis Ababa"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["city"], "Addis Ababa")

    def test_update_branch_unauthenticated_returns_401(self):
        response = self.client.patch(
            f"{self.base_url}/branches/{self.branch.id}/",
            {"city": "N/A"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Create with Manager ───────────────────────────────

    def test_create_branch_with_manager(self):
        self.authenticate_as()
        mgr = self._create_plain_user("mgr@assign.com")
        response = self.client.post(
            f"{self.base_url}/branches/with-manager/",
            {
                "name": "Managed Branch",
                "code": "MGT",
                "manager_user_id": str(mgr.id),
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["name"], "Managed Branch")

    def test_create_branch_with_manager_nonexistent_user_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/branches/with-manager/",
            {
                "name": "Bad Branch",
                "code": "BAD",
                "manager_user_id": fake_id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Assign Manager ────────────────────────────────────

    def test_assign_manager_to_branch(self):
        self.authenticate_as()
        new_branch = Branch.objects.create(name="AssignBranch", code="ASG")
        mgr = self._create_plain_user("mgr2@assign.com")
        response = self.client.post(
            f"{self.base_url}/branches/{new_branch.id}/assign-manager/",
            {"manager_user_id": str(mgr.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assign_manager_nonexistent_branch_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/branches/{fake_id}/assign-manager/",
            {"manager_user_id": str(self.super_admin.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_assign_manager_nonexistent_user_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/branches/{self.branch.id}/assign-manager/",
            {"manager_user_id": fake_id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Change Manager ────────────────────────────────────

    def test_change_branch_manager(self):
        self.authenticate_as()
        new_branch = Branch.objects.create(name="ChangeMgrBranch", code="CHG")
        mgr1 = self._create_plain_user("oldmgr@test.com")
        self.client.post(
            f"{self.base_url}/branches/{new_branch.id}/assign-manager/",
            {"manager_user_id": str(mgr1.id)},
            format="json",
        )
        mgr2 = self._create_plain_user("newmgr@test.com")
        response = self.client.post(
            f"{self.base_url}/branches/{new_branch.id}/change-manager/",
            {"manager_user_id": str(mgr2.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_manager_nonexistent_user_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/branches/{self.branch.id}/change-manager/",
            {"manager_user_id": fake_id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Activate / Deactivate / Archive ───────────────────

    def test_activate_branch(self):
        self.branch.status = "Inactive"
        self.branch.save()
        self.authenticate_as()
        response = self.client.post(
            f"{self.base_url}/branches/{self.branch.id}/activate/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "Active")

    def test_deactivate_branch(self):
        self.authenticate_as()
        response = self.client.post(
            f"{self.base_url}/branches/{self.branch.id}/deactivate/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "Inactive")

    def test_archive_branch(self):
        self.authenticate_as()
        response = self.client.post(
            f"{self.base_url}/branches/{self.branch.id}/archive/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "Archived")

    def test_branch_status_change_nonexistent_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/branches/{fake_id}/activate/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_branch_status_change_as_student_returns_403(self):
        self.authenticate_as(self.student)
        response = self.client.post(
            f"{self.base_url}/branches/{self.branch.id}/archive/"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Helpers ───────────────────────────────────────────

    def _create_plain_user(self, email):
        from apps.accounts.models import User
        return User.objects.create_user(
            email=email,
            first_name="Test",
            last_name="User",
            password=self.password,
        )
