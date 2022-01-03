from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator, MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone
import datetime
import os
# pylint: disable=no-member

# Create your models here.

CITY_CHOICES = [
    ('BIRMINGHAM', 'Birmingham'),
    ('BRADFORD', 'Bradford'),
    ('BRISTOL', 'Bristol'),
    ('LEEDS', 'Leeds'),
    ('LIVERPOOL', 'Liverpool'),
    ('LONDON', 'London'),
    ('MANCHESTER', 'Manchester'),
    ('NEWCASTLE', 'Newcastle'),
    ('SHEFFIELD', 'Sheffield'),
    ('SOUTHAMPTON', 'Southampton')
]


def user_directory_path(instance, filename):
    return 'candidates/user_{0}/{1}'.format(instance.user.id, filename)


class Candidate(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    cv = models.FileField(upload_to=user_directory_path, default="CV to be added")
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class Employer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    recruiting_manager = models.CharField(max_length=40, default='No Recruiting MGR Entered')
    company = models.CharField(max_length=40, default='No Company Entered')
    city = models.CharField(choices=CITY_CHOICES, max_length=11, default='LONDON')

    def __str__(self):
        return f"{self.recruiting_manager} ({self.company})"



class Vacancy(models.Model):
    CATEGORY_CHOICES = [
        ('ADMINISTRATION', 'Administration'),
        ('CONSULTING', 'Consulting'),
        ('ENGINEERING', 'Engineering'),
        ('FINANCE', 'Finance'),
        ('RETAIL', 'Retail'),
        ('SALES', 'Sales'),
    ]

    STAGES_CHOICES = [
        (0, 'Obsolete'),
        (1, ''),
        (2, 'Applications shortlisted'),
        (3, 'Interviewing'),
        (4, 'Post-Interview'),
        (5, 'Vacancy filled')
    ]

    employer = models.ForeignKey('Employer', on_delete=models.CASCADE)
    job_title = models.CharField(max_length=35, default=None)
    main_duties = models.TextField(default=None, validators=[
        MinLengthValidator(650),
        MaxLengthValidator(2000)
    ])
    person_spec = models.TextField(default=None, validators=[
        MinLengthValidator(650),
        MaxLengthValidator(2000)
    ])
    salary = models.PositiveIntegerField(default=None, validators=[
        MinValueValidator(20000), 
        MaxValueValidator(99000)
    ])
    city = models.CharField(choices=CITY_CHOICES, max_length=11, default=None)
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=15, default=None)
    # max_applications = models.PositiveSmallIntegerField(blank=True, null=True)
    deadline = models.DateField(default=None)
    stage = models.SmallIntegerField(choices=STAGES_CHOICES, default=1)


    class Meta:
        verbose_name_plural = 'vacancies'


    def clean(self):
        super(Vacancy, self).clean()
        if self.deadline <= datetime.date.today():
            raise ValidationError('Vacancy deadline must be in the future')
        return

    def active(self):
        now = datetime.date.today()
        if self.deadline < now:
            return False
        return True
    active.boolean = True


    def post_interview(self):
        if self.stage == 1 and self.active() == False:
            week_ago = datetime.date.today() - datetime.timedelta(days=7)
            if self.deadline < week_ago and self.number_applications() == 0:
                self.stage = 0
                self.save()
        if self.stage == 3:
            if self.interview.starting_datetime.date() < datetime.date.today():
                self.stage = 4
                self.save()
        return self.get_stage_display()
    post_interview.short_description = "Stage"


    # def employer_vacancies(self):
    #     return Vacancy.objects.all()


    # def clean(self):
    #     super(Vacancy, self).clean()
    #     if self.deadline is None and self.max_applications is None:
    #         raise ValidationError('Vacancy must have a deadline or maximum number of applications specified.')
    #     if self.deadline is None and self.max_applications is not None:
    #         raise ValidationError('Vacancy cannot have no deadline and a maximum number of applications specified.')
    #     if self.number_applications() == self.max_applications:
    #         self.is_closed = True
    #         return
    
    def serialize(self):
        return {
            "id": self.id,
            "employer": self.employer.company,
            "job_title": self.job_title,
            "salary": self.salary,
            "city": self.city.title(),
            "category": self.category.title(),
            "deadline": self.deadline.strftime("%d %b %Y"),
            "applications": self.number_applications()
        }

    def serialize_vd(self):
        return {
            "id": self.id,
            "employer": self.employer.recruiting_manager,
            "email": self.employer.user.email,
            "company":self.employer.company,
            "job_title": self.job_title,
            "main_duties": self.main_duties,
            "person_spec": self.person_spec,
            "salary": self.salary,
            "city": self.city.title(),
            "category": self.category.title(),
            "deadline": self.deadline.strftime("%d-%b-%Y"),
            "applications": self.number_applications(),
            "interview_date": self.interview.starting_datetime.strftime("%a %d %b %Y"),
            "interview_time": self.interview.starting_datetime.strftime("%H:%M"),
            "stage": self.stage
        }
    
    def serialize_vd2(self):
        return {
            "id": self.id,
            "employer": self.employer.recruiting_manager,
            "email": self.employer.user.email,
            "company":self.employer.company,
            "job_title": self.job_title,
            "main_duties": self.main_duties,
            "person_spec": self.person_spec,
            "salary": self.salary,
            "city": self.city.title(),
            "category": self.category.title(),
            "deadline": self.deadline.strftime("%d-%b-%Y"),
            "applications": self.number_applications(),
        }


    def number_applications(self):
        return self.application_set.filter(job=self).count()

    def __str__(self):
        return f"{self.id} {self.job_title}"


