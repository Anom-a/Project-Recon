from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.response import Response

from apps.accounts.permissions.roles import (
    user_is_branch_manager,
    user_is_super_admin,
)
from apps.events.api.permissions import (
    IsEventStaff,
    IsEventStaffOrInstructor,
)
from apps.events.api.serializers import WorkshopAdminSerializer
from apps.events.services.workshop_service import (
    create_workshop,
    delete_workshop,
    get_workshop_or_404,
    list_workshops,
    update_workshop,
)


class AdminWorkshopListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsEventStaffOrInstructor]
    serializer_class = WorkshopAdminSerializer

    @extend_schema(tags=["Events - Admin - Workshops"])
    def get_queryset(self):
        return list_workshops(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if not (
            user_is_super_admin(request.user) or user_is_branch_manager(request.user)
        ):
            return Response(
                {"detail": "You do not have permission to create a workshop."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workshop = create_workshop(serializer.validated_data, actor=request.user)
        return Response(
            WorkshopAdminSerializer(workshop).data,
            status=status.HTTP_201_CREATED,
        )


class AdminWorkshopRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsEventStaffOrInstructor]
    serializer_class = WorkshopAdminSerializer
    lookup_url_kwarg = "pk"

    @extend_schema(tags=["Events - Admin - Workshops"])
    def get_object(self):
        workshop = get_workshop_or_404(self.kwargs["pk"])
        self.check_object_permissions(self.request, workshop)
        return workshop

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        workshop = self.get_object()
        serializer = self.get_serializer(workshop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        workshop = update_workshop(workshop, serializer.validated_data, actor=request.user)
        return Response(WorkshopAdminSerializer(workshop).data)

    def destroy(self, request, *args, **kwargs):
        workshop = self.get_object()
        if not (
            user_is_super_admin(request.user) or user_is_branch_manager(request.user)
        ):
            return Response(
                {"detail": "You do not have permission to delete a workshop."},
                status=status.HTTP_403_FORBIDDEN,
            )
        delete_workshop(workshop, actor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
