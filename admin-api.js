// API URL (автоматически определяется)
const API_URL = window.location.origin + '/api';

// Класс для работы с данными через API
class DataManager {
    constructor() {
        // Данные загружаются с сервера
    }

    // Получить цены
    async getPrices() {
        try {
            const response = await fetch(`${API_URL}/prices`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching prices:', error);
            return {};
        }
    }

    // Сохранить цены
    async savePrices(prices) {
        try {
            const response = await fetch(`${API_URL}/prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prices)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving prices:', error);
            throw error;
        }
    }

    // Обновить цену
    async updatePrice(priceId, data) {
        const prices = await this.getPrices();
        prices[priceId] = data;
        await this.savePrices(prices);
    }

    // Получить портфолио
    async getPortfolio() {
        try {
            const response = await fetch(`${API_URL}/portfolio`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            return [];
        }
    }

    // Сохранить портфолио
    async savePortfolio(portfolio) {
        try {
            const response = await fetch(`${API_URL}/portfolio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(portfolio)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving portfolio:', error);
            throw error;
        }
    }

    // Добавить проект
    async addProject(project) {
        const portfolio = await this.getPortfolio();
        project.id = Date.now();
        portfolio.push(project);
        await this.savePortfolio(portfolio);
        return project;
    }

    // Обновить проект
    async updateProject(id, updatedProject) {
        const portfolio = await this.getPortfolio();
        const index = portfolio.findIndex(p => p.id === id);
        if (index !== -1) {
            portfolio[index] = { ...portfolio[index], ...updatedProject };
            await this.savePortfolio(portfolio);
            return portfolio[index];
        }
        return null;
    }

    // Удалить проект
    async deleteProject(id) {
        const portfolio = await this.getPortfolio();
        const filtered = portfolio.filter(p => p.id !== id);
        await this.savePortfolio(filtered);
    }

    // Получить заявки
    async getOrders() {
        try {
            const response = await fetch(`${API_URL}/orders`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    // Обновить статус заявки
    async updateOrder(id, data) {
        try {
            const response = await fetch(`${API_URL}/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    // Удалить заявку
    async deleteOrder(id) {
        try {
            const response = await fetch(`${API_URL}/orders/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    // Сброс к данным по умолчанию
    async resetToDefaults() {
        try {
            const response = await fetch(`${API_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error resetting data:', error);
            throw error;
        }
    }
}

// Класс для уведомлений
class NotificationManager {
    constructor() {
        this.container = document.getElementById('notifications');
    }

    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;

        this.container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message) {
        this.show(message, 'error');
    }

    info(message) {
        this.show(message, 'info');
    }
}

// Инициализация
const dataManager = new DataManager();
const notificationManager = new NotificationManager();

// Авторизация
const loginForm = document.getElementById('loginForm');
const loginWrapper = document.getElementById('loginWrapper');
const adminWrapper = document.getElementById('adminWrapper');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('isLoggedIn', 'true');
        loginWrapper.style.display = 'none';
        adminWrapper.style.display = 'flex';
        notificationManager.success('Успешный вход в систему!');
        loadAllData();
    } else {
        notificationManager.error('Неверный логин или пароль!');
    }
});

// Проверка авторизации при загрузке
if (sessionStorage.getItem('isLoggedIn') === 'true') {
    loginWrapper.style.display = 'none';
    adminWrapper.style.display = 'flex';
    loadAllData();
}

// Выход
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    location.reload();
});

// Навигация между секциями
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        const section = item.getAttribute('data-section');

        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}Section`).classList.add('active');

        const titles = {
            'prices': 'Управление ценами',
            'portfolio': 'Управление портфолио',
            'orders': 'Заявки клиентов'
        };
        document.getElementById('sectionTitle').textContent = titles[section];
    });
});

// Загрузка всех данных
async function loadAllData() {
    await loadPrices();
    await loadPortfolio();
    await loadOrders();
}

// Загрузка и обработка цен
async function loadPrices() {
    const prices = await dataManager.getPrices();

    document.querySelectorAll('.price-form').forEach(form => {
        const priceId = form.getAttribute('data-price-id');
        const data = prices[priceId];

        if (data) {
            form.querySelector('[data-field="price"]').value = data.price;
            form.querySelector('[data-field="duration"]').value = data.duration;
        }
    });
}

// Сохранение цен
document.querySelectorAll('.price-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const priceId = form.getAttribute('data-price-id');
        const price = parseInt(form.querySelector('[data-field="price"]').value);
        const duration = form.querySelector('[data-field="duration"]').value;

        try {
            await dataManager.updatePrice(priceId, { price, duration });
            notificationManager.success('Цена успешно обновлена! Изменения применены на сайте.');
        } catch (error) {
            notificationManager.error('Ошибка при сохранении цены');
        }
    });
});

// Загрузка портфолио
async function loadPortfolio() {
    const portfolio = await dataManager.getPortfolio();
    const grid = document.getElementById('portfolioGrid');

    grid.innerHTML = '';

    portfolio.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
}

// Создание карточки проекта
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    const tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

    card.innerHTML = `
        <div class="project-card-preview" style="background: ${project.gradient}">
            <span>${project.category}</span>
        </div>
        <div class="project-card-content">
            <h4>${project.title}</h4>
            <p>${project.description}</p>
            ${project.url ? `<div class="project-card-url">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <a href="${project.url}" target="_blank">${project.url}</a>
            </div>` : ''}
            <div class="project-card-tags">
                ${tagsHTML}
            </div>
            <div class="project-card-actions">
                <button class="btn btn-outline btn-edit" data-id="${project.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Редактировать
                </button>
                <button class="btn btn-outline btn-delete" data-id="${project.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Удалить
                </button>
            </div>
        </div>
    `;

    card.querySelector('.btn-edit').addEventListener('click', () => editProject(project.id));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteProject(project.id));

    return card;
}

// Модальное окно
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const projectForm = document.getElementById('projectForm');
const addProjectBtn = document.getElementById('addProjectBtn');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');

let editingProjectId = null;

addProjectBtn.addEventListener('click', () => {
    editingProjectId = null;
    modalTitle.textContent = 'Добавить проект';
    projectForm.reset();
    modal.classList.add('active');
});

modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

function closeModal() {
    modal.classList.remove('active');
    projectForm.reset();
    editingProjectId = null;
}

// Сохранение проекта
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        category: document.getElementById('projectCategory').value,
        tags: document.getElementById('projectTags').value.split(',').map(t => t.trim()),
        gradient: document.getElementById('projectGradient').value,
        url: document.getElementById('projectUrl').value
    };

