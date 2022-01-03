from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth import get_user_model
from functools import reduce
from operator import or_
import datetime


from .models import Candidate, Employer, Vacancy, Application, Interview, InterviewSlot
from .forms import UploadCVForm, CreateVacancyForm, SubmitApplicationForm, CreateInterviewForm
# pylint: disable=no-member
# Create your views here.


def index(request):
    user = request.user

    def active_vacancies():
        vacancies = []
        for x in Vacancy.objects.all():
            if x.active():
                vacancies.append(x)
        return len(vacancies)

    num_active_vacancies = active_vacancies()

    return render(request, "recruit/index.html", {
        "user": user,
        "num_active_vacancies": num_active_vacancies
    })


def about_contact(request, view_type):
    if view_type == "about":
        return render(request, "recruit/about_contact.html", {
            "about": True,
        })
    elif view_type == "contact":
        return render(request, "recruit/about_contact.html", {
            "contact": True,
        })



def candidate_portal(request, user_id):
    User = get_user_model()
    currentUser = request.user
    profile = get_object_or_404(User, id=user_id)
    form = UploadCVForm()
    
    try:
        candidate = Candidate.objects.get(user=profile)
    except Candidate.DoesNotExist:
        return render(request, "recruit/error.html")

    if candidate.cv == "CV to be added" and currentUser == profile:
        cv_exists = False
        return render(request, "recruit/dashboard.html", {
            "profile": profile,
            "form": form,
            "candidate": candidate,
            "cv_exists": cv_exists
        })
    elif currentUser == profile:
        cv_exists = True
        cv_name = candidate.cv.name.split('/')[2]
        return render(request, "recruit/dashboard.html", {
            "profile": profile,
            "form": form,
            "candidate": candidate,
            "cv_exists": cv_exists,
            "cv_name": cv_name
        })
    else:
        return render(request, "recruit/error.html")


def employer_portal(request, user_id):
    User = get_user_model()
    currentUser = request.user
    profile = get_object_or_404(User, id=user_id)

    employer = get_object_or_404(Employer, user=profile)

    form = CreateVacancyForm()

    if currentUser == profile:
        return render(request, "recruit/employer_portal.html", {
            "profile": profile,
            "employer": employer,
            "form": form,
        })
    else:
        return render(request, "recruit/error.html")


def register_candidate(request):
    if request.method == "POST":
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        email = request.POST["email"]

        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            messages.warning(request, "Passwords must match.", extra_tags='register')
            return HttpResponseRedirect(reverse("register_login", args=[1])) 

        try:
            User = get_user_model()
            user_user = User.objects.create_user(email, password)
            user_user.first_name = first_name
            user_user.last_name = last_name
            user_user.save()
            user_candidate = Candidate(user=user_user)
            user_candidate.save()

        except IntegrityError:
            messages.warning(request, "Email address is already in use.", extra_tags='register')
            return HttpResponseRedirect(reverse("register_login", args=[1])) 

        login(request, user_user)
        return HttpResponseRedirect(reverse("candidate_portal", args=(user_user.id,)))
    else:
        return HttpResponseRedirect(reverse("register_login", args=[1])) 


def login_candidate(request):
    if request.method == "POST":

        email = request.POST["email"]
        password = request.POST["password"]

        user = authenticate(request, email=email, password=password)

        if user is not None and user.is_employer == False:
            login(request, user)
            return HttpResponseRedirect(reverse("candidate_portal", args=(user.id,)))
        else:
            messages.warning(request, "Invalid email and/or password.", extra_tags='login')
            return HttpResponseRedirect(reverse("register_login", args=[1])) 
    else:
        return HttpResponseRedirect(reverse("register_login", args=[1])) 



def logout_user(request):
    logout(request)
    # messages.success(request, "You have succesfully logged out.")
    return HttpResponseRedirect(reverse("index"))



