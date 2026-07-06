from django.contrib import admin
from apps.accounts.models import User, Branch, UserAssignment, OTPChallenge, TrustedDevice

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'status', 'is_email_verified', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_login')

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'city', 'status', 'created_at')
    search_fields = ('name', 'code', 'email', 'phone_number', 'city')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(UserAssignment)
class UserAssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'branch', 'role', 'is_primary', 'is_active', 'created_at')
    search_fields = ('user__email', 'branch__name', 'role')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(OTPChallenge)
class OTPChallengeAdmin(admin.ModelAdmin):
    list_display = ('user', 'purpose', 'is_used', 'expires_at', 'created_at')
    search_fields = ('user__email', 'purpose')
    readonly_fields = ('id', 'otp_code', 'created_at', 'updated_at')

@admin.register(TrustedDevice)
class TrustedDeviceAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_type', 'is_active', 'last_used_at', 'created_at')
    search_fields = ('user__email', 'device_id', 'fingerprint')
    readonly_fields = ('id', 'created_at', 'updated_at')
