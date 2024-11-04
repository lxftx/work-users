import django_filters

from users.models import User


class UserFilter(django_filters.FilterSet):

    class Meta:
        model = User
        fields = {
            'email': ['icontains'],
            'full_name': ['icontains'],
            'is_dismissed': ['icontains'],
            'date_dismissed': ['lte', 'gte'],
        }
