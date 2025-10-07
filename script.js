// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicData();
    initScrollAnimations();
    initNavbar();
    initSmoothScroll();
    initMobileMenu();
    initTypingEffect();

    // Автообновление при изменениях в LocalStorage (из админки)
    window.addEventListener('storage', (e) => {
        if (e.key === 'webdev_prices' || e.key === 'webdev_portfolio') {
            console.log('Данные обновлены из админ-панели, перезагружаем...');
            loadDynamicData();
        }
    });
});

// Инициализация данных по умолчанию (если их нет)
function initializeDefaultData() {
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

// Загрузка динамических данных из LocalStorage
function loadDynamicData() {
    // Сначала инициализируем данные если их нет
    initializeDefaultData();

    // Затем загружаем
    loadPrices();
    loadPortfolio();
}

// Загрузка цен из LocalStorage
function loadPrices() {
    const prices = localStorage.getItem('webdev_prices');

    if (!prices) return;

    const pricesData = JSON.parse(prices);

    // Обновляем цены на странице
    const priceMapping = {
        'landing': 0,
        'corporate': 1,
        'ecommerce': 2
    };

    Object.keys(priceMapping).forEach(key => {
        const data = pricesData[key];
        if (data) {
            const priceCards = document.querySelectorAll('.price-card');
            const card = priceCards[priceMapping[key]];

            if (card) {
                // Обновляем цену
                const priceValue = card.querySelector('.price-value');
                if (priceValue) {
                    priceValue.textContent = data.price.toLocaleString('ru-RU');
                }

                // Обновляем срок выполнения
                const features = card.querySelectorAll('.price-features li');
                const durationLi = features[features.length - 1];
                if (durationLi) {
                    durationLi.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Срок: ${data.duration}
                    `;
                }
            }
        }
    });
}

// Загрузка портфолио из LocalStorage
function loadPortfolio() {
    const portfolio = localStorage.getItem('webdev_portfolio');

    if (!portfolio) return;

    const portfolioData = JSON.parse(portfolio);
    const portfolioGrid = document.querySelector('.portfolio-grid');

    if (!portfolioGrid) return;

    // Очищаем существующие элементы
    portfolioGrid.innerHTML = '';

    // Создаём новые элементы из данных
    portfolioData.forEach(project => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';

        // Если есть URL, делаем карточку кликабельной
        if (project.url) {
            portfolioItem.style.cursor = 'pointer';
            portfolioItem.addEventListener('click', () => {
                window.open(project.url, '_blank');
            });
        }

        const tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

        // Определяем контент для предпросмотра
        let imageContent;
        if (project.url) {
            // Если есть URL, показываем iframe
            imageContent = `
                <div class="portfolio-iframe-wrapper">
                    <iframe src="${project.url}" frameborder="0" scrolling="no" loading="lazy"></iframe>
                    <div class="portfolio-overlay">
                        <span class="portfolio-category">${project.category}</span>
                        <button class="portfolio-view-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Открыть сайт
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Если нет URL, показываем градиент
            imageContent = `
                <div class="portfolio-placeholder" style="background: ${project.gradient};">
                    <span>${project.category}</span>
                </div>
            `;
        }

        portfolioItem.innerHTML = `
            <div class="portfolio-image">
                ${imageContent}
            </div>
            <div class="portfolio-content">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="portfolio-tags">
                    ${tagsHTML}
                </div>
            </div>
        `;

        portfolioGrid.appendChild(portfolioItem);
    });

    // Переинициализируем hover эффекты для новых элементов
    initPortfolioHoverEffects();
}

// Инициализация hover эффектов для портфолио
function initPortfolioHoverEffects() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// Анимация появления секций при прокрутке
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Наблюдаем за всеми элементами с классом fade-in
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Эффекты навигации при скролле
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Добавляем класс при скролле
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Плавная прокрутка к якорям
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();

                // Закрываем мобильное меню если открыто
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    document.querySelector('.mobile-menu-btn').classList.remove('active');
                    document.body.style.overflow = '';
                }

                // Прокручиваем к секции
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Мобильное меню
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Блокируем скролл body при открытом меню
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
}

// Эффект печатающегося текста в code window
function initTypingEffect() {
    const codeContent = document.querySelector('.window-content code');

    if (!codeContent) return;

    const text = codeContent.innerHTML;
    codeContent.innerHTML = '';

    let index = 0;
    const speed = 30;

    function type() {
        if (index < text.length) {
            // Добавляем по одному символу, сохраняя HTML теги
            const char = text.charAt(index);

            if (char === '<') {
                // Если встретили открывающий тег, добавляем весь тег целиком
                const closingIndex = text.indexOf('>', index);
                codeContent.innerHTML += text.substring(index, closingIndex + 1);
                index = closingIndex + 1;
            } else {
                codeContent.innerHTML += char;
                index++;
            }

            setTimeout(type, speed);
        }
    }

    // Запускаем эффект печатания через 500мс после загрузки
    setTimeout(type, 500);
}

// Параллакс эффект для hero секции
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero && scrolled < window.innerHeight) {
        const codeWindow = document.querySelector('.code-window');
        if (codeWindow) {
            codeWindow.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }
});

// Анимация чисел в статистике
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const hasPlus = text.includes('+');
                const hasPercent = text.includes('%');
                const number = parseInt(text.replace(/\D/g, ''));

                if (!isNaN(number)) {
                    animateNumber(target, number, hasPlus, hasPercent);
                    observer.unobserve(target);
                }
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element, target, hasPlus = false, hasPercent = false) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
        }
    }, stepTime);
}

// Инициализируем анимацию чисел
animateNumbers();

// Hover эффекты для карточек
document.addEventListener('DOMContentLoaded', () => {
    // Service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Portfolio items
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Price cards
    const priceCards = document.querySelectorAll('.price-card');
    priceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
});

// Оптимизация производительности для скролла
let ticking = false;

function handleScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Здесь можно добавить дополнительные эффекты при скролле
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Добавление класса visible при загрузке для элементов в viewport
window.addEventListener('load', () => {
    const elementsInView = document.querySelectorAll('.fade-in');

    elementsInView.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isInView) {
            element.classList.add('visible');
        }
    });
});

// Cursor trail эффект (опционально)
if (window.innerWidth > 768) {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll('.circle');

    // Можно добавить кастомный курсор для десктопа
}

console.log('WebDev Pro website initialized! 🚀');
console.log('Ready to create amazing websites! 💻');