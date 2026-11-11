from django.test import TestCase, Client
from django.urls import reverse
from accounts.models import User, ClientProfile, FreelancerProfile, Wallet
from marketplace.models import Job, Category, Skill, Proposal
from contracts.models import Contract, Milestone
from decimal import Decimal

class UniWorkSystemTests(TestCase):
    def setUp(self):
        # Create category
        self.category = Category.objects.create(name="Computer Science", slug="cs", icon="bi-laptop")
        self.skill = Skill.objects.create(name="Python", category=self.category)

        # Create Client
        self.client_user = User.objects.create_user(
            email="testclient@uniwork.local",
            password="TestPassword123!",
            first_name="Test",
            last_name="Client",
            is_client=True
        )
        self.client_profile = self.client_user.client_profile
        self.client_profile.company_name = "Test Lab"
        self.client_profile.save()
        self.client_wallet = self.client_user.wallet

        # Create Freelancer
        self.freelancer_user = User.objects.create_user(
            email="testfreelancer@uniwork.local",
            password="TestPassword123!",
            first_name="Test",
            last_name="Freelancer",
            is_freelancer=True
        )
        self.freelancer_profile = self.freelancer_user.freelancer_profile
        self.freelancer_profile.title = "Django Specialist"
        self.freelancer_profile.hourly_rate = Decimal("30.00")
        self.freelancer_profile.save()
        self.freelancer_profile.skills.add(self.skill)
        self.freelancer_wallet = self.freelancer_user.wallet

        # Create Job
        self.job = Job.objects.create(
            client=self.client_user,
            title="Django Testing Job",
            category=self.category,
            description="Need unit test suite and clean code.",
            budget_type=Job.BUDGET_FIXED,
            budget_min=Decimal("100.00"),
            budget_max=Decimal("200.00"),
            status=Job.STATUS_OPEN
        )
        self.job.skills_required.add(self.skill)

        # Create Proposal
        self.proposal = Proposal.objects.create(
            job=self.job,
            freelancer=self.freelancer_user,
            cover_letter="I am very qualified for this testing job.",
            bid_amount=Decimal("150.00"),
            estimated_days=5,
            status=Proposal.STATUS_PENDING
        )

        self.http_client = Client()

    def test_public_pages_load(self):
        """Verify public marketing and browsing pages return HTTP 200."""
        urls = [
            reverse('core:home'),
            reverse('core:about'),
            reverse('core:how_it_works'),
            reverse('accounts:login'),
            reverse('accounts:register'),
            reverse('marketplace:job_list'),
            reverse('marketplace:job_detail', kwargs={'pk': self.job.pk}),
        ]
        for url in urls:
            response = self.http_client.get(url)
            self.assertEqual(response.status_code, 200, f"URL {url} failed with status {response.status_code}")

    def test_client_flow_and_proposal_acceptance(self):
        """Verify client can accept proposal and contract is initialized."""
        self.http_client.login(email="testclient@uniwork.local", password="TestPassword123!")

        # Check client dashboard
        response = self.http_client.get(reverse('dashboard:client_dashboard'))
        self.assertEqual(response.status_code, 200)

        # Accept proposal
        action_url = reverse('marketplace:proposal_action', kwargs={'proposal_id': self.proposal.id, 'action': 'accept'})
        response = self.http_client.post(action_url)
        
        # Verify redirect to contract room
        self.assertEqual(response.status_code, 302)
        contract = Contract.objects.filter(job=self.job).first()
        self.assertIsNotNone(contract)
        self.assertEqual(contract.status, Contract.STATUS_ACTIVE)
        self.assertEqual(contract.total_amount, Decimal("150.00"))

        # Verify job status changed to in_progress
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, Job.STATUS_IN_PROGRESS)

    def test_milestone_approval_and_escrow_release(self):
        """Verify milestone approval releases simulated funds to freelancer wallet."""
        contract = Contract.objects.create(
            job=self.job,
            client=self.client_user,
            freelancer=self.freelancer_user,
            total_amount=Decimal("150.00"),
            status=Contract.STATUS_ACTIVE
        )
        milestone = Milestone.objects.create(
            contract=contract,
            title="Milestone 1 Deliverable",
            amount=Decimal("150.00"),
            status=Milestone.STATUS_SUBMITTED
        )

        initial_freelancer_balance = self.freelancer_wallet.balance

        self.http_client.login(email="testclient@uniwork.local", password="TestPassword123!")
        approve_url = reverse('contracts:milestone_approve', kwargs={'milestone_id': milestone.id})
        response = self.http_client.post(approve_url)
        self.assertEqual(response.status_code, 302)

        milestone.refresh_from_db()
        self.assertTrue(milestone.is_approved)

        self.freelancer_wallet.refresh_from_db()
        self.assertEqual(self.freelancer_wallet.balance, initial_freelancer_balance + Decimal("150.00"))
