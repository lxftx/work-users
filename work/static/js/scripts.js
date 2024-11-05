document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body'),
    btnLogin = body.querySelector('.navigate__login'),
    modal = body.querySelector('.modal')
    alert = body.querySelector('.alert'),
    domain = 'http://127.0.0.1:8000/';

    alert.style.display = "none";
    autoLogin();

    btnLogin.addEventListener('click', createAuthModal)

    // Функция создания модального окна
    function createAuthModal() {
        body.style.overflow = "hidden";
        const textHtmlForm = `
        <div class="modal__wrapper">
            <img class="modal__close" src="/static/icons/cross-svgrepo-com.svg" alt="close">
            <div class="modal__title">Авторизация</div>
            <div class="modal__inputs">
                <form action="" method="post">
                    <input type="text" placeholder="Ваш Email" name="email" class="modal__inputs-input">
                    <input type="password" name="password" class="modal__inputs-input">
                    <button type="submit" class="modal__inputs-button">Войти</button>
                </form>
            </div>
        </div>`
        modal.classList.add('hidden');
        modal.innerHTML += textHtmlForm.trim();
        addEventButton();
        
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(modal.querySelector('form')),
            data = Object.fromEntries(formData.entries());
            formAuth(data);
        });
    }

    async function createEditingModal(record) {
        const position = await fetchWithAuth(domain + 'api/v1/position/');
        const user = await fetchWithAuth(domain + `api/v1/user/${record.name}/`);
        
        let htmlOption = '<option value="">----------</option>';
        position.forEach(item => {
            if (item.pk == user.position.pk) {
                htmlOption += `<option value="${item.pk}" selected>${item.name}</option>`;
            } else {
                htmlOption += `<option value="${item.pk}">${item.name}</option>`;
            }
        });
    
        body.style.overflow = "hidden";
        const textHtmlForm = `
        <div class="modal__wrapper">
            <img class="modal__close" src="/static/icons/cross-svgrepo-com.svg" alt="close">
            <div class="modal__title">Пользователь<br/>${user.full_name}</div>
            <div class="modal__inputs">
                <form id="updateForm">
                    <input type="text" placeholder="Email" name="email" class="modal__inputs-input" value="${user.email}">
                    <input type="text" placeholder="ФИО" name="full_name" class="modal__inputs-input" value="${user.full_name}">
                    <select class="modal__inputs-input" name="position">
                        ${htmlOption}
                    </select>
                    <div class="modal__inputs">Уволен? 
                        <input class="modal__inputs-checkbox" type="checkbox" name="is_dismissed" ${user.is_dismissed ? "checked" : ""} />
                    </div>
                    <div class="modal__inputs-input">Дата удаления - ${user.is_dismissed ? user.date_dismissed : "Нет"}</div>
                    <button type="submit" name="${user.pk}" class="modal__inputs-button">Обновить</button>
                </form>
            </div>
        </div>`;
        
        modal.classList.add('hidden');
        modal.innerHTML += textHtmlForm;
        addUpdateEvent(user.pk);
        addEventButton(); // для добавления событий закрытия модального окна
    }


    function closeModal() {
        modal.classList.remove('hidden');
        modal.querySelector(".modal__wrapper").remove();
    }

    function addEventButton() {
        const btnClose = modal.querySelector('.modal__close');
        btnClose.addEventListener('click', closeModal);
    }

    function addAuthSettings() {
        btnLogin.querySelector('img').src = '/static/icons/user-block-alt-svgrepo-com.svg';
        btnLogin.removeEventListener('click', createAuthModal)
        btnLogin.addEventListener('click', logout);
        body.querySelector('.navigate__username').innerHTML = localStorage.getItem('email');
    }

    // Функция для аутентификации
    function formAuth(formData) {
        fetch(domain + 'api/token/', {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
            localStorage.setItem('access', data['access']);
            localStorage.setItem('refresh', data['refresh']);
            localStorage.setItem('email', formData.email);
            closeModal();
            addAuthSettings();
        })
        .catch(() => showAuthError());
    }

    // Функция выхода пользователя
    function logout() {
        btnLogin.querySelector('img').src = '/static/icons/user-svgrepo-com.svg';
        body.querySelector('.navigate__username').innerHTML = '';
        localStorage.removeItem('email');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        btnLogin.addEventListener('click', createAuthModal);
    }

    async function autoLogin() {
        let access = localStorage.getItem('access');
        if (!access) return
        const response = await fetch(domain + 'api/token/verify/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "token":access })
        })
        if (response.ok) addAuthSettings();

        if (!response.ok) {
            if (await refreshAccessToken()) addAuthSettings()
        };

    }

    // Функция для обновления токена
    async function refreshAccessToken() {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) {
            throw openAlert("Авторизируйтесь снова!");
        }

        const response = await fetch(domain + 'api/token/refresh/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh })
        });

        if (!response.ok) {
            throw openAlert("Не удалось обновить токен.");
            // throw new Error("Не удалось обновить токен.");
        }

        const data = await response.json();
        localStorage.setItem('access', data['access']);
        return data['access'];
    }

    // Функция для выполнения защищенных запросов с автоматическим обновлением access-токена
    async function fetchWithAuth(url, options = {}) {
        try {
            let access = localStorage.getItem('access');
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${access}`,
            };
    
            let response = await fetch(url, options);
            if (response.status === 401) {
                access = await refreshAccessToken();
                options.headers['Authorization'] = `Bearer ${access}`;
                response = await fetch(url, options);
            }
    
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail || `Ошибка при выполнении запроса: ${response.statusText}`;
                throw new Error(errorMessage);
            }
    
            return await response.json();
        } catch (error) {
            console.error("Ошибка при выполнении защищенного запроса:", error);
            throw openAlert(`Ошибка при выполнении защищенного запроса: ${error.message}`);
        }
    }
    

    // Функция для отображения сообщения об ошибке
    function showAuthError() {
        const inputs = modal.querySelector('.modal__inputs');
        inputs.querySelectorAll('input').forEach(item => item.style.border = '1px solid red');
        if (!inputs.querySelector('.error-message')) {
            const errorMessage = document.createElement('p');
            errorMessage.classList.add('error-message');
            errorMessage.textContent = "Не найдено активной учетной записи с указанными данными";
            inputs.appendChild(errorMessage);
        }

        // Очистка сообщения об ошибке на вводе данных
        inputs.querySelectorAll('input').forEach(item => {
            item.addEventListener('input', () => clearForm(inputs));
        });
    }

    // Функция для очистки формы и сообщения об ошибке
    function clearForm(form) {
        form.querySelectorAll('input').forEach(item => item.style.border = '1px solid black');
        const errorMessage = form.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();
    }


    async function getFullUser() {
        const data = await fetch(domain + 'api/v1/user');
        if (!data.ok) throw openAlert(data("Ошибка сервера!"))
        getUsers(await data.json());
    }
    getFullUser();

    async function getUsers(data) {
        let html = '';
        data.forEach(item => {
            html += `
            <tr>
                        <td>${item.full_name}</td>
                        <td>${item.email}</td>
                        <td>${item.position.name}</td>
                        <td>${item.is_dismissed ? "Да" : "Нет"}</td>
                        <td>${item.is_dismissed ? item.date_dismissed : "Нет"}</td>
                        <td>
                            <button name="${item.pk}" class="btn-edit"><i class="fa fa-folder"></i></button>
                            <button name="${item.pk}" class="btn-del"><i class="fa fa-close"></i></button>
                        </td>
                    </tr>
            `
        });

        const table = body.querySelector('table');
        table.innerHTML += html;
        addEventBtn();
    }


    function clearTable() {
        const trs = body.querySelectorAll('table tr');
        trs.forEach((item,idx) => { if(idx != 0) item.remove() });
    }

    function addEventBtn() {
        const btnEdit = body.querySelectorAll('.btn-edit'),
            btnDel = body.querySelectorAll('.btn-del');
        btnEdit.forEach(item => {
            item.addEventListener("click", () => {createEditingModal(item)});
        });
        btnDel.forEach(item => {
            item.addEventListener('click', () => {deleteRecord(item)});
        });
    }

    async function deleteRecord(item) {
        await fetchWithAuth(domain + `api/v1/user/${item.name}/`, {"method": "DELETE"});
        clearTable();
        getUsers();
        return true;
    }

    function addUpdateEvent(pk) {
        const form = modal.querySelector('#updateForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            updateRecord(pk);
        });
    }
    
    async function updateRecord(pk) {
        const form = modal.querySelector('#updateForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        data.is_dismissed = form.querySelector('input[name="is_dismissed"]').checked;

        if (data.is_dismissed) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            data.date_dismissed = `${year}-${month}-${day}`;
        } else {
            // Если чекбокс не отмечен, очищаем дату увольнения
            data.date_dismissed = null;
        }
    
        data.position = parseInt(data.position, 10);
        
        const response = await fetchWithAuth(domain + `api/v1/user/${pk}/`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        closeModal();
        clearTable();
        getUsers();
    }


    function openAlert(text) {
        if (window.getComputedStyle(alert).display == 'block') return
        alert.style.display = "block";
        alert.style.backgroundColor = "red";
        alert.innerHTML = text;
        setTimeout(() => {
            alert.style.display = "none";
            alert.innerHTML = "";
        }, 3000);
    }

    // Запросы к фильтрам

    async function getUsersForEmailFilter(txt) {
        const data = await fetch(domain + '/api/v1/user/?email__icontains=' + txt)
        clearTable();
        getUsers(await data.json());
    }

    async function getUsersForFullNameFilter(txt) {
        const data = await fetch(domain + '/api/v1/user/?full_name__icontains=' + txt)
        clearTable();
        getUsers(await data.json());
    }

    async function getUsersForDateDissmisedFilter(obj) {
        const data = await fetch(domain + `/api/v1/user/?date_dismissed__gte=${obj.date__lte}&date_dismissed__lte=${obj.date__gte}`)
        clearTable();
        getUsers(await data.json());
    }

    async function getUsersForIsDissmisedFilter(txt) {
        const data = await fetch(domain + `/api/v1/user/?is_dismissed__icontains=${txt}`)
        clearTable();
        getUsers(await data.json());
    }

    // Фильтры
    const navigateSearch = body.querySelector('.navigate__search input');

    navigateSearch.addEventListener('input', (e) => {
        if (e.target.value.search(/[a-zA-Z]+/) != -1) {
            getUsersForEmailFilter(e.target.value);
        } else {
            getUsersForFullNameFilter(e.target.value);
        };
    });

    const dateDissmisedFilter = body.querySelector('.filter .filter__date');

    dateDissmisedFilter.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        getUsersForDateDissmisedFilter(data);
    })

    const chkBoxsDissmised = body.querySelectorAll('.filter__dissmised input');

    chkBoxsDissmised.forEach(chkBoxDissmised => {
        chkBoxDissmised.addEventListener("click", (e) => {
            getUsersForIsDissmisedFilter(e.target.value);
        })
    });
})