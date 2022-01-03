from django_use_email_as_username.models import BaseUser, BaseUserManager
from django.db import models

class User(BaseUser):
    objects = BaseUserManager()
    is_employer = models.BooleanField(default=False)

    def full_name(self):
        return f"{self.first_name} {self.last_name}"
