from django.shortcuts import redirect, get_object_or_404
from django.views import View
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from contracts.models import Contract
from .models import Message

class SendMessageView(LoginRequiredMixin, View):
    """Post a message inside a contract discussion thread."""
    def post(self, request, contract_id):
        contract = get_object_or_404(Contract, pk=contract_id)

        if request.user != contract.client and request.user != contract.freelancer:
            return JsonResponse({'error': 'Unauthorized'}, status=403)

        content = request.POST.get('content', '').strip()
        if not content:
            messages.warning(request, "Message cannot be empty.")
            return redirect('contracts:contract_room', pk=contract.id)

        recipient = contract.freelancer if request.user == contract.client else contract.client

        message = Message.objects.create(
            contract=contract,
            sender=request.user,
            recipient=recipient,
            content=content
        )

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'id': message.id,
                'sender': message.sender.display_name,
                'sender_id': message.sender.id,
                'content': message.content,
                'timestamp': message.timestamp.strftime('%b %d, %H:%M'),
                'is_me': True
            })

        return redirect('contracts:contract_room', pk=contract.id)
