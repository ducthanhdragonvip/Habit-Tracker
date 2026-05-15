from django.contrib import admin

from .models import Habit, HabitLog


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ("name", "color", "icon", "created_at")


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ("habit", "date", "completed_at")
    list_filter = ("date",)
