from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.shortcuts import redirect
from django.contrib import messages

class ClientRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """Ensure that the logged-in user is registered as a Client."""
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_client

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return super().handle_no_permission()
        messages.error(self.request, "Access restricted: You must have a Client profile to perform this action.")
        return redirect('dashboard:index')


class FreelancerRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """Ensure that the logged-in user is registered as a Freelancer."""
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_freelancer

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return super().handle_no_permission()
        messages.error(self.request, "Access restricted: You must have a Freelancer profile to perform this action.")
        return redirect('dashboard:index')
