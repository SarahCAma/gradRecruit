# Generated by Django 3.1.1 on 2021-01-05 15:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0049_auto_20210105_1312'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='interview',
            name='successful_candidate',
        ),
    ]
