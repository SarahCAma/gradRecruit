# Generated by Django 3.1.1 on 2020-12-28 16:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0036_vacancy_stage'),
    ]

    operations = [
        migrations.CreateModel(
            name='Interview',
            fields=[
                ('job', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='recruit.vacancy')),
            ],
        ),
    ]
