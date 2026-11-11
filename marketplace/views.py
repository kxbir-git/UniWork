from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import Job, Proposal, Category, Skill
from .forms import JobForm, ProposalForm
from accounts.mixins import ClientRequiredMixin, FreelancerRequiredMixin
from contracts.models import Contract, Milestone
from accounts.models import Transaction

class JobListView(ListView):
    model = Job
    template_name = 'marketplace/job_list.html'
    context_object_name = 'jobs'
    paginate_by = 9

    def get_queryset(self):
        queryset = Job.objects.select_related('client', 'category').prefetch_related('skills_required').all()
        q = self.request.GET.get('q')
        category_slug = self.request.GET.get('category')
        budget_type = self.request.GET.get('budget_type')
        experience_level = self.request.GET.get('experience_level')
        status = self.request.GET.get('status', 'open')

        if status:
            queryset = queryset.filter(status=status)
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(skills_required__name__icontains=q)
            ).distinct()
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if budget_type:
            queryset = queryset.filter(budget_type=budget_type)
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['selected_category'] = self.request.GET.get('category', '')
        context['selected_budget_type'] = self.request.GET.get('budget_type', '')
        context['selected_experience'] = self.request.GET.get('experience_level', '')
        context['selected_status'] = self.request.GET.get('status', 'open')
        context['search_query'] = self.request.GET.get('q', '')
        return context


class JobDetailView(DetailView):
    model = Job
    template_name = 'marketplace/job_detail.html'
    context_object_name = 'job'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        job = self.object

        user_proposal = None
        has_applied = False
        can_apply = False

        if user.is_authenticated:
            if user.is_freelancer:
                user_proposal = Proposal.objects.filter(job=job, freelancer=user).first()
                has_applied = user_proposal is not None
                can_apply = not has_applied and job.status == Job.STATUS_OPEN
            context['is_owner'] = (user == job.client)
        else:
            can_apply = (job.status == Job.STATUS_OPEN)

        context['user_proposal'] = user_proposal
        context['has_applied'] = has_applied
        context['can_apply'] = can_apply
        context['other_jobs'] = Job.objects.filter(category=job.category, status='open').exclude(id=job.id)[:3]
        return context


class JobCreateView(ClientRequiredMixin, CreateView):
    model = Job
    form_class = JobForm
    template_name = 'marketplace/job_form.html'

    def form_valid(self, form):
        form.instance.client = self.request.user
        messages.success(self.request, "Your job has been posted successfully and is now open for bids!")
        return super().form_valid(form)

    def get_success_url(self):
        return self.object.get_absolute_url() if hasattr(self.object, 'get_absolute_url') else f"/jobs/{self.object.pk}/"


class JobUpdateView(ClientRequiredMixin, UpdateView):
    model = Job
    form_class = JobForm
    template_name = 'marketplace/job_form.html'

    def get_queryset(self):
        return Job.objects.filter(client=self.request.user)

    def form_valid(self, form):
        messages.success(self.request, "Job details updated successfully.")
        return super().form_valid(form)

    def get_success_url(self):
        return f"/jobs/{self.object.pk}/"


