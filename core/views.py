from django.shortcuts import render
from django.views import View
from marketplace.models import Job, Category, Skill
from accounts.models import User
from contracts.models import Contract

class HomeView(View):
    def get(self, request):
        featured_jobs = Job.objects.filter(status=Job.STATUS_OPEN).select_related('client', 'category').prefetch_related('skills_required')[:6]
        categories = Category.objects.all()[:8]
        
        # Public metrics for social proof and final year demo
        stats = {
            'total_jobs': Job.objects.count(),
            'active_freelancers': User.objects.filter(is_freelancer=True).count(),
            'active_clients': User.objects.filter(is_client=True).count(),
            'completed_contracts': Contract.objects.filter(status=Contract.STATUS_COMPLETED).count(),
        }

        return render(request, 'core/index.html', {
            'featured_jobs': featured_jobs,
            'categories': categories,
            'stats': stats,
        })


class AboutView(View):
    def get(self, request):
        return render(request, 'core/about.html')


class HowItWorksView(View):
    def get(self, request):
        return render(request, 'core/how_it_works.html')


def handler404(request, exception):
    return render(request, '404.html', status=404)


def handler500(request):
    return render(request, '500.html', status=500)
