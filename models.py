from django.db import models

# Create your models here.
from accounts.models import User

class Story(models.Model):
    child     = models.ForeignKey(User, on_delete=models.CASCADE,
                                  related_name='stories')
    theme     = models.CharField(max_length=100)
    character = models.CharField(max_length=100)
    content   = models.TextField()   # full story builds up here
    language  = models.CharField(max_length=20)
    created   = models.DateTimeField(auto_now_add=True)
    updated   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.theme} — {self.child.username}"
