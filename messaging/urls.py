from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('contract/<int:contract_id>/send/', views.SendMessageView.as_view(), name='send_message'),
]
