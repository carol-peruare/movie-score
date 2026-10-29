from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class MovieRating(models.Model):
    # unique=True garante no banco de dados que o mesmo filme não seja avaliado duas vezes
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    poster_url = models.URLField(max_length=500, blank=True, null=True)
    release_date = models.CharField(max_length=20, blank=True, null=True)
    
    # Valida que a nota só pode ser um número inteiro entre 1 e 5
    score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - Nota: {self.score}/5"