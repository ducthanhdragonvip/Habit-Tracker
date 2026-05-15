import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Habit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    color = models.CharField(max_length=7, default="#db2777")
    icon = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return self.name


class HabitLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField()
    completed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("habit", "date")
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.habit.name} @ {self.date}"
