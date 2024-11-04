from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class Position(models.Model):
    """Модель Должности"""
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.pk} {self.name}"

    class Meta:
        verbose_name = "Должность"
        verbose_name_plural = "Должности"


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, position, password=None):
        if not email:
            raise ValueError("Email является обязательным аргументом")
        user = self.model(email=self.normalize_email(email),
                          full_name=full_name,
                          position=Position.objects.get(pk=position))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, position=1, password=None):
        user = self.create_user(email=email,
                                full_name=full_name,
                                position=position,
                                password=password)
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """Кастомная модель Пользователя"""
    email = models.EmailField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255)
    position = models.ForeignKey(to=Position, on_delete=models.SET_NULL, null=True, blank=True)
    is_dismissed = models.BooleanField(default=False)
    date_dismissed = models.DateField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'position']

    def __str__(self):
        return f"{self.pk}. {self.full_name}"

    def has_perm(self, perm, obj=None):
        """Проверка разрешения для конкретного действия.
        True для всех пользователей, у которых есть доступ к админке.
        """
        return True

    def has_module_perms(self, app_label):
        """Проверка разрешения для работы с приложением.
        True, чтобы пользователь с доступом в админку мог видеть все приложения."""
        return True


    @property
    def is_staff(self):
        return self.is_admin

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = "Пользователи"
        ordering = ['position__id']