    try {
        if (editingProjectId) {
            await dataManager.updateProject(editingProjectId, projectData);
            notificationManager.success('Проект успешно обновлён! Изменения применены на сайте.');
        } else {
            await dataManager.addProject(projectData);
            notificationManager.success('Проект успешно добавлен! Изменения применены на сайте.');
        }

        await loadPortfolio();
        closeModal();
    } catch (error) {
        notificationManager.error('Ошибка при сохранении проекта');
    }
});

// Редактирование проекта
async function editProject(id) {
    const portfolio = await dataManager.getPortfolio();
    const project = portfolio.find(p => p.id === id);

    if (project) {
        editingProjectId = id;
        modalTitle.textContent = 'Редактировать проект';

        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectTags').value = project.tags.join(', ');
        document.getElementById('projectGradient').value = project.gradient;
        document.getElementById('projectUrl').value = project.url || '';

        modal.classList.add('active');
    }
}

// Удаление проекта
async function deleteProject(id) {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        try {
            await dataManager.deleteProject(id);
            await loadPortfolio();
            notificationManager.success('Проект успешно удалён! Изменения применены на сайте.');
        } catch (error) {
            notificationManager.error('Ошибка при удалении проекта');
        }
    }
}

// Сброс данных
document.getElementById('resetBtn').addEventListener('click', async () => {
    if (confirm('Вы уверены, что хотите сбросить все данные к значениям по умолчанию?')) {
        try {
            await dataManager.resetToDefaults();
            await loadAllData();
            notificationManager.info('Данные сброшены к значениям по умолчанию');
        } catch (error) {
            notificationManager.error('Ошибка при сбросе данных');
        }
    }
});

// Загрузка заявок
async function loadOrders() {
    const orders = await dataManager.getOrders();
    const container = document.getElementById('ordersContainer');

    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <h3>Пока нет заявок</h3>
                <p>Новые заявки от клиентов будут отображаться здесь</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        container.appendChild(orderCard);
    });
}

// Создание карточки заявки
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const date = new Date(order.createdAt);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusBadge = getStatusBadge(order.status);
    const clientTypeBadge = order.clientType === 'company' ? 'Компания' : 'Физ. лицо';

    card.innerHTML = `
        <div class="order-card-header">
            <div class="order-card-title">
                <h4>${order.name}</h4>
                ${statusBadge}
            </div>
            <div class="order-card-date">${formattedDate}</div>
        </div>
        <div class="order-card-body">
            <div class="order-info-grid">
                <div class="order-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>${order.phone}</span>
                </div>
                ${order.email ? `
                <div class="order-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>${order.email}</span>
                </div>
                ` : ''}
                <div class="order-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>${clientTypeBadge}</span>
                </div>
                ${order.telegram ? `
                <div class="order-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>Связаться в Telegram</span>
                </div>
                ` : ''}
            </div>
            <div class="order-project">
                <strong>Проект:</strong> ${order.projectName}
            </div>
            <div class="order-description">
                <strong>Описание:</strong>
                <p>${order.description}</p>
            </div>
        </div>
        <div class="order-card-actions">
            <select class="order-status-select" data-order-id="${order.id}">
                <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новая</option>
                <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>В работе</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Завершена</option>
            </select>
            <button class="btn btn-outline btn-delete-order" data-id="${order.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Удалить
            </button>
        </div>
    `;

    // Обработчик изменения статуса
    const statusSelect = card.querySelector('.order-status-select');
    statusSelect.addEventListener('change', async (e) => {
        try {
            await dataManager.updateOrder(order.id, { status: e.target.value });
            notificationManager.success('Статус заявки обновлён');
            await loadOrders();
        } catch (error) {
            notificationManager.error('Ошибка при обновлении статуса');
        }
    });

    // Обработчик удаления
    const deleteBtn = card.querySelector('.btn-delete-order');
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
            try {
                await dataManager.deleteOrder(order.id);
                await loadOrders();
                notificationManager.success('Заявка удалена');
            } catch (error) {
                notificationManager.error('Ошибка при удалении заявки');
            }
        }
    });

    return card;
}

// Получить бадж статуса
function getStatusBadge(status) {
    const badges = {
        'new': '<span class="status-badge status-new">Новая</span>',
        'in_progress': '<span class="status-badge status-progress">В работе</span>',
        'completed': '<span class="status-badge status-completed">Завершена</span>'
    };
    return badges[status] || badges['new'];
}

console.log('Admin panel with API initialized! 🔧');
