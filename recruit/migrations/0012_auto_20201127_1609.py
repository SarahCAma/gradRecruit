# Generated by Django 3.1.1 on 2020-11-27 16:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0011_auto_20201127_1525'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='CV',
            field=models.CharField(default=None, max_length=35),
        ),
    ]