def register_employer(request):
    if request.method == "POST":

        recruiter = request.POST["recruiting_manager"]
        company = request.POST["company"]
        city = request.POST["city"]
        email = request.POST["email"]

        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            messages.warning(request, "Passwords must match.", extra_tags='register')
            return HttpResponseRedirect(reverse("register_login", args=[2])) 
        try:
            User = get_user_model()
            user_user = User.objects.create_user(email, password)
            user_user.is_employer = True
            user_user.save()
            user_employer = Employer(user=user_user)
            user_employer.recruiting_manager = recruiter
            user_employer.company = company
            user_employer.city = city
            user_employer.save()
        except IntegrityError:
            messages.warning(request, "Email address is already in use.", extra_tags='register')
            return HttpResponseRedirect(reverse("register_login",args=[2]))   
        login(request, user_user)
        return HttpResponseRedirect(reverse("employer_portal", args=(user_user.id,)))
    else:
        return HttpResponseRedirect(reverse("register_login",args=[2]))   


def login_employer(request):
    if request.method == "POST":

        email = request.POST["email"]
        password = request.POST["password"]

        user = authenticate(request, email=email, password=password)

        if user is not None and user.is_employer == True:
            login(request, user)
            return HttpResponseRedirect(reverse("employer_portal", args=(user.id,)))
        else:
            messages.warning(request, "Invalid email and/or password", extra_tags='login')
            return HttpResponseRedirect(reverse("register_login",args=[2]))                
    else:
        return HttpResponseRedirect(reverse("register_login",args=[2]))  


def candidate_cv_upload(request, user_id):
    if request.method == "POST":
        form = UploadCVForm(request.POST, request.FILES)
        if form.is_valid():
            User = get_user_model()
            candidate = get_object_or_404(User, id=user_id)
            cv_upload = form.save(commit=False)
            cv_upload.user = candidate
            cv_upload.save()
            messages.success(request, "CV uploaded successfully.")
            return HttpResponseRedirect(reverse("candidate_portal", args=(user_id,)))
        else:
            messages.error(request, "No document uploaded.")
    else:
        return HttpResponseRedirect(reverse("candidate_portal", args=(user_id,)))


def register_login(request, num):
    if num == 1:
        return render(request, "recruit/register_login.html", {
            "candidate_registration_login": True,
        })
    else:
        return render(request, "recruit/register_login.html", {
            "employer_registration_login": True,
        })


def new_vacancy(request, user_id):
    
    profile = get_object_or_404(get_user_model(), id=user_id)
    if request.method == "POST":
        form = CreateVacancyForm(request.POST)
        employer = get_object_or_404(Employer, user=profile)
        if form.is_valid():
            new_vacancy = form.save(commit=False)
            new_vacancy.employer = employer
            new_vacancy.save()
            # messages.success(request, "Vacancy created successfully.")
            return HttpResponseRedirect(reverse("employer_portal", args=(user_id,)))
        else:
            form = CreateVacancyForm()
            messages.warning(request, 'Form did not submit successfully', extra_tags='warning')
            return render(request, "recruit/create_vacancy.html", {
                "profile": profile, 
                "form": form,
                "employer": employer
            })
    else:
        form = CreateVacancyForm()
        employer = get_object_or_404(Employer, user=profile)
        if request.user == profile:
            return render(request, "recruit/create_vacancy.html", {
            "profile": profile,
            "form": form,
            "employer": employer
            })
        else:
            return render(request, "recruit/error.html")




def employer_vacancies(request, user_id):
    try:
        User = get_user_model()
        employer_user = get_object_or_404(User, id=user_id)
        employer_profile = get_object_or_404(Employer, user=employer_user)
        employer_vacancy = Vacancy.objects.filter(employer=employer_profile)
    except User.DoesNotExist:
        return JsonResponse({"error": "No user found."}, status=404)

    if request.method == "GET":
        return JsonResponse([vacancy.serialize() for vacancy in employer_vacancy], safe=False)
    else:
        return JsonResponse({
            "error": "GET request required."
        }, status=400)




def employer_active_vacancies(request, user_id):
    try:
        employer = Employer.objects.get(user__id=user_id)
    except Employer.DoesNotExist:
        return JsonResponse({"error": "No employer found."}, status=404)

    if request.method == "GET":
        def active_vacancies():
            vacancies = []
            for x in Vacancy.objects.filter(employer=employer):
                if x.active():
                    vacancies.append(x)
            return vacancies

        employer_vacancies = active_vacancies()
        return JsonResponse([vacancy.serialize() for vacancy in employer_vacancies], safe=False)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)


