# Generated by Django 3.1.1 on 2020-12-18 14:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0032_remove_vacancy_applications'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='vacancy',
            name='max_applications',
        ),
    ]