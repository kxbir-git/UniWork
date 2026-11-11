from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/edit/', views.ProfileEditView.as_view(), name='profile_edit'),
    path('freelancer/<int:pk>/', views.FreelancerDetailView.as_view(), name='freelancer_detail'),
    path('client/<int:pk>/', views.ClientDetailView.as_view(), name='client_detail'),
    path('wallet/', views.WalletView.as_view(), name='wallet'),
]
