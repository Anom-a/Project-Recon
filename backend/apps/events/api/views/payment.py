from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.events.api.permissions import IsEventStaff
from apps.events.api.serializers import (
    CashPaymentSerializer,
    EventPaymentSerializer,
    OnlinePaymentInitializeSerializer,
    OnlinePaymentVerifySerializer,
)
from apps.events.services.event_payment_service import (
    initialize_online_payment,
    record_cash_payment,
    verify_online_payment,
)
from apps.events.services.registration_service import get_registration_or_404


class AdminCashPaymentView(generics.CreateAPIView):
    permission_classes = [IsEventStaff]

    @extend_schema(tags=["Events - Admin - Payments"])
    def create(self, request, *args, **kwargs):
        registration = get_registration_or_404(kwargs["pk"])
        serializer = CashPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = record_cash_payment(
            registration,
            serializer.validated_data["amount"],
            actor=request.user,
            payment_date=serializer.validated_data.get("payment_date"),
        )
        return Response(
            EventPaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )


class AdminOnlinePaymentInitializeView(generics.CreateAPIView):
    permission_classes = [IsEventStaff]

    @extend_schema(tags=["Events - Admin - Payments"])
    def create(self, request, *args, **kwargs):
        registration = get_registration_or_404(kwargs["pk"])
        serializer = OnlinePaymentInitializeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        customer = {
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        }

        payment, checkout_url = initialize_online_payment(
            registration,
            serializer.validated_data["amount"],
            callback_url=serializer.validated_data["callback_url"],
            return_url=serializer.validated_data.get("return_url"),
            customer=customer,
            actor=request.user,
        )
        return Response(
            {
                "payment": EventPaymentSerializer(payment).data,
                "checkout_url": checkout_url,
            },
            status=status.HTTP_201_CREATED,
        )


class OnlinePaymentVerifyView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    @extend_schema(tags=["Events - Payments"])
    def create(self, request, *args, **kwargs):
        serializer = OnlinePaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = verify_online_payment(
            reference=serializer.validated_data["reference"]
        )
        return Response(EventPaymentSerializer(payment).data)


class OnlinePaymentWebhookView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    @extend_schema(tags=["Events - Payments"])
    def create(self, request, *args, **kwargs):
        reference = (
            request.data.get("tx_ref")
            or request.data.get("reference")
        )
        if reference:
            try:
                verify_online_payment(reference=reference)
            except Exception as e:
                logger = __import__("logging").getLogger(__name__)
                logger.error("Webhook verification error: %s", e)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
