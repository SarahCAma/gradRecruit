# Generated by Django 3.1.1 on 2020-12-05 00:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0017_application_cover_letter'),
    ]

    operations = [
        migrations.RenameField(
            model_name='application',
            old_name='CV',
            new_name='cv',
        ),
    ]
