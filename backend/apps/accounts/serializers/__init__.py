"""Accounts API serializers."""

from apps.accounts.serializers.auth import (
    ChangePasswordSerializer,
    DeviceVerificationRequestSerializer,
    DeviceVerificationVerifySerializer,
    EmailVerificationVerifySerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RefreshTokenSerializer,
    ResetPasswordSerializer,
    TokenPairSerializer,
)
from apps.accounts.serializers.user import (
    ChangeEmailSerializer,
    CreateBranchManagerSerializer,
    CreateStaffUserSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from apps.accounts.serializers.branch import (
    BranchCreateSerializer,
    BranchSerializer,
    BranchUpdateSerializer,
    BranchWithManagerSerializer,
    ManagerActionSerializer,
)
from apps.accounts.serializers.assignment import (
    AssignRoleSerializer,
    TransferUserSerializer,
    UpdateAssignmentSerializer,
    UserAssignmentSerializer,
)
from apps.accounts.serializers.device import (
    RevokeAllDevicesSerializer,
    TrustedDeviceSerializer,
)

__all__ = [
    "LoginSerializer",
    "LogoutSerializer",
    "RefreshTokenSerializer",
    "TokenPairSerializer",
    "EmailVerificationVerifySerializer",
    "DeviceVerificationRequestSerializer",
    "DeviceVerificationVerifySerializer",
    "ForgotPasswordSerializer",
    "ResetPasswordSerializer",
    "ChangePasswordSerializer",
    "UserSerializer",
    "UserUpdateSerializer",
    "CreateStaffUserSerializer",
    "CreateBranchManagerSerializer",
    "ChangeEmailSerializer",
    "BranchSerializer",
    "BranchCreateSerializer",
    "BranchUpdateSerializer",
    "BranchWithManagerSerializer",
    "ManagerActionSerializer",
    "UserAssignmentSerializer",
    "AssignRoleSerializer",
    "UpdateAssignmentSerializer",
    "TransferUserSerializer",
    "TrustedDeviceSerializer",
    "RevokeAllDevicesSerializer",
]