def employer_closed_vacancies(request, user_id):
    try:
        employer = Employer.objects.get(user__id=user_id)
    except Employer.DoesNotExist:
        return JsonResponse({"error": "No employer found."}, status=404)

    if request.method == "GET":
        def closed_vacancies():
            vacancies = []
            # fortnight_ago = datetime.date.today() - datetime.timedelta(days=14)
            for x in Vacancy.objects.filter(employer=employer):
                if not x.active() and x.stage >= 1:
                    vacancies.append(x)
            return vacancies

        employer_vacancies = closed_vacancies()
        return JsonResponse([vacancy.serialize() for vacancy in employer_vacancies], safe=False)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)



def employer_active_interviews(request, user_id):
    try:
        employer = Employer.objects.get(user__id=user_id)
    except Employer.DoesNotExist:
        return JsonResponse({'error': 'No employer found'}, status=404)

    if request.method == "GET":
        def upcoming_interviews():
            interviews = []
            for interview in Interview.objects.filter(job__employer=employer):
                if interview.starting_datetime.date() >= datetime.date.today():
                    interviews.append(interview)
            return interviews

        upcoming_interviews = upcoming_interviews()
        return JsonResponse([interview.serialize() for interview in upcoming_interviews], safe=False)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)


def employer_interviews_to_create(request, user_id):
    try:
        employer = Employer.objects.get(user__id=user_id)
    except Employer.DoesNotExist:
        return JsonResponse({'error': 'No employer found'}, status=404)

    
    if request.method == "GET":
        interview_to_create = Vacancy.objects.filter(employer=employer,stage=2)
        
        return JsonResponse([vacancy.serialize() for vacancy in interview_to_create], safe=False)
    else:
        return JsonResponse({"error: GET request required"}, status=400)

    


def all_vacancies(request):
    start = int(request.GET.get('start') or 0)
    end = int(request.GET.get('end') or (start + 9))
    vacancies = Vacancy.objects.all()[start:end]
    return JsonResponse(
        {'vacancies': [vacancy.serialize() for vacancy in vacancies]}
    )


def all_active_vacancies(request):
    start = int(request.GET.get('start') or 0)
    end = int(request.GET.get('end') or (start + 9))

    def active_vacancies():
        vacancies = []
        for x in Vacancy.objects.all().order_by('deadline'):
            if x.active():
                vacancies.append(x)
        return vacancies

    all_vacancies = active_vacancies()[start:end]
    if request.method == "GET":
       return JsonResponse({"vacancies": [vacancy.serialize() for vacancy in all_vacancies]})
    else:
        return JsonResponse({"error": "GET request required."}, status=400) 



def show_vacancy(request, vacancy_id):
    try:
        vacancy = Vacancy.objects.get(id=vacancy_id)
    except Vacancy.DoesNotExist:
        return JsonResponse({"error": "No vacancy found."}, status=404)

    if request.method == "GET":
        try:
            return JsonResponse([vacancy.serialize_vd()], safe=False, status=200)
        except Interview.DoesNotExist:
            return JsonResponse([vacancy.serialize_vd2()], safe=False, status=200)
    
    else:
        return JsonResponse({"error": "GET request required."}, status=400)
        

