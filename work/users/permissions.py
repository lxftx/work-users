from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Разрешает удаление только администраторам.
    """

    def has_permission(self, request, view):
        if view.action == 'destroy':
            return request.user.is_authenticated and request.user.position.name == 'Администратор'
        return True


class IsEditorOrAdmin(permissions.BasePermission):
    """
    Разрешает редактирование как администраторам, так и редакторам.
    """

    def has_permission(self, request, view):
        if view.action in ['update', 'partial_update']:
            return request.user.is_authenticated and request.user.position.name in ['Администратор', 'Менеджер']
        return True


class IsReadOnly(permissions.BasePermission):
    """
    Разрешает только читать
    """

    def has_permission(self, request, view):
        if view.action in ['get']:
            return (request.user.is_authenticated and
                    request.user.position.name in ['Администратор', 'Менеджер', 'Инженер'])
        return True

class IsNotIntern(permissions.BasePermission):
    """
    Запрещает стажерам доступ к информации о пользователях.
    """

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.position.name == 'Стажер':
            return False
        return True
