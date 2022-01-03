from django.contrib import admin
from .models import Employer, Candidate, Vacancy, Application, InterviewSlot, Interview
# Register your models here.

@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    pass

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    pass

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('id', 'job_title', 'city', 'category', 'employer', 'number_applications', 'post_interview', 'active')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    pass

@admin.register(InterviewSlot)
class InterviewSlotAdmin(admin.ModelAdmin):
    pass

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    pass