from django.db import models
from django.conf import settings
from django.utils.text import slugify
from decimal import Decimal

class Category(models.Model):
    """Job categories (e.g. Web Development, AI & ML, Tutoring, Design)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='bi-briefcase', help_text="Bootstrap icon class (e.g. bi-code-slash, bi-palette)")

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def active_jobs_count(self):
        return self.jobs.filter(status=Job.STATUS_OPEN).count()


class Skill(models.Model):
    """Specific skill tags (e.g., Python, Django, Figma, PyTorch)."""
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='skills')

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Job(models.Model):
    """Job postings created by Clients seeking student/freelance talent."""
    BUDGET_FIXED = 'fixed'
    BUDGET_HOURLY = 'hourly'
    BUDGET_TYPE_CHOICES = [
        (BUDGET_FIXED, 'Fixed Price'),
        (BUDGET_HOURLY, 'Hourly Rate ($/hr)'),
    ]

    STATUS_OPEN = 'open'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open for Proposals'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    EXPERIENCE_ENTRY = 'entry'
    EXPERIENCE_INTERMEDIATE = 'intermediate'
    EXPERIENCE_EXPERT = 'expert'
    EXPERIENCE_CHOICES = [
        (EXPERIENCE_ENTRY, 'Entry Level (Beginner friendly)'),
        (EXPERIENCE_INTERMEDIATE, 'Intermediate'),
        (EXPERIENCE_EXPERT, 'Expert / Advanced'),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_jobs'
    )
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='jobs')
    description = models.TextField()
    skills_required = models.ManyToManyField(Skill, blank=True, related_name='jobs')
    
    budget_type = models.CharField(max_length=10, choices=BUDGET_TYPE_CHOICES, default=BUDGET_FIXED)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('50.00'))
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('250.00'))
    
    experience_level = models.CharField(max_length=15, choices=EXPERIENCE_CHOICES, default=EXPERIENCE_INTERMEDIATE)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_OPEN)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (${self.budget_display})"

    @property
    def budget_display(self):
        if self.budget_type == self.BUDGET_FIXED:
            if self.budget_min == self.budget_max:
                return f"${self.budget_min:.0f}"
            return f"${self.budget_min:.0f} - ${self.budget_max:.0f}"
        else:
            return f"${self.budget_min:.0f} - ${self.budget_max:.0f}/hr"

    @property
    def proposals_count(self):
        return self.proposals.count()


class Proposal(models.Model):
    """Bid proposal submitted by a Freelancer on a Job."""
    STATUS_PENDING = 'pending'
    STATUS_SHORTLISTED = 'shortlisted'
    STATUS_ACCEPTED = 'accepted'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Review'),
        (STATUS_SHORTLISTED, 'Shortlisted'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='proposals')
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_proposals'
    )
    cover_letter = models.TextField(help_text="Introduce yourself and explain why you are best fit for this project.")
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total bid price (Fixed) or hourly estimate")
    estimated_days = models.PositiveIntegerField(default=7, help_text="Estimated delivery time in days")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('job', 'freelancer')

    def __str__(self):
        return f"Proposal by {self.freelancer.display_name} on '{self.job.title}' (${self.bid_amount})"
