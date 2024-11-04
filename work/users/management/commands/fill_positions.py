from django.core.management import BaseCommand
from users.models import Position


class Command(BaseCommand):
    POSITIONS = ["Администратор", "Менеджер", "Инженер", "Стажер"]

    def handle(self, *args, **options):
        positions_list = [Position(name=position) for position in self.POSITIONS]
        Position.objects.bulk_create(positions_list)
