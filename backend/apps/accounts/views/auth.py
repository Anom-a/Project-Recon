"""Authentication API views."""

from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
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
from apps.accounts.api.throttles import (
    ForgotPasswordAnonThrottle,
    LoginAnonThrottle,
    OTPRequestUserThrottle,
    OTPVerifyUserThrottle,
    ResetPasswordAnonThrottle,
)
from apps.accounts.serializers.device import TrustedDeviceSerializer
from apps.accounts.services.device_service import build_device_info
from apps.accounts.services.authentication_service import (
    forgot_password,
    login,
    logout,
    refresh_token,
    request_email_verification,
    reset_password,
    verify_email_otp,
    request_device_verification,   
    verify_device_otp,
    change_password,
)


class LoginView(APIView):
    """
    Authenticate with email and password.

    Request: email, password, optional device metadata.
    Response: JWT access and refresh tokens.
    """

    permission_classes = [AllowAny]
    throttle_classes = [LoginAnonThrottle]

    @extend_schema(
        tags=["Auth"],
        request=LoginSerializer,
        responses=TokenPairSerializer,
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        device_info = build_device_info(
            serializer.get_device_info(),
            request,
        )

        tokens = login(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            device_info=device_info or None,
        )

        return Response(TokenPairSerializer(tokens).data)


class LogoutView(APIView):
    """
    Blacklist refresh token and record logout.

    Request body: refresh token.
    Requires authentication.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Auth"], request=LogoutSerializer, responses={204: None})
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        logout(request.user, serializer.validated_data["refresh"])
        return Response(status=204)


class TokenRefreshView(APIView):
    """
    Rotate refresh token and return a new token pair.

    Request body: refresh token.
    Errors: 401 when token is invalid.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Auth"],
        request=RefreshTokenSerializer,
        responses={200: TokenPairSerializer},
    )
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = refresh_token(serializer.validated_data["refresh"])
        return Response(TokenPairSerializer(tokens).data)


class EmailVerificationRequestView(APIView):
    """Send email verification OTP to the authenticated user."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [OTPRequestUserThrottle]

    @extend_schema(tags=["Auth"], responses={204: None})
    def post(self, request):
        request_email_verification(request.user)
        return Response(status=204)


class EmailVerificationVerifyView(APIView):
    """
    Verify email OTP and optionally register the first trusted device.

    Request body: otp, optional device metadata.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [OTPVerifyUserThrottle]

    @extend_schema(tags=["Auth"], request=EmailVerificationVerifySerializer, responses={204: None})
    def post(self, request):
        serializer = EmailVerificationVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device_info = serializer.get_device_info()

        if device_info:
            device_info = build_device_info(device_info, request)

        verify_email_otp(
            request.user,
            serializer.validated_data["otp"],
            device_info=device_info,
        )
        return Response(status=204)


class DeviceVerificationRequestView(APIView):
    """Send device verification OTP for a new device."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [OTPRequestUserThrottle]

    @extend_schema(tags=["Auth"], request=DeviceVerificationRequestSerializer, responses={204: None})
    def post(self, request):
        serializer = DeviceVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device_info = build_device_info(serializer.validated_data, request)

        request_device_verification(request.user, device_info)

        return Response(status=204)


class DeviceVerificationVerifyView(APIView):
    """
    Verify device OTP and register the device as trusted.

    Response: trusted device record (no OTP echoed).
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [OTPVerifyUserThrottle]

    @extend_schema(
        tags=["Auth"],
        request=DeviceVerificationVerifySerializer,
        responses={200: TrustedDeviceSerializer},
    )
    def post(self, request):
        serializer = DeviceVerificationVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device_info = build_device_info(serializer.get_device_info(), request)

        device = verify_device_otp(
            request.user,
            serializer.validated_data["otp"],
            device_info,
        )

        return Response(TrustedDeviceSerializer(device).data)


class ForgotPasswordView(APIView):
    """Request password reset OTP (does not reveal whether email exists)."""

    permission_classes = [AllowAny]
    throttle_classes = [ForgotPasswordAnonThrottle]

    @extend_schema(tags=["Auth"], request=ForgotPasswordSerializer, responses={200: None})
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        forgot_password(serializer.validated_data["email"])
        
        return Response(status=200)


class ResetPasswordView(APIView):
    """Reset password using OTP."""

    permission_classes = [AllowAny]
    throttle_classes = [ResetPasswordAnonThrottle]

    @extend_schema(tags=["Auth"], request=ResetPasswordSerializer, responses={204: None})
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_password(
            serializer.validated_data["otp"],
            serializer.validated_data["new_password"],
        )
        return Response(status=204)



class ChangePasswordView(generics.UpdateAPIView):
    """Change the password of the authenticated user."""

    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        change_password(
            self.request.user,
            serializer.validated_data["old_password"],
            serializer.validated_data["new_password"],
            actor=self.request.user,
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        return Response({"detail": "Password changed successfully."})
