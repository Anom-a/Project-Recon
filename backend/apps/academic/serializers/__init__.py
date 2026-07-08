from apps.academic.serializers.program import ProgramSerializer, ProgramListSerializer
from apps.academic.serializers.sub_program import SubProgramSerializer, SubProgramListSerializer
from apps.academic.serializers.class_serializer import (
    ClassSerializer,
    ClassListSerializer,
    AssignInstructorSerializer,
)
from apps.academic.serializers.student import (
    StudentSerializer,
    StudentListSerializer,
    StudentUpdateSerializer,
)
from apps.academic.serializers.admission import AdmitStudentSerializer

__all__ = [
    "ProgramSerializer",
    "ProgramListSerializer",
    "SubProgramSerializer",
    "SubProgramListSerializer",
    "ClassSerializer",
    "ClassListSerializer",
    "AssignInstructorSerializer",
    "StudentSerializer",
    "StudentListSerializer",
    "StudentUpdateSerializer",
    "AdmitStudentSerializer",
]
