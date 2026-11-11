from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.DashboardIndexView.as_view(), name='index'),
    path('client/', views.ClientDashboardView.as_view(), name='client_dashboard'),
    path('freelancer/', views.FreelancerDashboardView.as_view(), name='freelancer_dashboard'),
]
