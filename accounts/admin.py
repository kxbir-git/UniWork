from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ClientProfile, FreelancerProfile, Wallet, Transaction

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_client', 'is_freelancer', 'is_staff', 'created_at')
    list_filter = ('is_client', 'is_freelancer', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'location')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'location', 'profile_image')}),
        ('Roles', {'fields': ('is_client', 'is_freelancer')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password', 'is_client', 'is_freelancer'),
        }),
    )

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'total_spent', 'created_at')
    search_fields = ('user__email', 'company_name')
    list_filter = ('created_at',)

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'hourly_rate', 'connects', 'total_earned', 'completed_jobs_count')
    search_fields = ('user__email', 'title', 'overview')
    list_filter = ('hourly_rate', 'created_at')
    filter_horizontal = ('skills',)

class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    readonly_fields = ('amount', 'transaction_type', 'description', 'created_at')
    can_delete = False

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'escrow_held', 'updated_at')
    search_fields = ('user__email',)
    inlines = [TransactionInline]

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'transaction_type', 'description', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('wallet__user__email', 'description')
