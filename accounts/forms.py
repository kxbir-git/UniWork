from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, ClientProfile, FreelancerProfile, Wallet
from marketplace.models import Skill
from decimal import Decimal

class UserRegistrationForm(forms.ModelForm):
    ROLE_CHOICES = [
        ('client', 'Hire Talent (I want to post projects as a Client)'),
        ('freelancer', 'Work as Freelancer (I want to offer services as a Student/Freelancer)'),
    ]
    role = forms.ChoiceField(
        choices=ROLE_CHOICES,
        widget=forms.RadioSelect(attrs={'class': 'btn-check'}),
        initial='freelancer',
        label="Account Type"
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Create strong password'}),
        validators=[validate_password]
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm your password'}),
        label="Confirm Password"
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'location']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. John'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Doe'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'name@example.edu'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. London / Oxford Campus'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', "Passwords do not match.")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        role = self.cleaned_data.get('role')
        if role == 'client':
            user.is_client = True
        elif role == 'freelancer':
            user.is_freelancer = True
        if commit:
            user.save()
        return user


class UserLoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Your registered email'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Your password'})
    )

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        if email and password:
            self.user_cache = authenticate(email=email, password=password)
            if self.user_cache is None:
                raise forms.ValidationError("Invalid email or password.")
            elif not self.user_cache.is_active:
                raise forms.ValidationError("This user account is inactive.")
        return cleaned_data

    def get_user(self):
        return getattr(self, 'user_cache', None)


class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'location', 'profile_image']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'profile_image': forms.FileInput(attrs={'class': 'form-control'}),
        }


class ClientProfileForm(forms.ModelForm):
    class Meta:
        model = ClientProfile
        fields = ['company_name', 'website', 'overview']
        widgets = {
            'company_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Company, Department, or Lab'}),
            'website': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://...'}),
            'overview': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Describe your business or group...'}),
        }


class FreelancerProfileForm(forms.ModelForm):
    skills = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'form-select select2-skills', 'size': 6}),
        required=False
    )

    class Meta:
        model = FreelancerProfile
        fields = ['title', 'overview', 'hourly_rate', 'skills', 'portfolio_url', 'portfolio_file']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Senior Backend Python & Django Engineer'}),
            'overview': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Outline your expertise, experience, and educational background...'}),
            'hourly_rate': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.50'}),
            'portfolio_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://github.com/... or portfolio site'}),
            'portfolio_file': forms.FileInput(attrs={'class': 'form-control'}),
        }


class WalletDepositForm(forms.Form):
    amount = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('5.00'),
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter amount in USD (e.g. 100.00)'})
    )
    description = forms.CharField(
        max_length=150,
        required=False,
        initial="Wallet Top-Up (Simulated)",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
