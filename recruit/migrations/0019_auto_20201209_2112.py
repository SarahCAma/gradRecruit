# Generated by Django 3.1.1 on 2020-12-09 21:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruit', '0018_auto_20201205_0007'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='cv',
            field=models.CharField(default=None, max_length=65),
        ),
    ]
