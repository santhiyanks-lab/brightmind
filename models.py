from django.db import models
from django.utils import timezone
from accounts.models import User


class ChatSession(models.Model):
    child      = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name='chat_sessions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.child.username} — {self.created_at.date()}"

    @classmethod
    def get_or_create_today(cls, user):
        """Use this in views instead of the inline get_or_create."""
        return cls.objects.get_or_create(
            child=user,
            created_at__date=timezone.now().date()
        )


class ChatMessage(models.Model):
    SENDER_CHOICES = [('child', 'Child'), ('ai', 'AI')]

    session    = models.ForeignKey(ChatSession, on_delete=models.CASCADE,
                                   related_name='messages')
    sender     = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text       = models.TextField()
    is_safe    = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender}: {self.text[:40]}"