# Generated by Django 3.1.1 on 2020-12-10 10:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0019_auto_20201209_2112'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='vacancy',
            name='is_closed',
        ),
        migrations.AddField(
            model_name='vacancy',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
