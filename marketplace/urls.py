from django.urls import path
from . import views

app_name = 'marketplace'

urlpatterns = [
    path('', views.JobListView.as_view(), name='job_list'),
    path('post/', views.JobCreateView.as_view(), name='job_create'),
    path('<int:pk>/', views.JobDetailView.as_view(), name='job_detail'),
    path('<int:pk>/edit/', views.JobUpdateView.as_view(), name='job_update'),
    path('<int:job_id>/apply/', views.ProposalSubmitView.as_view(), name='proposal_submit'),
    path('<int:job_id>/proposals/', views.JobProposalsView.as_view(), name='job_proposals'),
    path('proposals/<int:proposal_id>/<str:action>/', views.ProposalActionView.as_view(), name='proposal_action'),
]