class Application(models.Model):
    STAGES = [
        (1, 'PRE-SELECTION'),
        (2, 'SHORTLISTED'),
        (3, 'REJECTED PRE-INTERVIEW'),
        (4, 'REJECTED POST-INTERVIEW'),
        (5, 'SUCCESSFUL')
    ]
    candidate = models.ForeignKey('Candidate', on_delete=models.CASCADE)
    job = models.ForeignKey('Vacancy', on_delete=models.CASCADE)
    cv = models.CharField(max_length=60, default=None)
    cover_letter = models.TextField(default=None, validators=[
        MinLengthValidator(0),
        MaxLengthValidator(2000)
    ])
    submitted = models.DateTimeField(auto_now_add=True)
    stage = models.SmallIntegerField(choices=STAGES, default=1)

    # def cv_path(self):
    #     return os.path.join(settings.MEDIA_ROOT, f'candidates/user_{self.candidate.user.id}')


    def serialize(self):
        return {
            "id": self.id,
            "candidate": self.candidate.__str__(),
            "job": self.job.job_title,
            "job_closing": self.job.deadline,
            "employer": self.job.employer.company,
            "submitted": self.submitted.strftime("%d-%b-%Y, %H:%M"),
            "stage": self.stage
        }


    def serialize_submissions(self):
        return {
            "id": self.id,
            "job_title": self.job.job_title,
            "candidate": self.candidate.__str__(),
            "cv": self.cv,
            "cover_letter": self.cover_letter,
            "submitted": self.submitted
        }


    def serialize_candidate(self):
        return {
            "id": self.id,
            "job": self.job.job_title,
            "job_id": self.job.id,
            "active_job": self.job.active(),
            "job_closing": self.job.deadline.strftime("%d-%b-%Y"),
            "employer": self.job.employer.company,
            "submitted": self.submitted.strftime("%d-%b-%Y, %H:%M"),
            "stage": self.stage
        }

    def serialize_shortlisted_candidate(self):
        return {
            "id": self.id,
            "candidate": self.candidate.__str__(),
            "job": self.job.job_title,
            "job_id": self.job.id,
            "cv": self.cv,
            "cover_letter": self.cover_letter,
            "interview": self.interviewslot.date_time.strftime("%H:%M")
        }

class InterviewSlot(models.Model):

    application = models.OneToOneField('Application', on_delete=models.CASCADE, primary_key=True)
    date_time = models.DateTimeField(default=None)
    # date = models.ForeignKey('Interview', to_field="date", on_delete=models.CASCADE)

    # @property
    # def date(self):
    #     return self.application.job.interview.date

    def serialize(self):
        return {
            "candidate": self.application.candidate.__str__(),
            "interview_date": self.date_time.strftime("%a %d %b %Y"),
            "interview_time": self.date_time.strftime("%H:%M")
        }


class Interview(models.Model):
    INTERVAL_CHOICES = [
        (30, "30 min"),
        (45, "45 min"),
        (60, "1 hr"),
        (75, "1 hr 15 min"),
        (90, "1 hr 30 min")
    ]
    job = models.OneToOneField('Vacancy', on_delete=models.CASCADE, primary_key=True)
    starting_datetime = models.DateTimeField(default=None)
    time_interval = models.SmallIntegerField(choices=INTERVAL_CHOICES, default=30)
    # successful_candidate = models.ForeignKey('Application', on_delete=models.CASCADE, default=None, null=True)

    @property
    def interview_slots(self):
        return InterviewSlot.objects.filter(application__job=self.job)

    @property
    def successful_candidate(self):
        try:
            postholder = self.job.application_set.get(stage=5).candidate.__str__()
        except Application.DoesNotExist:
            return f"No successful candidate for {self.job.job_title}"
        return postholder


    
    def serialize(self):
        return {
            "job": self.job.job_title,
            "date": self.starting_datetime.date().strftime("%a %d %b %Y"),
            "time": self.starting_datetime.time().strftime("%H:%M"),
            "time_interval": self.time_interval,
            "interview_candidates": [interviewee.application.id for interviewee in self.interview_slots],
            "successful_candidate": self.successful_candidate
        }