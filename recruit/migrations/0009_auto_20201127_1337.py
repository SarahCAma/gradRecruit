# Generated by Django 3.1.1 on 2020-11-27 13:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0008_auto_20201127_1336'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vacancy',
            name='applications',
            field=models.ManyToManyField(blank=True, related_name='submissions', to='recruit.Application'),
        ),
    ]
