from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search_movies, name='search_movies'),
    path('movies/<int:tmdb_id>/', views.movie_detail, name='movie_detail'),
    path('ratings/', views.ratings_list_create, name='ratings_list_create'),
    path('ratings/<int:tmdb_id>/', views.rating_detail, name='rating_detail'),
]