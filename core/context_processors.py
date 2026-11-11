from marketplace.models import Category
from accounts.models import Wallet

def uniwork_globals(request):
    """
    Global context processor for header stats, categories navigation,
    and user wallet balance display.
    """
    context = {}
    if request.user.is_authenticated:
        try:
            context['user_wallet'] = request.user.wallet
        except Exception:
            context['user_wallet'] = None
    
    # Cache or grab top categories for navigation dropdown
    try:
        context['nav_categories'] = Category.objects.all()[:6]
    except Exception:
        context['nav_categories'] = []
        
    return context
