from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.academic.permissions.academic_report import CanViewReport, CanViewStaffReport
from apps.academic.serializers.academic_report import ReportQuerySerializer
from apps.academic.services import (
    class_service,
    program_service,
    student_service,
)
from apps.academic.services.academic_report_service import (
    generate_attendance_report,
    generate_certificate_report,
    generate_class_report,
    generate_enrollment_report,
    generate_program_report,
    generate_progress_report,
    generate_student_report,
    generate_sub_program_report,
)


class BaseReportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_pdf_response(self, pdf_bytes, filename):
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}.pdf"'
        return response

    def validate_query_params(self, request):
        serializer = ReportQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data


class StudentAcademicReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewReport]

    def get(self, request, pk):
        student = student_service.get_student_or_404(pk)
        self.check_object_permissions(request, student)
        pdf_bytes = generate_student_report(student.id)
        name = f"{student.user.first_name}_{student.user.last_name}".strip().replace(" ", "_") or "student"
        return self.get_pdf_response(pdf_bytes, f"academic_report_{name}")


class EnrollmentReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewReport]

    def get(self, request, pk):
        student = student_service.get_student_or_404(pk)
        self.check_object_permissions(request, student)
        pdf_bytes = generate_enrollment_report(student.id)
        name = f"{student.user.first_name}_{student.user.last_name}".strip().replace(" ", "_") or "student"
        return self.get_pdf_response(pdf_bytes, f"enrollment_history_{name}")


class AttendanceReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewReport]

    def get(self, request, pk):
        student = student_service.get_student_or_404(pk)
        self.check_object_permissions(request, student)
        params = self.validate_query_params(request)
        pdf_bytes = generate_attendance_report(
            student.id, enrollment_id=params.get("enrollment_id")
        )
        name = f"{student.user.first_name}_{student.user.last_name}".strip().replace(" ", "_") or "student"
        return self.get_pdf_response(pdf_bytes, f"attendance_summary_{name}")


class ProgressReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewReport]

    def get(self, request, pk):
        student = student_service.get_student_or_404(pk)
        self.check_object_permissions(request, student)
        params = self.validate_query_params(request)
        pdf_bytes = generate_progress_report(
            student.id, enrollment_id=params.get("enrollment_id")
        )
        name = f"{student.user.first_name}_{student.user.last_name}".strip().replace(" ", "_") or "student"
        return self.get_pdf_response(pdf_bytes, f"progress_summary_{name}")


class CertificateReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewReport]

    def get(self, request, pk):
        student = student_service.get_student_or_404(pk)
        self.check_object_permissions(request, student)
        pdf_bytes = generate_certificate_report(student.id)
        name = f"{student.user.first_name}_{student.user.last_name}".strip().replace(" ", "_") or "student"
        return self.get_pdf_response(pdf_bytes, f"certificates_{name}")


class ClassReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewStaffReport]

    def get(self, request, pk):
        klass = class_service.get_class_or_404(pk)
        self.check_object_permissions(request, klass)
        pdf_bytes = generate_class_report(klass.id)
        filename = f"class_report_{klass.name}".replace(" ", "_")
        return self.get_pdf_response(pdf_bytes, filename)


class SubProgramReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewStaffReport]

    def get(self, request, pk):
        sub = program_service.get_sub_program_or_404(pk)
        self.check_object_permissions(request, sub)
        pdf_bytes = generate_sub_program_report(sub.id)
        filename = f"sub_program_report_{sub.name}".replace(" ", "_")
        return self.get_pdf_response(pdf_bytes, filename)


class ProgramReportView(BaseReportView):
    permission_classes = [IsAuthenticated, CanViewStaffReport]

    def get(self, request, pk):
        prog = program_service.get_program_or_404(pk)
        self.check_object_permissions(request, prog)
        pdf_bytes = generate_program_report(prog.id)
        filename = f"program_report_{prog.name}".replace(" ", "_")
        return self.get_pdf_response(pdf_bytes, filename)
