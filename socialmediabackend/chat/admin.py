from django.contrib import admin
from .models import *

# Register your models here.


class ChatModelAdmin(admin.ModelAdmin):
    list_display = ["id", "sender", "receiver", "thread_name", "message", "timestamp"]


admin.site.register(UserProfileModel)
admin.site.register(ChatModel, ChatModelAdmin)


class ChatNotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "chat", "user", "is_seen"]


admin.site.register(ChatNotification, ChatNotificationAdmin)
