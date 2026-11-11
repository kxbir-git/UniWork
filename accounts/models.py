from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

class CustomUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model where email is the primary unique identifier.
    Users specify their primary role: Client or Freelancer.
    """
    username = None  # Remove username field
    email = models.EmailField('email address', unique=True)
    is_client = models.BooleanField(default=False, help_text="Designates whether the user posts jobs as a Client.")
    is_freelancer = models.BooleanField(default=False, help_text="Designates whether the user bids on jobs as a Freelancer.")
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True, help_text="City, Country or University Campus")
    profile_image = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    @property
    def display_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email.split('@')[0]

    @property
    def role_label(self):
        if self.is_client and self.is_freelancer:
            return "Client & Freelancer"
        elif self.is_client:
            return "Client"
        elif self.is_freelancer:
            return "Freelancer"
        elif self.is_superuser:
            return "Administrator"
        return "Member"


class ClientProfile(models.Model):
    """Profile data specific to clients who hire freelancers and fund contracts."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    company_name = models.CharField(max_length=150, blank=True, null=True, help_text="Company, Lab, or Startup Name")
    website = models.URLField(blank=True, null=True)
    overview = models.TextField(blank=True, null=True, help_text="About the organization or client")
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Client: {self.company_name or self.user.display_name}"


class FreelancerProfile(models.Model):
    """Profile data specific to students/freelancers offering services."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    title = models.CharField(max_length=150, blank=True, null=True, help_text="e.g., Full Stack Python Developer, UI/UX Designer")
    overview = models.TextField(blank=True, null=True, help_text="Professional summary, experience, and background")
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('25.00'))
    skills = models.ManyToManyField('marketplace.Skill', blank=True, related_name='freelancers')
    portfolio_url = models.URLField(blank=True, null=True, help_text="Link to GitHub, personal portfolio, or Behance")
    portfolio_file = models.FileField(upload_to='portfolios/', blank=True, null=True, help_text="Resume or portfolio PDF")
    connects = models.PositiveIntegerField(default=30, help_text="Virtual tokens used to submit proposals (simulated)")
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    completed_jobs_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Freelancer: {self.user.display_name} - {self.title or 'Specialist'}"


class Wallet(models.Model):
    """Simulated Escrow & Balance Ledger for testing platform transactions."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('500.00'), help_text="Available balance in USD")
    escrow_held = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="Funds locked in active escrow")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Wallet (${self.balance:.2f})"

    def deposit(self, amount, description="Funds Deposit"):
        amount = Decimal(str(amount))
        self.balance += amount
        self.save()
        Transaction.objects.create(
            wallet=self,
            amount=amount,
            transaction_type=Transaction.TYPE_DEPOSIT,
            description=description
        )
        return self.balance

    def withdraw(self, amount, description="Funds Withdrawal"):
        amount = Decimal(str(amount))
        if self.balance < amount:
            raise ValueError("Insufficient balance in wallet.")
        self.balance -= amount
        self.save()
        Transaction.objects.create(
            wallet=self,
            amount=-amount,
            transaction_type=Transaction.TYPE_WITHDRAWAL,
            description=description
        )
        return self.balance


class Transaction(models.Model):
    """Audit ledger for all simulated funds movement."""
    TYPE_DEPOSIT = 'deposit'
    TYPE_WITHDRAWAL = 'withdrawal'
    TYPE_ESCROW_LOCK = 'escrow_lock'
    TYPE_ESCROW_RELEASE = 'escrow_release'
    TYPE_PROPOSAL_FEE = 'proposal_fee'

    TYPE_CHOICES = [
        (TYPE_DEPOSIT, 'Funds Deposit'),
        (TYPE_WITHDRAWAL, 'Withdrawal'),
        (TYPE_ESCROW_LOCK, 'Escrow Hold'),
        (TYPE_ESCROW_RELEASE, 'Milestone Escrow Payout'),
        (TYPE_PROPOSAL_FEE, 'Connects/Proposal Submission Fee'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=25, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.wallet.user.email} - {self.get_transaction_type_display()}: ${self.amount}"


@receiver(post_save, sender=User)
def create_user_profile_and_wallet(sender, instance, created, **kwargs):
    """Automatically create associated profiles and a demo wallet upon User creation."""
    if created:
        Wallet.objects.get_or_create(user=instance)
        if instance.is_client:
            ClientProfile.objects.get_or_create(user=instance)
        if instance.is_freelancer:
            FreelancerProfile.objects.get_or_create(user=instance)
