from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth import login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from .models import User, ClientProfile, FreelancerProfile, Wallet
from .forms import (
    UserRegistrationForm, UserLoginForm, UserUpdateForm,
    ClientProfileForm, FreelancerProfileForm, WalletDepositForm
)

class RegisterView(View):
    template_name = 'accounts/register.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard:index')
        form = UserRegistrationForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to UniWork, {user.first_name}! Your account has been created.")
            return redirect('dashboard:index')
        return render(request, self.template_name, {'form': form})


class LoginView(View):
    template_name = 'accounts/login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard:index')
        form = UserLoginForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = UserLoginForm(request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.display_name}!")
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('dashboard:index')
        return render(request, self.template_name, {'form': form})


class LogoutView(View):
    def get(self, request):
        logout(request)
        messages.info(request, "You have been logged out.")
        return redirect('core:home')

    def post(self, request):
        logout(request)
        messages.info(request, "You have been logged out.")
        return redirect('core:home')


class ProfileEditView(LoginRequiredMixin, View):
    template_name = 'accounts/profile_edit.html'

    def get(self, request):
        user_form = UserUpdateForm(instance=request.user)
        client_form = None
        freelancer_form = None

        if request.user.is_client:
            client_profile, _ = ClientProfile.objects.get_or_create(user=request.user)
            client_form = ClientProfileForm(instance=client_profile)
        if request.user.is_freelancer:
            freelancer_profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
            freelancer_form = FreelancerProfileForm(instance=freelancer_profile)

        return render(request, self.template_name, {
            'user_form': user_form,
            'client_form': client_form,
            'freelancer_form': freelancer_form,
        })

    def post(self, request):
        user_form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        client_form = None
        freelancer_form = None

        forms_valid = user_form.is_valid()

        if request.user.is_client:
            client_profile, _ = ClientProfile.objects.get_or_create(user=request.user)
            client_form = ClientProfileForm(request.POST, instance=client_profile)
            if not client_form.is_valid():
                forms_valid = False

        if request.user.is_freelancer:
            freelancer_profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
            freelancer_form = FreelancerProfileForm(request.POST, request.FILES, instance=freelancer_profile)
            if not freelancer_form.is_valid():
                forms_valid = False

        if forms_valid:
            user_form.save()
            if client_form:
                client_form.save()
            if freelancer_form:
                freelancer_form.save()
            messages.success(request, "Your profile has been updated successfully.")
            return redirect('accounts:profile_edit')

        return render(request, self.template_name, {
            'user_form': user_form,
            'client_form': client_form,
            'freelancer_form': freelancer_form,
        })


class FreelancerDetailView(View):
    """Public detail page for a Freelancer."""
    def get(self, request, pk):
        freelancer_user = get_object_or_404(User, pk=pk, is_freelancer=True)
        profile, _ = FreelancerProfile.objects.get_or_create(user=freelancer_user)
        completed_contracts = freelancer_user.freelancer_contracts.filter(status='completed')[:5]
        return render(request, 'accounts/freelancer_detail.html', {
            'freelancer': freelancer_user,
            'profile': profile,
            'completed_contracts': completed_contracts,
        })


class ClientDetailView(View):
    """Public detail page for a Client."""
    def get(self, request, pk):
        client_user = get_object_or_404(User, pk=pk, is_client=True)
        profile, _ = ClientProfile.objects.get_or_create(user=client_user)
        open_jobs = client_user.posted_jobs.filter(status='open')
        return render(request, 'accounts/client_detail.html', {
            'client_user': client_user,
            'profile': profile,
            'open_jobs': open_jobs,
        })


class WalletView(LoginRequiredMixin, View):
    """Simulated Escrow & Ledger balance view with deposit action."""
    template_name = 'accounts/wallet.html'

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        transactions = wallet.transactions.all()
        deposit_form = WalletDepositForm()
        return render(request, self.template_name, {
            'wallet': wallet,
            'transactions': transactions,
            'deposit_form': deposit_form
        })

    def post(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        deposit_form = WalletDepositForm(request.POST)
        if deposit_form.is_valid():
            amount = deposit_form.cleaned_data['amount']
            desc = deposit_form.cleaned_data['description'] or "Simulated Wallet Top-Up"
            wallet.deposit(amount, description=desc)
            messages.success(request, f"Successfully deposited ${amount:.2f} into your simulated wallet.")
            return redirect('accounts:wallet')

        transactions = wallet.transactions.all()
        return render(request, self.template_name, {
            'wallet': wallet,
            'transactions': transactions,
            'deposit_form': deposit_form
        })
