// API URL
const API_URL = window.location.origin + '/api';

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicData();
    initScrollAnimations();
    initNavbar();
    initSmoothScroll();
    initMobileMenu();
    initTypingEffect();
});

// Загрузка динамических данных с API
async function loadDynamicData() {
    try {
        await loadPrices();
        await loadPortfolio();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Загрузка цен с API
async function loadPrices() {
    try {
        const response = await fetch(`${API_URL}/prices`);
        const pricesData = await response.json();

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
                    const priceValue = card.querySelector('.price-value');
                    if (priceValue) {
                        priceValue.textContent = data.price.toLocaleString('ru-RU');
                    }

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
    } catch (error) {
        console.error('Error loading prices:', error);
    }
}

// Загрузка портфолио с API
async function loadPortfolio() {
    try {
        const response = await fetch(`${API_URL}/portfolio`);
        const portfolioData = await response.json();

        const portfolioGrid = document.querySelector('.portfolio-grid');

        if (!portfolioGrid) return;

        portfolioGrid.innerHTML = '';

        portfolioData.forEach(project => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item';

            if (project.url) {
                portfolioItem.style.cursor = 'pointer';
                portfolioItem.addEventListener('click', () => {
                    window.open(project.url, '_blank');
                });
            }

            const tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

            let imageContent;
            if (project.url) {
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

        initPortfolioHoverEffects();
    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
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

                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
                    document.body.style.overflow = '';
                }

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
            const char = text.charAt(index);

            if (char === '<') {
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

animateNumbers();

// Hover эффекты для карточек
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

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

console.log('WebDev Pro website with API initialized! 🚀');
console.log('Ready to create amazing websites! 💻');
