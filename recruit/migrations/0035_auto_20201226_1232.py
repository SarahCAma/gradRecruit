# Generated by Django 3.1.1 on 2020-12-26 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0034_auto_20201226_1221'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='stage',
            field=models.SmallIntegerField(choices=[(1, 'PRE-SELECTION'), (2, 'SHORTLISTED'), (3, 'REJECTED PRE-INTERVIEW'), (4, 'REJECTED POST-INTERVIEW'), (5, 'SUCCESSFUL')], default=1),
        ),
    ]
