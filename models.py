from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    PARENT = 'parent'
    CHILD  = 'child'
    ROLE_CHOICES = [(PARENT, 'Parent'), (CHILD, 'Child')]

    role     = models.CharField(max_length=10, choices=ROLE_CHOICES)
    language = models.CharField(max_length=20, default='english')

    def is_parent(self):
        return self.role == self.PARENT

    def is_child(self):
        return self.role == self.CHILD

    def __str__(self):
        return f"{self.username} ({self.role})"


class ChildProfile(models.Model):
    LANGUAGE_CHOICES = [
        ('tamil',   'Tamil'),
        ('english', 'English'),
        ('hindi',   'Hindi'),
    ]
    user        = models.OneToOneField(User, on_delete=models.CASCADE,
                                       related_name='child_profile')
    parent      = models.ForeignKey(User, on_delete=models.CASCADE,
                                    related_name='children',
                                    null=True, blank=True)
    age         = models.PositiveIntegerField(
                      default=10,
                      validators=[MinValueValidator(3), MaxValueValidator(17)]
                  )
    language    = models.CharField(max_length=20,
                                   choices=LANGUAGE_CHOICES,
                                   default='tamil')
    points      = models.PositiveIntegerField(default=0)  # can't go negative
    screen_mins = models.PositiveIntegerField(default=0)  # can't go negative
    avatar      = models.ImageField(upload_to='avatars/',
                                    null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} (age {self.age})"

    def add_points(self, amount: int):
        """Use this instead of profile.points += x directly."""
        self.points += amount
        self.save(update_fields=['points'])

    def add_screen_time(self, minutes: int):
        """Track screen time usage."""
        self.screen_mins += minutes
        self.save(update_fields=['screen_mins'])


class ParentProfile(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE,
                                      related_name='parent_profile')
    phone      = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Parent: {self.user.username}"