def apply_vacancy(request, vacancy_id, apply_type):
    form = SubmitApplicationForm()
    profile = get_object_or_404(get_user_model(), id=request.user.id)
    candidate = get_object_or_404(Candidate, user=profile)
    vacancy = get_object_or_404(Vacancy, id=vacancy_id)
    if request.method == "POST":
        form = SubmitApplicationForm(request.POST or None)
        if form.is_valid():
            new_application = form.save(commit=False)
            new_application.candidate = candidate
            new_application.job = get_object_or_404(Vacancy, id=vacancy_id)
            new_application.cv = candidate.cv.url
            new_application.save()
            return render(request, "recruit/apply_vacancy.html", {
                "candidate": candidate,
                "submission": True,
                "vacancy": vacancy
            })
        else:
            form = SubmitApplicationForm()
            cv_exists = True
            cv_name = candidate.cv.name.split('/')[2]
            return render(request, "recruit/apply_vacancy.html", {
                "candidate": candidate,
                "cv_exists": cv_exists,
                "cv_name": cv_name,
                "form": form,
                "error_message": "Please add a CV to your profile to submit an application.",
                "submission": False,
                "vacancy": vacancy
            })
    else:
        if apply_type == "new_application":
            if vacancy.application_set.filter(candidate=candidate).exists():
                already_applied = "already_applied"
                return HttpResponseRedirect(reverse("view_application", args=(request.user.id, vacancy_id, already_applied,)))
            elif vacancy.active() != True:
                return render(request, "recruit/error.html")
            else:
                if candidate.cv == "CV to be added":
                    cv_exists = False
                else:
                    cv_exists = True
                    cv_name = candidate.cv.name.split('/')[2]
                return render(request, "recruit/apply_vacancy.html", {
                    "candidate": candidate,
                    "cv_exists": cv_exists,
                    # "cv_name": cv_name,
                    "form": form,
                    "error_message": "Please add a CV to your profile to submit an application.",
                    "submission": False,
                    "vacancy": vacancy

                })    
        elif apply_type == "submission":
            return render(request, "recruit/error.html")


def candidate_applications(request, user_id):
    start = int(request.GET.get('start') or 0)
    end = int(request.GET.get('end') or (start + 9))

    candidate = get_object_or_404(Candidate, user__id=user_id)
    applications = Application.objects.filter(candidate=candidate)[start:end]

    return JsonResponse(
        {'applications': [application.serialize_candidate() for application in applications]}
    )
    

def show_application(request, application_id):
    try:
        application = get_object_or_404(Application, id=application_id)
    except Application.DoesNotExist:
        return JsonResponse({'error': 'No application found.'}, status=404)
    
    if request.method == "GET":
        return JsonResponse([application.serialize()], safe=False)
    else:
        return JsonResponse({'error': 'GET response required.'}, status=400)


def show_interview(request, vacancy_id):
    try:
        interview = Interview.objects.get(job__id=vacancy_id)
    except Interview.DoesNotExist:
        return JsonResponse({'error': 'No interview found.'}, status=404)
    
    if request.method == "GET":
        return JsonResponse([interview.serialize()], safe=False)
    else:
        return JsonResponse({'error': 'GET response required.'}, status=400)




def view_application(request, user_id, vacancy_id, view_type):
    # application = get_object_or_404(Application, id=application_id)
    vacancy = get_object_or_404(Vacancy, id=vacancy_id)
    candidate = get_object_or_404(Candidate, user__id=user_id)
    try:
        application = vacancy.application_set.get(candidate=candidate)
    except Application.DoesNotExist:
        return render(request, "recruit/error.html")
        
    if view_type == "view_application":
        return render(request, "recruit/view_application.html", {
            "application": application,
            "view_application": True
    }) 
    elif view_type == "already_applied":
        return render(request, "recruit/view_application.html", {
            "application": application,
            "view_application": False
    }) 
    else:
        return render(request, "recruit/error.html")



def vacancy_applications(request, vacancy_id):
    try:
        vacancy = get_object_or_404(Vacancy, id=vacancy_id)
    except Vacancy.DoesNotExist:
        return JsonResponse({'error': 'No vacancy found.'}, status=404)

    if request.method == "GET":
        applications = vacancy.application_set.all()
        return JsonResponse(
            {'submissions': [application.serialize_submissions() for application in applications]}
        )


def vacancy_shortlisted_applications(request, vacancy_id):
    try:
        vacancy = Vacancy.objects.get(id=vacancy_id)
    except Vacancy.DoesNotExist:
        return JsonResponse({'error': 'No vacancy found.'}, status=404)

    if request.method == "GET":
        applications = vacancy.application_set.filter(stage=2)
        return JsonResponse(
            {'applications': [application.serialize_shortlisted_candidate() for application in applications]}
        )





