from django.urls import path
from django.urls.conf import include
from rest_framework import routers

from users.views import PositionViewSet, UserViewSet, IndexView

app_name = 'users'

router = routers.DefaultRouter()
router.register(r'position', PositionViewSet, basename='position')
router.register(r'user', UserViewSet, basename='user')

urlpatterns = [
    path("", IndexView.as_view(), name='index'),
    path('api/v1/', include(router.urls)),
]