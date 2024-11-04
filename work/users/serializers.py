from django.contrib.auth import authenticate
from rest_framework import serializers

from users.models import Position, User


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ('pk', 'name')


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'full_name', 'email', 'position', 'is_dismissed', 'date_dismissed')


class UserSerializer(serializers.ModelSerializer):
    position = PositionSerializer()

    class Meta:
        model = User
        fields = ('pk', 'full_name', 'email', 'position', 'is_dismissed', 'date_dismissed')
