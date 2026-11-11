from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.utils import timezone
from .models import Contract, Milestone, WorkSubmission
from .forms import MilestoneForm, WorkSubmissionForm
from messaging.models import Message

class ContractListView(LoginRequiredMixin, View):
    """List all contracts associated with the logged-in user (as client or freelancer)."""
    template_name = 'contracts/contract_list.html'

    def get(self, request):
        if request.user.is_client:
            contracts = Contract.objects.filter(client=request.user).select_related('job', 'freelancer')
        else:
            contracts = Contract.objects.filter(freelancer=request.user).select_related('job', 'client')

        status_filter = request.GET.get('status')
        if status_filter:
            contracts = contracts.filter(status=status_filter)

        return render(request, self.template_name, {
            'contracts': contracts,
            'selected_status': status_filter
        })


class ContractRoomView(LoginRequiredMixin, View):
    """
    Central Workspace for Client and Freelancer:
    - Milestone tracking & timeline
    - Work submission interface
    - Simulated Escrow release actions
    - Threaded direct messaging
    """
    template_name = 'contracts/contract_room.html'

    def get_contract(self, request, pk):
        contract = get_object_or_404(
            Contract.objects.select_related('job', 'client', 'freelancer'),
            pk=pk
        )
        if request.user != contract.client and request.user != contract.freelancer and not request.user.is_staff:
            return None
        return contract

    def get(self, request, pk):
        contract = self.get_contract(request, pk)
        if not contract:
            messages.error(request, "Access denied: You are not a participant in this contract.")
            return redirect('dashboard:index')

        milestones = contract.milestones.prefetch_related('submissions').all()
        contract_messages = contract.messages.select_related('sender').all()
        submission_form = WorkSubmissionForm()
        milestone_form = MilestoneForm()

        is_client = (request.user == contract.client)
        is_freelancer = (request.user == contract.freelancer)

        return render(request, self.template_name, {
            'contract': contract,
            'milestones': milestones,
            'contract_messages': contract_messages,
            'submission_form': submission_form,
            'milestone_form': milestone_form,
            'is_client': is_client,
            'is_freelancer': is_freelancer,
        })


class MilestoneCreateView(LoginRequiredMixin, View):
    """Add a new milestone to an active contract."""
    def post(self, request, pk):
        contract = get_object_or_404(Contract, pk=pk)
        if request.user != contract.client and request.user != contract.freelancer:
            messages.error(request, "Permission denied.")
            return redirect('dashboard:index')

        form = MilestoneForm(request.POST)
        if form.is_valid():
            milestone = form.save(commit=False)
            milestone.contract = contract
            milestone.status = Milestone.STATUS_IN_PROGRESS
            milestone.save()
            messages.success(request, f"New milestone '{milestone.title}' added to the contract.")
        else:
            messages.error(request, "Could not add milestone. Please check form values.")
        return redirect('contracts:contract_room', pk=contract.id)


class WorkSubmissionCreateView(LoginRequiredMixin, View):
    """Freelancer submits deliverable for review on a milestone."""
    def post(self, request, milestone_id):
        milestone = get_object_or_404(Milestone, pk=milestone_id)
        contract = milestone.contract

        if request.user != contract.freelancer:
            messages.error(request, "Only the hired freelancer can submit work.")
            return redirect('contracts:contract_room', pk=contract.id)

        form = WorkSubmissionForm(request.POST, request.FILES)
        if form.is_valid():
            submission = form.save(commit=False)
            submission.milestone = milestone
            submission.freelancer = request.user
            submission.save()

            milestone.status = Milestone.STATUS_SUBMITTED
            milestone.save()

            # Post a system notification message in chat
            Message.objects.create(
                contract=contract,
                sender=request.user,
                recipient=contract.client,
                content=f"[SYSTEM NOTIFICATION] Work submitted for milestone: '{milestone.title}'. Notes: {submission.work_notes[:100]}"
            )

            messages.success(request, f"Deliverable submitted for milestone '{milestone.title}'. Awaiting client review.")
        else:
            messages.error(request, "Error submitting work. Please review inputs.")

        return redirect('contracts:contract_room', pk=contract.id)


class MilestoneApproveView(LoginRequiredMixin, View):
    """Client approves milestone deliverable and releases escrow funds."""
    def post(self, request, milestone_id):
        milestone = get_object_or_404(Milestone, pk=milestone_id)
        contract = milestone.contract

        if request.user != contract.client:
            messages.error(request, "Only the client who funded this contract can approve milestones.")
            return redirect('contracts:contract_room', pk=contract.id)

        if milestone.is_approved:
            messages.info(request, "This milestone has already been approved and paid.")
            return redirect('contracts:contract_room', pk=contract.id)

        success = milestone.approve_and_release_funds()
        if success:
            # Post a notification in chat
            Message.objects.create(
                contract=contract,
                sender=request.user,
                recipient=contract.freelancer,
                content=f"[ESCROW RELEASED] Milestone '{milestone.title}' was approved! ${milestone.amount:.2f} has been deposited into your wallet."
            )
            messages.success(
                request,
                f"Milestone '{milestone.title}' approved! ${milestone.amount:.2f} released from escrow to {contract.freelancer.display_name}'s wallet."
            )
        else:
            messages.error(request, "Failed to approve milestone.")

        return redirect('contracts:contract_room', pk=contract.id)
