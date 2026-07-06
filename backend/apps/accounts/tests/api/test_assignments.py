"""Assignment API endpoint tests."""
from rest_framework import status

from apps.accounts.constants import Roles
from apps.accounts.models import Branch, UserAssignment
from apps.accounts.tests.api.base import AccountsAPITestCase


class AssignmentAPITestCase(AccountsAPITestCase):
    """Assignment create, list, update, delete, transfer tests."""

    # ── List ──────────────────────────────────────────────

    def test_list_assignments_as_super_admin(self):
        self.authenticate_as()
        response = self.client.get(f"{self.base_url}/assignments/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_list_assignments_filtered_by_user(self):
        self.authenticate_as()
        response = self.client.get(
            f"{self.base_url}/assignments/",
            {"user": str(self.student.id)},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_list_assignments_unauthenticated_returns_401(self):
        response = self.client.get(f"{self.base_url}/assignments/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_assignments_as_student_returns_403(self):
        self.authenticate_as(self.student)
        response = self.client.get(f"{self.base_url}/assignments/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Create ────────────────────────────────────────────

    def test_create_assignment_new_role(self):
        self.authenticate_as()
        new_branch = Branch.objects.create(name="New Branch", code="NB01")
        new_user = self._make_student("newstu@test.com", new_branch)
        response = self.client.post(
            f"{self.base_url}/assignments/",
            {
                "user_id": str(new_user.id),
                "branch_id": str(new_branch.id),
                "role": Roles.INSTRUCTOR,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["branch"]["code"], "NB01")

    def test_duplicate_assignment_returns_400(self):
        self.authenticate_as()
        payload = {
            "user_id": str(self.student.id),
            "branch_id": str(self.branch.id),
            "role": Roles.STUDENT,
        }
        response = self.client.post(
            f"{self.base_url}/assignments/", payload, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_assignment_nonexistent_user_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/assignments/",
            {
                "user_id": fake_id,
                "branch_id": str(self.branch.id),
                "role": Roles.INSTRUCTOR,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_assignment_nonexistent_branch_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/assignments/",
            {
                "user_id": str(self.super_admin.id),
                "branch_id": fake_id,
                "role": Roles.INSTRUCTOR,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_super_admin_assignment_no_branch(self):
        self.authenticate_as()
        new_user = self._make_student("sa_assign@test.com", self.branch)
        response = self.client.post(
            f"{self.base_url}/assignments/",
            {
                "user_id": str(new_user.id),
                "role": Roles.SUPER_ADMIN,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.json()["branch"])

    # ── Detail (PATCH) ────────────────────────────────────

    def test_update_assignment_is_primary(self):
        self.authenticate_as()
        assignment = self.student.assignments.first()
        other_branch = Branch.objects.create(name="Other", code="OTH")
        other = self._make_student("other@test.com", other_branch)
        other_assignment = other.assignments.first()
        response = self.client.patch(
            f"{self.base_url}/assignments/{other_assignment.id}/",
            {"is_primary": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["is_primary"])

    def test_update_assignment_nonexistent_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.patch(
            f"{self.base_url}/assignments/{fake_id}/",
            {"is_primary": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Delete ────────────────────────────────────────────

    def test_delete_assignment_returns_204(self):
        self.authenticate_as()
        new_branch = Branch.objects.create(name="DelBranch", code="DEL")
        new_user = self._make_student("del@test.com", new_branch)
        assignment = new_user.assignments.first()
        response = self.client.delete(
            f"{self.base_url}/assignments/{assignment.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        assignment.refresh_from_db()
        self.assertFalse(assignment.is_active)

    def test_delete_assignment_nonexistent_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.delete(f"{self.base_url}/assignments/{fake_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Make Primary ──────────────────────────────────────

    def test_make_primary(self):
        self.authenticate_as()
        other_branch = Branch.objects.create(name="PrimaryBranch", code="PRI")
        other_user = self._make_student("pri@test.com", other_branch)
        assignment = other_user.assignments.first()
        response = self.client.post(
            f"{self.base_url}/assignments/{assignment.id}/make-primary/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["is_primary"])

    def test_make_primary_nonexistent_returns_404(self):
        self.authenticate_as()
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/assignments/{fake_id}/make-primary/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Transfer ──────────────────────────────────────────

    def test_transfer_user_between_branches(self):
        self.authenticate_as()
        dest = Branch.objects.create(name="DestBranch", code="DST")
        from_assign = self.student.assignments.first()
        response = self.client.post(
            f"{self.base_url}/assignments/transfer/",
            {
                "user_id": str(self.student.id),
                "from_branch_id": str(self.branch.id),
                "to_branch_id": str(dest.id),
                "role": from_assign.role,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["branch"]["id"], str(dest.id))

    def test_transfer_nonexistent_user_returns_404(self):
        self.authenticate_as()
        dest = Branch.objects.create(name="Dest2", code="DS2")
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/assignments/transfer/",
            {
                "user_id": fake_id,
                "from_branch_id": str(self.branch.id),
                "to_branch_id": str(dest.id),
                "role": Roles.STUDENT,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_transfer_nonexistent_source_branch_returns_404(self):
        self.authenticate_as()
        dest = Branch.objects.create(name="Dest3", code="DS3")
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = self.client.post(
            f"{self.base_url}/assignments/transfer/",
            {
                "user_id": str(self.student.id),
                "from_branch_id": fake_id,
                "to_branch_id": str(dest.id),
                "role": Roles.STUDENT,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Helpers ───────────────────────────────────────────

    def _make_student(self, email, branch):
        from apps.accounts.services.user_service import create_student_user
        user = create_student_user(email, "Test", "User", self.password, branch)
        user.is_email_verified = True
        user.save()
        user.status = "Active"
        user.save()
        return user
