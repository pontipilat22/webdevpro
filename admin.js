// Класс для работы с данными
class DataManager {
    constructor() {
        this.initializeDefaultData();
    }

    // Инициализация данных по умолчанию
    initializeDefaultData() {
        if (!localStorage.getItem('webdev_prices')) {
            const defaultPrices = {
                landing: { price: 50000, duration: '5-7 дней' },
                corporate: { price: 150000, duration: '14-21 день' },
                ecommerce: { price: 250000, duration: '30-45 дней' }
            };
            localStorage.setItem('webdev_prices', JSON.stringify(defaultPrices));
        }

        if (!localStorage.getItem('webdev_portfolio')) {
            const defaultPortfolio = [
                {
                    id: 1,
                    title: 'Интернет-магазин одежды',
                    description: 'Полнофункциональный магазин с каталогом, фильтрами и онлайн-оплатой',
                    category: 'E-commerce',
                    tags: ['React', 'Node.js', 'MongoDB'],
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    url: ''
                },
                {
                    id: 2,
                    title: 'Лендинг для стартапа',
                    description: 'Яркий продающий лендинг с анимациями и интеграцией CRM',
                    category: 'Landing',
                    tags: ['HTML/CSS', 'JavaScript', 'GSAP'],
                    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    url: ''
                },
                {
                    id: 3,
                    title: 'Корпоративный сайт',
                    description: 'Представительский сайт компании с блогом и формами обратной связи',
                    category: 'Corporate',
                    tags: ['WordPress', 'PHP', 'MySQL'],
                    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    url: ''
                }
            ];
            localStorage.setItem('webdev_portfolio', JSON.stringify(defaultPortfolio));
        }
    }

    // Получить цены
    getPrices() {
        return JSON.parse(localStorage.getItem('webdev_prices'));
    }

    // Сохранить цены
    savePrices(prices) {
        localStorage.setItem('webdev_prices', JSON.stringify(prices));
    }

    // Обновить цену
    updatePrice(priceId, data) {
        const prices = this.getPrices();
        prices[priceId] = data;
        this.savePrices(prices);
    }

    // Получить портфолио
    getPortfolio() {
        return JSON.parse(localStorage.getItem('webdev_portfolio'));
    }

    // Сохранить портфолио
    savePortfolio(portfolio) {
        localStorage.setItem('webdev_portfolio', JSON.stringify(portfolio));
    }

    // Добавить проект
    addProject(project) {
        const portfolio = this.getPortfolio();
        project.id = Date.now();
        portfolio.push(project);
        this.savePortfolio(portfolio);
        return project;
    }

    // Обновить проект
    updateProject(id, updatedProject) {
        const portfolio = this.getPortfolio();
        const index = portfolio.findIndex(p => p.id === id);
        if (index !== -1) {
            portfolio[index] = { ...portfolio[index], ...updatedProject };
            this.savePortfolio(portfolio);
            return portfolio[index];
        }
        return null;
    }

    // Удалить проект
    deleteProject(id) {
        const portfolio = this.getPortfolio();
        const filtered = portfolio.filter(p => p.id !== id);
        this.savePortfolio(filtered);
    }

    // Сброс к данным по умолчанию
    resetToDefaults() {
        localStorage.removeItem('webdev_prices');
        localStorage.removeItem('webdev_portfolio');
        this.initializeDefaultData();
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
        }, 3000);
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

    // Простая проверка (в продакшене использовать серверную авторизацию)
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

        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Показываем нужную секцию
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}Section`).classList.add('active');

        // Обновляем заголовок
        const titles = {
            'prices': 'Управление ценами',
            'portfolio': 'Управление портфолио'
        };
        document.getElementById('sectionTitle').textContent = titles[section];
    });
});

// Загрузка всех данных
function loadAllData() {
    loadPrices();
    loadPortfolio();
}

// Загрузка и обработка цен
function loadPrices() {
    const prices = dataManager.getPrices();

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
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const priceId = form.getAttribute('data-price-id');
        const price = parseInt(form.querySelector('[data-field="price"]').value);
        const duration = form.querySelector('[data-field="duration"]').value;

        dataManager.updatePrice(priceId, { price, duration });
        notificationManager.success('Цена успешно обновлена!');
    });
});

// Загрузка портфолио
function loadPortfolio() {
    const portfolio = dataManager.getPortfolio();
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

    // Обработчики кнопок
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
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        category: document.getElementById('projectCategory').value,
        tags: document.getElementById('projectTags').value.split(',').map(t => t.trim()),
        gradient: document.getElementById('projectGradient').value,
        url: document.getElementById('projectUrl').value
    };

    if (editingProjectId) {
        dataManager.updateProject(editingProjectId, projectData);
        notificationManager.success('Проект успешно обновлён!');
    } else {
        dataManager.addProject(projectData);
        notificationManager.success('Проект успешно добавлен!');
    }

    loadPortfolio();
    closeModal();
});

// Редактирование проекта
function editProject(id) {
    const portfolio = dataManager.getPortfolio();
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
function deleteProject(id) {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        dataManager.deleteProject(id);
        loadPortfolio();
        notificationManager.success('Проект успешно удалён!');
    }
}

// Сброс данных
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите сбросить все данные к значениям по умолчанию?')) {
        dataManager.resetToDefaults();
        loadAllData();
        notificationManager.info('Данные сброшены к значениям по умолчанию');
    }
});

console.log('Admin panel initialized! 🔧');