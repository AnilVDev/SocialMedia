from django.contrib import admin
from .models import Relationship


# Register your models here.
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ["id", "from_user", "to_user", "relationship_type"]


admin.site.register(Relationship, RelationshipAdmin)
