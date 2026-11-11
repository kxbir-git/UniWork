from django import forms
from .models import Job, Proposal, Category, Skill
from decimal import Decimal

class JobForm(forms.ModelForm):
    skills_required = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'form-select', 'size': 5}),
        required=False,
        help_text="Hold Ctrl (or Cmd on Mac) to select multiple relevant skills"
    )

    class Meta:
        model = Job
        fields = [
            'title', 'category', 'description', 'skills_required',
            'budget_type', 'budget_min', 'budget_max', 'experience_level'
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Build an AI-driven student study dashboard in Django'}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 6, 'placeholder': 'Provide a detailed description of the project deliverables, expectations, and requirements...'}),
            'budget_type': forms.Select(attrs={'class': 'form-select'}),
            'budget_min': forms.NumberInput(attrs={'class': 'form-control', 'step': '5.00'}),
            'budget_max': forms.NumberInput(attrs={'class': 'form-control', 'step': '5.00'}),
            'experience_level': forms.Select(attrs={'class': 'form-select'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        budget_min = cleaned_data.get('budget_min')
        budget_max = cleaned_data.get('budget_max')
        if budget_min and budget_max and budget_min > budget_max:
            self.add_error('budget_max', "Maximum budget must be greater than or equal to minimum budget.")
        return cleaned_data


class ProposalForm(forms.ModelForm):
    class Meta:
        model = Proposal
        fields = ['bid_amount', 'estimated_days', 'cover_letter']
        widgets = {
            'bid_amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '1.00', 'placeholder': 'Your bid amount in USD'}),
            'estimated_days': forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'placeholder': 'Delivery time in days'}),
            'cover_letter': forms.Textarea(attrs={'class': 'form-control', 'rows': 6, 'placeholder': 'Explain why your skills, course projects, or freelance experience make you the ideal student/freelancer for this job...'}),
        }
