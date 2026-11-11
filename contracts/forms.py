from django import forms
from .models import Milestone, WorkSubmission
from decimal import Decimal

class MilestoneForm(forms.ModelForm):
    class Meta:
        model = Milestone
        fields = ['title', 'description', 'amount', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Phase 2: Backend API & Database'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Specific acceptance criteria...'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '1.00', 'placeholder': 'Milestone budget in USD'}),
            'due_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }


class WorkSubmissionForm(forms.ModelForm):
    class Meta:
        model = WorkSubmission
        fields = ['work_notes', 'attachment']
        widgets = {
            'work_notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Describe what was completed, key highlights, and links or testing instructions...'}),
            'attachment': forms.FileInput(attrs={'class': 'form-control'}),
        }
