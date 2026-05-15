from rest_framework import serializers

from .models import Habit, HabitLog


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ["id", "name", "description", "color", "icon", "created_at"]
        read_only_fields = ["id", "created_at"]


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ["id", "habit", "date", "completed_at"]
        read_only_fields = ["id", "completed_at"]


class HabitTodaySerializer(serializers.ModelSerializer):
    completed_today = serializers.BooleanField(read_only=True)
    current_streak = serializers.IntegerField(read_only=True)

    class Meta:
        model = Habit
        fields = [
            "id",
            "name",
            "description",
            "color",
            "icon",
            "created_at",
            "completed_today",
            "current_streak",
        ]
        read_only_fields = fields


class StreakSerializer(serializers.Serializer):
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
