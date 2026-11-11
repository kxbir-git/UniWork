from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone
from accounts.models import Transaction

class Contract(models.Model):
    """
    Binding freelance engagement created when a Client accepts a proposal.
    Encapsulates escrow funds and milestone milestones.
    """
    STATUS_ACTIVE = 'active'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active / In Progress'),
        (STATUS_COMPLETED, 'Completed & Closed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    job = models.OneToOneField(
        'marketplace.Job',
        on_delete=models.CASCADE,
        related_name='contract'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_contracts'
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='freelancer_contracts'
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Contract #{self.id}: {self.job.title} - ${self.total_amount:.2f}"

    @property
    def progress_percentage(self):
        total = self.milestones.count()
        if total == 0:
            return 0
        approved = self.milestones.filter(is_approved=True).count()
        return int((approved / total) * 100)

    @property
    def all_milestones_approved(self):
        milestones = self.milestones.all()
        return milestones.exists() and not milestones.filter(is_approved=False).exists()


class Milestone(models.Model):
    """
    Project phase or deliverable with dedicated escrow allocation.
    """
    STATUS_PENDING = 'pending'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_SUBMITTED = 'submitted'
    STATUS_APPROVED = 'approved'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Start'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_SUBMITTED, 'Work Submitted / Under Review'),
        (STATUS_APPROVED, 'Approved & Paid'),
    ]

    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_PENDING)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"Milestone: {self.title} (${self.amount:.2f}) - {self.get_status_display()}"

    def approve_and_release_funds(self):
        """
        Simulated Escrow Release:
        1. Increments freelancer's wallet balance.
        2. Increments client's total_spent.
        3. Updates contract's amount_paid.
        4. Logs transaction in the ledger.
        5. Checks if contract is 100% complete.
        """
        if self.is_approved:
            return False

        self.is_approved = True
        self.status = self.STATUS_APPROVED
        self.approved_at = timezone.now()
        self.save()

        # Update contract amount paid
        self.contract.amount_paid += self.amount
        self.contract.save()

        # Credit freelancer's wallet
        freelancer_wallet, _ = self.contract.freelancer.wallet, None
        freelancer_wallet.balance += self.amount
        freelancer_wallet.save()

        # Record transaction for freelancer
        Transaction.objects.create(
            wallet=freelancer_wallet,
            amount=self.amount,
            transaction_type=Transaction.TYPE_ESCROW_RELEASE,
            description=f"Escrow release for milestone: '{self.title}' (Job: {self.contract.job.title})"
        )

        # Update FreelancerProfile earnings & completed count
        if hasattr(self.contract.freelancer, 'freelancer_profile'):
            fp = self.contract.freelancer.freelancer_profile
            fp.total_earned += self.amount
            fp.save()

        # Update Client total_spent
        if hasattr(self.contract.client, 'client_profile'):
            cp = self.contract.client.client_profile
            cp.total_spent += self.amount
            cp.save()

        # If all milestones are approved, finalize the contract and job
        if self.contract.all_milestones_approved:
            self.contract.status = Contract.STATUS_COMPLETED
            self.contract.completed_at = timezone.now()
            self.contract.save()

            job = self.contract.job
            job.status = job.STATUS_COMPLETED
            job.save()

            if hasattr(self.contract.freelancer, 'freelancer_profile'):
                fp = self.contract.freelancer.freelancer_profile
                fp.completed_jobs_count += 1
                fp.save()

        return True


class WorkSubmission(models.Model):
    """
    Deliverables submitted by a Freelancer for review against a milestone.
    """
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, related_name='submissions')
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='work_submissions'
    )
    work_notes = models.TextField(help_text="Detailed summary of completed deliverable.")
    attachment = models.FileField(upload_to='submissions/', blank=True, null=True, help_text="Upload code zip, documentation, or design files")
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Submission for {self.milestone.title} at {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"
