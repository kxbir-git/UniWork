from django.contrib import admin
from .models import Category, Skill, Job, Proposal

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'active_jobs_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('category',)
    search_fields = ('name',)

class ProposalInline(admin.TabularInline):
    model = Proposal
    extra = 0
    fields = ('freelancer', 'bid_amount', 'estimated_days', 'status', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'category', 'budget_type', 'budget_min', 'budget_max', 'status', 'created_at')
    list_filter = ('status', 'budget_type', 'experience_level', 'category')
    search_fields = ('title', 'description', 'client__email')
    filter_horizontal = ('skills_required',)
    inlines = [ProposalInline]

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('job', 'freelancer', 'bid_amount', 'estimated_days', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('job__title', 'freelancer__email', 'cover_letter')
