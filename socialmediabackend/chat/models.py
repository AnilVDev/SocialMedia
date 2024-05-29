from django.db import models
from django.contrib.auth import get_user_model


# Create your models here.
User = get_user_model()


class UserProfileModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(blank=True, null=True, max_length=100)
    online_status = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.user.username


class ChatModel(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="receiver"
    )
    message = models.TextField(null=True, blank=True)
    thread_name = models.CharField(null=True, blank=True, max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.message


class ChatNotification(models.Model):
    chat = models.ForeignKey(to=ChatModel, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    is_seen = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.user.username
