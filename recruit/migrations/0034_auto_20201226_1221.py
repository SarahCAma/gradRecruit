# Generated by Django 3.1.1 on 2020-12-26 12:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0033_remove_vacancy_max_applications'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='stage',
            field=models.CharField(choices=[(1, 'PRE-SELECTION'), (2, 'SHORTLISTED'), (3, 'REJECTED PRE-INTERVIEW'), (4, 'REJECTED POST-INTERVIEW'), (5, 'SUCCESSFUL')], default='pre-selection', max_length=25),
        ),
    ]
