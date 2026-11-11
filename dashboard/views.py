from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from marketplace.models import Job, Proposal
from contracts.models import Contract, Milestone
from accounts.models import Wallet, Transaction

class DashboardIndexView(LoginRequiredMixin, View):
    """Router that directs user to their primary role-based dashboard."""
    def get(self, request):
        if request.user.is_client:
            return redirect('dashboard:client_dashboard')
        elif request.user.is_freelancer:
            return redirect('dashboard:freelancer_dashboard')
        elif request.user.is_staff:
            return redirect('admin:index')
        return redirect('accounts:profile_edit')


class ClientDashboardView(LoginRequiredMixin, View):
    template_name = 'dashboard/client_dashboard.html'

    def get(self, request):
        if not request.user.is_client and not request.user.is_staff:
            return redirect('dashboard:freelancer_dashboard')

        user = request.user
        posted_jobs = user.posted_jobs.select_related('category').prefetch_related('proposals').all()
        active_jobs = posted_jobs.filter(status='open')
        in_progress_jobs = posted_jobs.filter(status='in_progress')
        completed_jobs = posted_jobs.filter(status='completed')

        contracts = Contract.objects.filter(client=user).select_related('freelancer', 'job').all()
        active_contracts = contracts.filter(status='active')

        # Count proposals requiring review
        pending_proposals_count = Proposal.objects.filter(job__client=user, status='pending').count()

        wallet, _ = Wallet.objects.get_or_create(user=user)
        recent_transactions = wallet.transactions.all()[:5]

        client_profile = getattr(user, 'client_profile', None)

        return render(request, self.template_name, {
            'posted_jobs': posted_jobs[:6],
            'active_jobs_count': active_jobs.count(),
            'in_progress_jobs_count': in_progress_jobs.count(),
            'completed_jobs_count': completed_jobs.count(),
            'active_contracts': active_contracts,
            'pending_proposals_count': pending_proposals_count,
            'wallet': wallet,
            'recent_transactions': recent_transactions,
            'client_profile': client_profile,
        })


class FreelancerDashboardView(LoginRequiredMixin, View):
    template_name = 'dashboard/freelancer_dashboard.html'

    def get(self, request):
        if not request.user.is_freelancer and not request.user.is_staff:
            return redirect('dashboard:client_dashboard')

        user = request.user
        proposals = Proposal.objects.filter(freelancer=user).select_related('job', 'job__client', 'job__category')
        active_proposals = proposals.filter(status='pending')
        accepted_proposals = proposals.filter(status='accepted')

        contracts = Contract.objects.filter(freelancer=user).select_related('client', 'job')
        active_contracts = contracts.filter(status='active')
        completed_contracts = contracts.filter(status='completed')

        # Milestones currently pending submission
        pending_milestones = Milestone.objects.filter(
            contract__freelancer=user,
            is_approved=False
        ).select_related('contract', 'contract__job')

        wallet, _ = Wallet.objects.get_or_create(user=user)
        recent_transactions = wallet.transactions.all()[:5]
        freelancer_profile = getattr(user, 'freelancer_profile', None)

        return render(request, self.template_name, {
            'proposals': proposals[:6],
            'active_proposals_count': active_proposals.count(),
            'accepted_proposals_count': accepted_proposals.count(),
            'active_contracts': active_contracts,
            'completed_contracts_count': completed_contracts.count(),
            'pending_milestones': pending_milestones[:5],
            'wallet': wallet,
            'recent_transactions': recent_transactions,
            'freelancer_profile': freelancer_profile,
        })
