from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class MovieRating(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    poster_url = models.URLField(max_length=500, blank=True, null=True)
    release_date = models.CharField(max_length=20, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    runtime = models.CharField(max_length=30, blank=True, null=True)

    score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - Nota: {self.score}/5"