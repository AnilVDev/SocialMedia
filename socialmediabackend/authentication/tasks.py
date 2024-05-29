from celery import shared_task
from django.core.mail import send_mail
from socialmediabackend import settings
from .models import User


@shared_task
def send_follow_notification_email(follower_id, followed_id):
    try:
        follower = User.objects.get(id=follower_id)
        followed = User.objects.get(id=followed_id)
        subject = "New Follower Notification"
        message = f"Hello {followed.first_name} {followed.last_name},\n\nYou have a new follower: {follower.first_name} {follower.last_name}."
        recipient_list = [followed.email]
        sender_email = settings.EMAIL_HOST_USER
        send_mail(subject, message, sender_email, recipient_list)
    except User.DoesNotExist:
        # Handle the case if either follower or followed user does not exist
        pass
