<h1>Описание проекта</h1>
<p>Данный проект реализует кастомную модель пользователя и систему управления пользователями с использованием Django и Django REST Framework. Программа позволяет управлять пользователями и их ролями, а также предоставляет различные уровни доступа на основе их должностей.</p>

<h2>Установка</h2>
<h3>Клонирование репозитория:</h3>
<pre><code>git clone &lt;URL&gt;
cd &lt;папка с проектом&gt;</code></pre>

<h3>Создание и активация виртуального окружения:</h3>
<pre><code>python -m venv venv
source venv/bin/activate  # Для Linux/Mac
venv\Scripts\activate     # Для Windows</code></pre>

<h3>Установка зависимостей:</h3>
<pre><code>pip install -r requirements.txt</code></pre>

<h3>Настройка базы данных:</h3>
<p>Настройте базу данных в файле переменного окружения <code>.env</code>.</p>

<h3>Применение миграций:</h3>
<pre><code>python manage.py migrate</code></pre>

<h3>Создание суперпользователя:</h3>
<pre><code>python manage.py createsuperuser</code></pre>

<h3>Создание Администратора системы:</h3>
<pre><code>User.objects.create_superuser(email, full_name, password)</code></pre>

<h3>Создание обычного пользователя:</h3>
<pre><code>User.objects.create_user(email, full_name, position, password)</code></pre>

<h3>Запуск сервера:</h3>
<pre><code>python manage.py runserver</code></pre>

<h2>Модели</h2>
<h3>Position</h3>
<p>Модель для хранения должностей пользователей.</p>
<ul>
    <li><strong>name:</strong> Название должности.</li>
</ul>

<h3>User</h3>
<p>Кастомная модель пользователя, наследуемая от AbstractBaseUser.</p>
<ul>
    <li><strong>email:</strong> Электронная почта (уникальное поле).</li>
    <li><strong>full_name:</strong> Полное имя пользователя.</li>
    <li><strong>position:</strong> Внешний ключ на модель Position.</li>
    <li><strong>is_dismissed:</strong> Флаг увольнения.</li>
    <li><strong>date_dismissed:</strong> Дата увольнения.</li>
    <li><strong>is_active:</strong> Флаг активности пользователя.</li>
    <li><strong>is_admin:</strong> Флаг администратора.</li>
</ul>

<h2>Управляющие классы</h2>
<h3>UserManager</h3>
<p>Управляющий класс для создания пользователей и суперпользователей.</p>
<ul>
    <li><strong>create_user:</strong> Метод для создания обычного пользователя.</li>
    <li><strong>create_superuser:</strong> Метод для создания суперпользователя.</li>
</ul>

<h2>Права доступа</h2>
<ul>
    <li><strong>IsAdminOrReadOnly:</strong> Разрешает удаление только администраторам.</li>
    <li><strong>IsEditorOrAdmin:</strong> Разрешает редактирование администраторам и редакторам.</li>
    <li><strong>IsReadOnly:</strong> Разрешает только чтение для администраторов, менеджеров и инженеров.</li>
    <li><strong>IsNotIntern:</strong> Запрещает доступ стажерам к информации о пользователях.</li>
</ul>

<h2>Сериализаторы</h2>
<h3>PositionSerializer</h3>
<p>Сериализатор для модели Position.</p>

<h3>UserSerializer</h3>
<p>Сериализатор для модели User, включающий информацию о должности.</p>

<h3>UserUpdateSerializer</h3>
<p>Сериализатор для обновления информации о пользователе.</p>

<h2>Представления</h2>
<h3>IndexView</h3>
<p>Отображает главную страницу.</p>

<h3>PositionViewSet</h3>
<p>Представление для управления должностями с использованием REST API.</p>

<h3>UserViewSet</h3>
<p>Представление для управления пользователями с использованием REST API.</p>

<h3>CustomTokenObtainPairView</h3>
<p>Кастомизированное представление для получения токена доступа с проверкой статуса пользователя (уволены ли они).</p>

<h2>Команды управления</h2>
<h3>Command для добавления должностей</h3>
<p>Команда для добавления предопределённых должностей ("Администратор", "Менеджер", "Инженер", "Стажер") в модель <code>Position</code>.</p>

<pre>
<code>
from django.core.management import BaseCommand
from users.models import Position

class Command(BaseCommand):
    POSITIONS = ["Администратор", "Менеджер", "Инженер", "Стажер"]

    def handle(self, *args, **options):
        positions_list = [Position(name=position) for position in self.POSITIONS]
        Position.objects.bulk_create(positions_list)
</code>
</pre>

<p>Чтобы запустить команду, используйте:</p>
<pre><code>python manage.py &lt;имя_команды&gt;</code></pre>

<h2>Использование</h2>
<p>После запуска сервера можно использовать API для управления пользователями и должностями:</p>
<ul>
    <li><strong>Для получения списка пользователей:</strong> <code>GET /api/users/</code></li>
    <li><strong>Для создания нового пользователя:</strong> <code>POST /api/users/</code></li>
    <li><strong>Для обновления пользователя:</strong> <code>PUT /api/users/{id}/</code></li>
    <li><strong>Для удаления пользователя:</strong> <code>DELETE /api/users/{id}/</code></li>
</ul>
<p>Доступ к API контролируется на основе должности пользователя.</p>

