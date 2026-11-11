from django.contrib import admin
from .models import Contract, Milestone, WorkSubmission

class MilestoneInline(admin.TabularInline):
    model = Milestone
    extra = 1
    fields = ('title', 'amount', 'due_date', 'status', 'is_approved')

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'client', 'freelancer', 'total_amount', 'amount_paid', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('job__title', 'client__email', 'freelancer__email')
    inlines = [MilestoneInline]

class WorkSubmissionInline(admin.StackedInline):
    model = WorkSubmission
    extra = 0
    readonly_fields = ('submitted_at',)

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'contract', 'amount', 'due_date', 'status', 'is_approved')
    list_filter = ('status', 'is_approved', 'due_date')
    search_fields = ('title', 'description', 'contract__job__title')
    inlines = [WorkSubmissionInline]

@admin.register(WorkSubmission)
class WorkSubmissionAdmin(admin.ModelAdmin):
    list_display = ('milestone', 'freelancer', 'submitted_at', 'attachment')
    list_filter = ('submitted_at',)
    search_fields = ('milestone__title', 'freelancer__email', 'work_notes')
