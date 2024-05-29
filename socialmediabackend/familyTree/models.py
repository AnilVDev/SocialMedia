from django.db import models
from authentication.models import User

# Create your models here.


class Relationship(models.Model):
    RELATIONSHIP_CHOICES = [
        ("father", "Father"),
        ("mother", "Mother"),
        ("son", "Son"),
        ("daughter", "Daughter"),
        ("brother", "Brother"),
        ("sister", "Sister"),
        ("wife", "Wife"),
        ("husband", "Husband"),
    ]

    from_user = models.ForeignKey(
        User, related_name="from_user", on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(User, related_name="to_user", on_delete=models.CASCADE)
    relationship_type = models.CharField(max_length=50, choices=RELATIONSHIP_CHOICES)

    def __str__(self):
        return f"{self.from_user} is {self.relationship_type} of {self.to_user}"
