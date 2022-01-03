from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("info/<str:view_type>", views.about_contact, name="about_contact"),
    path("search", views.search_jobs, name="search_jobs"),
    path("register/candidate", views.register_candidate, name="register_candidate"),
    path("login/candidate", views.login_candidate, name="login_candidate"),
    path("home/candidate/<int:user_id>", views.candidate_portal, name="candidate_portal"),
    path("register/login/<int:num>", views.register_login, name="register_login"),
    path("logout", views.logout_user, name="logout"),
    path("register/employer", views.register_employer, name="register_employer"),
    path("login/employer", views.login_employer, name="login_employer"),
    path("home/candidate/<int:user_id>/cv_upload", views.candidate_cv_upload, name="cv_upload"),
    path("home/employer/<int:user_id>", views.employer_portal, name="employer_portal"),
    path("home/employer/<int:user_id>/new/vacancy", views.new_vacancy, name="new_vacancy"),
    path("vacancy/<int:vacancy_id>/apply/<str:apply_type>", views.apply_vacancy, name="apply_vacancy"),
    path("home/candidate/<int:user_id>/submitted_application/<int:vacancy_id>/<str:view_type>", views.view_application, name="view_application"),
    path("home/employer/<int:user_id>/vacancy/<int:vacancy_id>/create_interview", views.create_interview, name="create_interview"),
    path("home/employer/<int:user_id>/vacancy/<int:vacancy_id>/view_interview", views.view_interview, name="view_interview"),
    path("home/employer/<int:user_id>/all_interviews", views.all_interviews, name="interviews_navtab_redirect"),
    path("home/employer/<int:user_id>/vacancy/<int:vacancy_id>/post_interview", views.post_interview, name="post_interview"),
    

    # API Routes
    path("home/employer/<int:user_id>/all_vacancies", views.employer_vacancies, name="employer_vacancies"),
    path("all_vacancies/search", views.all_vacancies, name="all_vacancies"),
    path("all_active_vacancies/search", views.all_active_vacancies, name="all_active_vacancies"),
    path("vacancy/<int:vacancy_id>", views.show_vacancy, name="show_vacancy"),
    path("home/candidate/<int:user_id>/applications/search", views.candidate_applications, name="candidate_applications"),
    path("application/<int:application_id>", views.show_application, name="show_application"),
    path("application/<int:application_id>/interview_slot", views.check_interview_slot, name="check_interview_slot"),
    path("home/employer/<int:user_id>/active_vacancies", views.employer_active_vacancies, name="employer_active_vacancies"),
    path("home/employer/<int:user_id>/closed_vacancies", views.employer_closed_vacancies, name="employer_closed_vacancies"),
    path("vacancy/<int:vacancy_id>/applications", views.vacancy_applications, name="vacancy_applications"),
    path("vacancy/<int:vacancy_id>/shortlisted_applications", views.vacancy_shortlisted_applications, name="vacancy_shortlisted_applications"),
    path("vacancy/<int:vacancy_id>/closed/<str:view_type>", views.vacancy_shortlisting_outcome, name="vacancy_shortlisting_outcome"),
    path("vacancy/<int:vacancy_id>/interview", views.show_interview, name="show_interview"),
    path("home/employer/<int:user_id>/interviews", views.employer_active_interviews, name="employer_active_interviews"),
    path("home/employer/<int:user_id>/interviews_to_create", views.employer_interviews_to_create, name="employer_interviews_to_create"),

    # AJAX Routes
    path("vacancy/<int:vacancy_id>/already_applicant", views.already_applicant, name="already_applicant"),
    path("vacancy/<int:vacancy_id>/status", views.check_vacancy_status, name="check_vacancy_status"),
    path("vacancy/<int:vacancy_id>/close", views.closing_vacancy, name="closing_vacancy"),
    path("application/<int:application_id>/shortlisting_decision", views.shortlisting_applications, name="shortlisting_applications"),
    path("vacancy/<int:vacancy_id>/postholder", views.new_postholder, name="new_postholder")
]