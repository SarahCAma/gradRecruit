# Generated by Django 3.1.1 on 2020-12-29 00:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0041_auto_20201228_2006'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='InterviewSlots',
            new_name='InterviewSlot',
        ),
        migrations.AlterModelOptions(
            name='interviewslot',
            options={},
        ),
    ]