def vacancy_shortlisting_outcome(request, vacancy_id, view_type):

    try:
        vacancy = get_object_or_404(Vacancy, id=vacancy_id)
    except Vacancy.DoesNotExist:
        return JsonResponse({'error': 'No vacancy found.'}, status=404)

    if request.method == "GET":
        if view_type == "shortlisted_applications":
            applications = Application.objects.filter(job=vacancy, stage=2)
        elif view_type == "rejected_pre_int_applications":
            applications = Application.objects.filter(job=vacancy, stage=3)
        else:
            return JsonResponse({'error': 'No such view_type exists.'}, status=404)
        return JsonResponse(
            {'applications': [application.serialize_submissions() for application in applications]}
        )
    else:
        return JsonResponse({'error': 'GET request required.'}, status=400)



def check_interview_slot(request, application_id):
    try:
        interview = InterviewSlot.objects.get(application__id=application_id)
    except InterviewSlot.DoesNotExist:
        return JsonResponse({'error': 'No interview slot found for this application.'}, status=404)

    if request.method == "GET":
        return JsonResponse([interview.serialize()], safe=False)
    else:
        return JsonResponse({'error': 'GET request required.'}, status=400)
        

def already_applicant(request, vacancy_id):
    if request.is_ajax and request.method == "GET":
        
        # vacancy_id = int(request.GET.get('vacancyId'))
        id = int(request.GET.get('candidateId'))
        vacancy = get_object_or_404(Vacancy, id=vacancy_id)
        candidate = get_object_or_404(Candidate, user__id=id)

        if vacancy.application_set.filter(candidate=candidate).exists():
            return JsonResponse({"exists": True}, status=200)
        else:
            return JsonResponse({"exists": False}, status=200)
    else:
        return JsonResponse({}, status=400)


def check_vacancy_status(request, vacancy_id):
    if request.is_ajax and request.method == "GET":

        vacancy = get_object_or_404(Vacancy, id=vacancy_id)

        if vacancy.active():
            return JsonResponse({"active": True}, status=200)
        else:
            vacancy_stage = vacancy.stage
            return JsonResponse({"active": False, "stage": vacancy_stage}, status=200)
    else:
        return JsonResponse({}, status=400)



def closing_vacancy(request, vacancy_id):
    if request.is_ajax and request.method == "POST":

        vacancy = get_object_or_404(Vacancy, id=vacancy_id)
        yesterday = datetime.date.today() - datetime.timedelta(days=1)

        vacancy.deadline = yesterday
        vacancy.save()
        active = vacancy.active()
        return JsonResponse({"vacancy_active": active}, status=200)
    else:
        return JsonResponse({}, status=400)


def shortlisting_applications(request, application_id):
    if request.is_ajax and request.method == "POST":

        application = get_object_or_404(Application, id=application_id)
        decision  = int(request.POST.get('decision'))

        application.stage = decision

        if application.job.stage == 1:
            application.job.stage = 2
            application.job.save()
        elif application.job.stage == 4:
            application.job.stage = 5
            application.job.save()

        application.save()
        stage = application.get_stage_display()
        return JsonResponse({'stage': stage}, status=200)
    else:
        return JsonResponse({}, status=400)



def create_interview(request, user_id, vacancy_id):
    try:
        vacancy = Vacancy.objects.get(id=vacancy_id, employer__user__id=user_id)
    except Vacancy.DoesNotExist:
        return render(request, "recruit/error.html")


    if request.method == "POST":
        form = CreateInterviewForm(request.POST or None)
        if form.is_valid():
            new_interview = form.save(commit=False)
            new_interview.job = vacancy
            new_interview.save()

            vacancy.stage = 3
            vacancy.save()

            shortlisted_applications = vacancy.application_set.filter(stage=2)
            time = vacancy.interview.starting_datetime
            interval = int(vacancy.interview.time_interval)

            for application in shortlisted_applications:
                interview_slot = InterviewSlot(application=application, date_time=time)
                interview_slot.save()
                time = time + datetime.timedelta(minutes=interval)

            # messages.success(request, "Interview created succesfully.")
            return HttpResponseRedirect(reverse("view_interview", args=(user_id, vacancy_id,)))
        else:
            messages.warning(request, "Form did not submit successfully.")
            return render(request, "recruit/interview.html", {
                "view": "create",
                "employer": vacancy.employer,
                "form": form,
                "profile": get_object_or_404(get_user_model(), id=user_id),
                "vacancy": vacancy,
                "shortlisted_applicants": vacancy.application_set.filter(stage=2).count()
            })
    else:
        try:
            Interview.objects.get(job=vacancy)
        except Interview.DoesNotExist:
            form = CreateInterviewForm()
            return render(request, "recruit/interview.html", {
                "view": "create",
                "employer": vacancy.employer,
                "form": form,
                "profile": get_object_or_404(get_user_model(), id=user_id),
                "vacancy": vacancy,
                "shortlisted_applicants": vacancy.application_set.filter(stage=2).count()
            })
        else:
            if vacancy.stage == 3:
                return HttpResponseRedirect(reverse("view_interview", args=(user_id, vacancy_id,)))
            elif vacancy.stage > 3:
                return HttpResponseRedirect(reverse("post_interview", args=(user_id, vacancy_id,)))
            else: 
                return render(request, "recruit/error.html")



