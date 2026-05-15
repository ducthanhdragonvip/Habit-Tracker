from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Habit, HabitLog
from .serializers import HabitLogSerializer, HabitSerializer, HabitTodaySerializer, StreakSerializer


def _current_streak(habit: Habit, today=None) -> int:
    today = today or timezone.localdate()
    dates = set(habit.logs.values_list("date", flat=True))
    if not dates:
        return 0
    cursor = today
    if cursor not in dates:
        cursor = cursor - timedelta(days=1)
        if cursor not in dates:
            return 0
    streak = 0
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _longest_streak(habit: Habit) -> int:
    dates = sorted(habit.logs.values_list("date", flat=True))
    if not dates:
        return 0
    longest = 1
    run = 1
    for prev, curr in zip(dates, dates[1:]):
        if (curr - prev).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1
    return longest


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def check(self, request, pk=None):
        habit = self.get_object()
        today = timezone.localdate()
        log = HabitLog.objects.filter(habit=habit, date=today).first()
        if log:
            log.delete()
            completed_today = False
        else:
            HabitLog.objects.create(habit=habit, date=today)
            completed_today = True
        return Response(
            {
                "id": str(habit.id),
                "date": today.isoformat(),
                "completed_today": completed_today,
                "current_streak": _current_streak(habit, today),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def log(self, request, pk=None):
        habit = self.get_object()
        date_str = request.data.get("date")
        if not date_str:
            return Response({"detail": "date is required (YYYY-MM-DD)."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            log_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return Response({"detail": "date must be in YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)
        today = timezone.localdate()
        if log_date > today:
            return Response({"detail": "Cannot log a habit for a future date."}, status=status.HTTP_400_BAD_REQUEST)
        existing = HabitLog.objects.filter(habit=habit, date=log_date).first()
        if existing:
            existing.delete()
            completed = False
        else:
            HabitLog.objects.create(habit=habit, date=log_date)
            completed = True
        return Response(
            {
                "date": log_date.isoformat(),
                "completed": completed,
                "current_streak": _current_streak(habit, today),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        habit = self.get_object()
        qs = habit.logs.all().order_by("date")
        since = request.query_params.get("since")
        if since:
            qs = qs.filter(date__gte=since)
        return Response(HabitLogSerializer(qs, many=True).data)

    @action(detail=True, methods=["get"])
    def streak(self, request, pk=None):
        habit = self.get_object()
        data = {
            "current_streak": _current_streak(habit),
            "longest_streak": _longest_streak(habit),
        }
        return Response(StreakSerializer(data).data)

    @action(detail=False, methods=["get"])
    def today(self, request):
        today = timezone.localdate()
        habits = list(self.get_queryset())
        completed_ids = set(
            HabitLog.objects.filter(habit__in=habits, date=today).values_list("habit_id", flat=True)
        )
        payload = []
        for habit in habits:
            payload.append(
                {
                    "id": habit.id,
                    "name": habit.name,
                    "description": habit.description,
                    "color": habit.color,
                    "icon": habit.icon,
                    "created_at": habit.created_at,
                    "completed_today": habit.id in completed_ids,
                    "current_streak": _current_streak(habit, today),
                }
            )
        return Response(HabitTodaySerializer(payload, many=True).data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        habits = list(Habit.objects.filter(user=request.user))
        total = len(habits)
        completed_ids = set(
            HabitLog.objects.filter(habit__in=habits, date=today).values_list("habit_id", flat=True)
        )
        completed_today = len(completed_ids)
        completion_rate = (completed_today / total) if total else 0.0
        summary = []
        best_streak = 0
        for habit in habits:
            cs = _current_streak(habit, today)
            if cs > best_streak:
                best_streak = cs
            summary.append(
                {
                    "id": str(habit.id),
                    "name": habit.name,
                    "color": habit.color,
                    "icon": habit.icon,
                    "current_streak": cs,
                    "completed_today": habit.id in completed_ids,
                }
            )
        return Response(
            {
                "total_habits": total,
                "completed_today": completed_today,
                "completion_rate_today": round(completion_rate, 4),
                "best_current_streak": best_streak,
                "habits_summary": summary,
            }
        )
