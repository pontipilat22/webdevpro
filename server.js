const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, 'data.json');

// Инициализация данных по умолчанию
function initializeData() {
    const defaultData = {
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
