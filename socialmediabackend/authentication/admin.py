from django.contrib import admin
from .models import User, Follow, Notification, Block


# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "first_name",
        "last_name",
        "email",
        "username",
        "is_superuser",
        "is_active",
        "gender",
        "mobile",
        "status",
        "profile_picture",
    ]


admin.site.register(User, UserAdmin)


class FollowAdmin(admin.ModelAdmin):
    list_display = ["id", "follower", "following", "created_at"]


admin.site.register(Follow, FollowAdmin)


class NotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "message", "created_at", "is_seen"]


admin.site.register(Notification, NotificationAdmin)


class BlockAdmin(admin.ModelAdmin):
    list_display = ["id", "blocker", "blocked", "blocked_at"]


admin.site.register(Block, BlockAdmin)
