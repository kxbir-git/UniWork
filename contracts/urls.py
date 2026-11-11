from django.urls import path
from . import views

app_name = 'contracts'

urlpatterns = [
    path('', views.ContractListView.as_view(), name='contract_list'),
    path('<int:pk>/', views.ContractRoomView.as_view(), name='contract_room'),
    path('<int:pk>/milestones/add/', views.MilestoneCreateView.as_view(), name='milestone_create'),
    path('milestones/<int:milestone_id>/submit/', views.WorkSubmissionCreateView.as_view(), name='work_submission'),
    path('milestones/<int:milestone_id>/approve/', views.MilestoneApproveView.as_view(), name='milestone_approve'),
]
