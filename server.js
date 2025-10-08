const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, 'data.json');

// Функции для работы с паролями
function hashPassword(password, salt = null) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return { hash, salt };
}

function verifyPassword(password, hash, salt) {
    const { hash: newHash } = hashPassword(password, salt);
    return hash === newHash;
}

// Инициализация данных по умолчанию
function initializeData() {
    const defaultPassword = hashPassword('admin123');

    const defaultData = {
        admin: {
            username: 'admin',
            passwordHash: defaultPassword.hash,
            passwordSalt: defaultPassword.salt
        },
        prices: {
            landing: { price: 50000, duration: '5-7 дней' },
            corporate: { price: 150000, duration: '14-21 день' },
            ecommerce: { price: 250000, duration: '30-45 дней' }
        },
        portfolio: [
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
        ]
    };

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
}

// Инициализация при запуске
initializeData();

// Получить все данные
app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Получить цены
app.get('/api/prices', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data.prices);
    } catch (error) {
        console.error('Error reading prices:', error);
        res.status(500).json({ error: 'Failed to read prices' });
    }
});

// Обновить цены
app.post('/api/prices', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.prices = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, prices: data.prices });
    } catch (error) {
        console.error('Error updating prices:', error);
        res.status(500).json({ error: 'Failed to update prices' });
    }
});

// Получить портфолио
app.get('/api/portfolio', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data.portfolio);
    } catch (error) {
        console.error('Error reading portfolio:', error);
        res.status(500).json({ error: 'Failed to read portfolio' });
    }
});

// Обновить портфолио
app.post('/api/portfolio', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.portfolio = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, portfolio: data.portfolio });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ error: 'Failed to update portfolio' });
    }
});

// Получить заявки
app.get('/api/orders', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data.orders || []);
    } catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

// Добавить заявку
app.post('/api/orders', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (!data.orders) {
            data.orders = [];
        }

        const newOrder = {
            id: Date.now(),
            ...req.body,
            status: 'new',
            createdAt: new Date().toISOString()
        };

        data.orders.unshift(newOrder); // Добавляем в начало массива
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Обновить статус заявки
app.patch('/api/orders/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const orderId = parseInt(req.params.id);
        const orderIndex = data.orders.findIndex(o => o.id === orderId);

        if (orderIndex !== -1) {
            data.orders[orderIndex] = { ...data.orders[orderIndex], ...req.body };
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true, order: data.orders[orderIndex] });
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Удалить заявку
app.delete('/api/orders/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const orderId = parseInt(req.params.id);
        data.orders = data.orders.filter(o => o.id !== orderId);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Сброс к данным по умолчанию
app.post('/api/reset', (req, res) => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            fs.unlinkSync(DATA_FILE);
        }
        initializeData();
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error resetting data:', error);
        res.status(500).json({ error: 'Failed to reset data' });
    }
});

// Аутентификация
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

        if (!data.admin) {
            return res.status(500).json({ error: 'Admin user not configured' });
        }

        if (username === data.admin.username) {
            const isValid = verifyPassword(password, data.admin.passwordHash, data.admin.passwordSalt);
            if (isValid) {
                return res.json({ success: true, message: 'Login successful' });
            }
        }

        res.status(401).json({ success: false, error: 'Invalid credentials' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Смена пароля
app.post('/api/auth/change-password', (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

        if (!data.admin) {
            return res.status(500).json({ error: 'Admin user not configured' });
        }

        // Проверяем текущий пароль
        const isValid = verifyPassword(currentPassword, data.admin.passwordHash, data.admin.passwordSalt);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        // Устанавливаем новый пароль
        const newPasswordData = hashPassword(newPassword);
        data.admin.passwordHash = newPasswordData.hash;
        data.admin.passwordSalt = newPasswordData.salt;

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Админ панель
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Main site: http://localhost:${PORT}`);
    console.log(`⚙️  Admin panel: http://localhost:${PORT}/admin`);
});
