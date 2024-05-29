from celery import shared_task
from django.core.mail import send_mail
from socialmediabackend import settings
from authentication.models import User
from post_app.models import Post


@shared_task
def send_post_notification_email(user_id):
    try:
        sender = User.objects.get(id=user_id)
        followed_users = [follow.follower for follow in sender.followers.all()]
        for user in followed_users:
            subject = "New Post Updated by your Friend"
            message = f"Hello {user.first_name} {user.last_name},\n\nA new post has been created by {sender.first_name} {sender.last_name}.\nCheck it out and be the first person to like it."
            recipient_list = [user.email]
            sender_email = settings.EMAIL_HOST_USER
            send_mail(
                subject,
                message,
                sender_email,
                recipient_list,
                fail_silently=True,
            )

    except User.DoesNotExist:
        # Handle the case if either follower or followed user does not exist
        pass


@shared_task
def send_comment_notification_email(user_id, post_id, comment):
    try:
        user = User.objects.get(id=user_id)
        post = Post.objects.get(id=post_id)
        user_associated_with_post = post.user
        subject = "Commented on your post"
        message = f"Hello {user_associated_with_post.first_name} {user_associated_with_post.last_name},\n\ncomment- {comment} \nby {user.first_name} {user.last_name}.\nCheck it out."
        recipient_list = [user_associated_with_post.email]
        sender_email = settings.EMAIL_HOST_USER
        send_mail(
            subject,
            message,
            sender_email,
            recipient_list,
        )
    except User.DoesNotExist:
        # Handle the case if either follower or followed user does not exist
        pass


@shared_task
def send_like_notification_email(user_id, post_id):
    try:
        user = User.objects.get(id=user_id)
        post = Post.objects.get(id=post_id)
        user_associated_with_post = post.user
        subject = "Liked on your post"
        message = f"Hello {user_associated_with_post.first_name} {user_associated_with_post.last_name},\n\n{user.first_name} {user.last_name} liked your post.\nLogin to see total likes."
        recipient_list = [user_associated_with_post.email]
        sender_email = settings.EMAIL_HOST_USER
        send_mail(
            subject,
            message,
            sender_email,
            recipient_list,
        )
    except User.DoesNotExist:
        # Handle the case if either follower or followed user does not exist
        pass
