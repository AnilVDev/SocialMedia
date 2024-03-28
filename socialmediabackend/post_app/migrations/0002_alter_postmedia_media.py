# Generated by Django 5.0.2 on 2024-03-13 13:07

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='postmedia',
            name='media',
            field=models.ImageField(upload_to='posts/%Y/%m/%d/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])]),
        ),
    ]