def view_interview(request, user_id, vacancy_id):

    try:
        vacancy = Vacancy.objects.get(id=vacancy_id, employer__user__id=user_id)
    except Vacancy.DoesNotExist:
        return render(request, "recruit/error.html")
    else:
        try:
            interview = Interview.objects.get(job=vacancy)
        except Interview.DoesNotExist:
            return render(request, "recruit/error.html")
        else:
            return render(request, "recruit/interview.html", {
                "view": "view",
                "interview": interview,
                "profile": get_object_or_404(get_user_model(), id=user_id),
                "employer": vacancy.employer,
                "vacancy": vacancy
            })



def all_interviews(request, user_id):
    try:
        employer = Employer.objects.get(user__id=user_id)
    except Employer.DoesNotExist:
        return JsonResponse({'error': 'No employer found'}, status=404)

    # try:
    #     interview = Interview.objects.filter(job__employer=employer)
    # except Interview.DoesNotExist:
    #     return render(request, "recruit/error.html")
    # else:
    return render(request, "recruit/interview.html", {
        "view": "all",
        "profile": get_object_or_404(get_user_model(), id=user_id),
        "employer": employer,
        "employer_upcoming_interviews": Interview.objects.filter(job__employer=employer,job__stage=3).count(),
        "employer_interviews_to_create": Vacancy.objects.filter(employer=employer,stage=2).count()
    })


def post_interview(request, user_id, vacancy_id):
    try:
        vacancy = Vacancy.objects.get(id=vacancy_id, employer__user__id=user_id)
    except Vacancy.DoesNotExist:
        return render(request, "recruit/error.html")

    if vacancy.stage > 3:
        return render(request, "recruit/interview.html", {
            "view": "post",
            "stage": vacancy.stage,
            "profile": get_object_or_404(get_user_model(), id=user_id),
            "employer": vacancy.employer,
            "vacancy": vacancy
        })
    else:
        return HttpResponseRedirect(reverse("view_interview", args=(user_id, vacancy_id,))) 




def search_jobs(request):

    q = request.GET.get('q')
    queries = q.split(" ")

    or_filter = reduce(or_, (Q(job_title__icontains=query) | Q(employer__company__icontains=query) | Q(category__icontains=query)  for query in queries))
    # hits = Vacancy.objects.filter(or_filter)

    def hits():
        vacancies = []
        for x in Vacancy.objects.filter(or_filter):
            if x.active():
                vacancies.append(x)
        return vacancies
    


    print(hits())
    
    return render(request, "recruit/search.html", {
        "total_jobs": len(hits()),
        "jobs": hits()
    })


# def search_jobs(request):
#     hits = []

#     q = request.GET.get('q')
#     queries = q.split(" ")
#     for query in queries:
#         x = Vacancy.objects.get(Q(job_title__icontains=query))
#         hits.append(x)

#     hits = list(dict.fromkeys(hits))

#     print(hits)
#     return render(request, "recruit/index.html")

def new_postholder(request, vacancy_id):
    if request.is_ajax and request.method == "GET":
        postholder = Application.objects.get(job=vacancy_id, stage=5)
        return JsonResponse({
            'postholderName': postholder.candidate.__str__(),
            'postholderEmail': postholder.candidate.user.email
        }, status=200)
    else:
        return JsonResponse({}, status=400)