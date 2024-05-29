from django.db import models
from post_app import *

# Create your models here.
from django.contrib.auth.models import AbstractUser, PermissionsMixin, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("User Must have an email")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_active") is not True:
            raise ValueError("Super user must be active")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Super user must be staff")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Super user must have is_super=True")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, PermissionsMixin):
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    mobile = models.BigIntegerField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pictures", null=True, blank=True
    )
    bio = models.CharField(max_length=150, null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    STATUS_CHOICES = [
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("deleted", "Deleted"),
    ]
    status_activity = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="active"
    )
    GENDER_CHOICES = (
        ("male", "Male"),
        ("female", "Female"),
    )
    gender = models.CharField(
        max_length=50, choices=GENDER_CHOICES, null=True, blank=True
    )

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    def get_short_name(self):
        return self.first_name

    def __str__(self):
        return self.email


class Follow(models.Model):
    follower = models.ForeignKey(
        User, related_name="following", on_delete=models.CASCADE
    )
    following = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")

    def __str__(self):
        return f"{self.follower} follows {self.following}"


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications_received"
    )
    like_or_comment_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notifications_liked_or_commented",
    )
    message = models.CharField(max_length=255)
    post = models.ForeignKey(
        "post_app.Post", null=True, blank=True, on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user}: {self.message}"


class Block(models.Model):
    blocker = models.ForeignKey(User, related_name="blocking", on_delete=models.CASCADE)
    blocked = models.ForeignKey(
        User, related_name="blocked_by", on_delete=models.CASCADE
    )
    blocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")

    def __str__(self):
        return f"{self.blocker.email} blocked {self.blocked.email}"
