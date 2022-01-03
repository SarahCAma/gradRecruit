from django import forms
from django.utils import timezone
from django.forms import ModelForm, FileInput
from .models import Candidate, Vacancy, Application, Interview


class UploadCVForm(ModelForm):
    class Meta:
        model = Candidate
        fields = ["cv"]
        labels = {"cv": ""}


class DateInput(forms.DateInput):
    input_type = 'date'


class DateTimeInput(forms.DateTimeInput):
    input_type = 'datetime-local'

        
class CreateVacancyForm(ModelForm):
    class Meta:
        model = Vacancy
        fields = [
            "job_title", 
            "main_duties", 
            "person_spec", 
            "salary",
            "city",
            "category",
            "deadline"
        ]
        labels = {
            "job_title": "Job Title",
            "main_duties": "Main Duties",
            "person_spec": "Person Specification",
        }
        widgets = {
            "job_title": forms.TextInput(attrs={
                'class': 'form-control',
            }),
            "main_duties": forms.Textarea(attrs={
                'class': 'form-control',
                'minlength': 650,
                'maxlength': 2000
            }),
            "person_spec": forms.Textarea(attrs={
                'class': 'form-control',
                'minlength': 650,
                'maxlength': 2000    
            }),
            "salary": forms.NumberInput(attrs={
                'class': 'form-control',
                'max': 99000
            }),
            "city": forms.Select(attrs={
                'class': 'form-control'
            }),
            "category": forms.Select(attrs={
                'class': 'form-control'
            }),
            "deadline": DateInput(attrs={
                'class': 'form-control'
            })
            
        }


    def __init__(self, *args, **kwargs):
        super(CreateVacancyForm, self).__init__(*args, **kwargs)
        self.fields['salary'].widget.attrs['min'] = 20000





class SubmitApplicationForm(ModelForm):
    class Meta:
        model = Application
        fields = ["cover_letter"]
        labels = {
            "cover_letter": ""
        }
        widgets = {
            "cover_letter": forms.Textarea(attrs={
                'class': 'form-control w-75',
                'rows': 5,
            })
        }




class CreateInterviewForm(ModelForm):
    class Meta:
        model = Interview
        fields = ["starting_datetime", "time_interval"]
        labels = {
            "starting_datetime": "Date and Start Time",
            "time_interval": "Interview Slot Duration"
        }
        widgets= {
            "starting_datetime": DateTimeInput(attrs={
                'class': 'form-control'
            }),
            "time_interval": forms.Select(attrs={
                'class': 'form-control'
            })
        }


# class ShortlistApplicationForm(ModelForm):
#     class Meta:
#         model = Application
#         fields = ["stage"]
#         widgets = {
#             "stage": forms.CheckboxInput(attrs={
#                 'class': 'form-control'
#             })
#         }










    