class ProposalSubmitView(FreelancerRequiredMixin, View):
    template_name = 'marketplace/proposal_form.html'

    def get(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        if job.status != Job.STATUS_OPEN:
            messages.warning(request, "This job is no longer accepting new proposals.")
            return redirect('marketplace:job_detail', pk=job.id)

        existing = Proposal.objects.filter(job=job, freelancer=request.user).first()
        if existing:
            messages.info(request, "You have already submitted a proposal for this job.")
            return redirect('marketplace:job_detail', pk=job.id)

        # Check connects or active proposal limit (5 active proposals limit as requested in prompt)
        active_count = Proposal.objects.filter(freelancer=request.user, status=Proposal.STATUS_PENDING).count()
        if active_count >= 10:
            messages.error(request, "You have reached the limit of active pending proposals (10). Wait for client responses before bidding again.")
            return redirect('marketplace:job_detail', pk=job.id)

        form = ProposalForm(initial={'bid_amount': job.budget_min})
        return render(request, self.template_name, {'job': job, 'form': form})

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        if job.status != Job.STATUS_OPEN:
            messages.warning(request, "This job is no longer accepting proposals.")
            return redirect('marketplace:job_detail', pk=job.id)

        if Proposal.objects.filter(job=job, freelancer=request.user).exists():
            messages.info(request, "You have already applied.")
            return redirect('marketplace:job_detail', pk=job.id)

        form = ProposalForm(request.POST)
        if form.is_valid():
            proposal = form.save(commit=False)
            proposal.job = job
            proposal.freelancer = request.user
            proposal.save()

            # Deduct 1 virtual connect from freelancer profile if available
            if hasattr(request.user, 'freelancer_profile'):
                fp = request.user.freelancer_profile
                if fp.connects > 0:
                    fp.connects -= 1
                    fp.save()

            messages.success(request, f"Your proposal of ${proposal.bid_amount:.2f} was submitted successfully!")
            return redirect('marketplace:job_detail', pk=job.id)

        return render(request, self.template_name, {'job': job, 'form': form})


class JobProposalsView(ClientRequiredMixin, View):
    """Client view to review all received proposals for a posted job."""
    template_name = 'marketplace/job_proposals.html'

    def get(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id, client=request.user)
        proposals = job.proposals.select_related('freelancer', 'freelancer__freelancer_profile').all()
        return render(request, self.template_name, {
            'job': job,
            'proposals': proposals
        })


class ProposalActionView(ClientRequiredMixin, View):
    """Client actions on a proposal: shortlist, reject, or accept (auto-generates Contract)."""
    def post(self, request, proposal_id, action):
        proposal = get_object_or_404(Proposal, pk=proposal_id, job__client=request.user)
        job = proposal.job

        if action == 'shortlist':
            proposal.status = Proposal.STATUS_SHORTLISTED
            proposal.save()
            messages.info(request, f"Proposal from {proposal.freelancer.display_name} has been shortlisted.")
            return redirect('marketplace:job_proposals', job_id=job.id)

        elif action == 'reject':
            proposal.status = Proposal.STATUS_REJECTED
            proposal.save()
            messages.warning(request, f"Proposal from {proposal.freelancer.display_name} has been rejected.")
            return redirect('marketplace:job_proposals', job_id=job.id)

        elif action == 'accept':
            # Check if job already has a contract
            if hasattr(job, 'contract'):
                messages.warning(request, "This job already has an active contract.")
                return redirect('contracts:contract_room', pk=job.contract.id)

            # Accept this proposal
            proposal.status = Proposal.STATUS_ACCEPTED
            proposal.save()

            # Reject other proposals
            job.proposals.exclude(id=proposal.id).update(status=Proposal.STATUS_REJECTED)

            # Update job status
            job.status = Job.STATUS_IN_PROGRESS
            job.save()

            # Create Contract
            contract = Contract.objects.create(
                job=job,
                client=request.user,
                freelancer=proposal.freelancer,
                total_amount=proposal.bid_amount,
                status=Contract.STATUS_ACTIVE
            )

            # Auto-create initial milestone
            due = timezone.now().date() + timedelta(days=proposal.estimated_days or 7)
            Milestone.objects.create(
                contract=contract,
                title="Full Project Deliverables & Final Submission",
                description=f"Scope as defined in proposal bid for '{job.title}'.",
                amount=proposal.bid_amount,
                due_date=due,
                status=Milestone.STATUS_IN_PROGRESS
            )

            # Simulated escrow hold on client wallet
            client_wallet = request.user.wallet
            if client_wallet.balance >= proposal.bid_amount:
                client_wallet.balance -= proposal.bid_amount
                client_wallet.escrow_held += proposal.bid_amount
                client_wallet.save()
                Transaction.objects.create(
                    wallet=client_wallet,
                    amount=-proposal.bid_amount,
                    transaction_type=Transaction.TYPE_ESCROW_LOCK,
                    description=f"Escrow hold for Contract #{contract.id}: {job.title}"
                )

            messages.success(request, f"Proposal accepted! Contract #{contract.id} is now active. Welcome to your Contract Room.")
            return redirect('contracts:contract_room', pk=contract.id)

        return redirect('marketplace:job_proposals', job_id=job.id)
