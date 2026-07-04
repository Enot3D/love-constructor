# Love Constructor — Статус проекта

## Последнее обновление: 4 июля 2025 (сайт работает!)

## Что сделано

### Бэкенд (Node.js + Express)
- Авторизация: email + пароль, VK OAuth
- CRUD приглашений (создание, просмотр, удаление)
- CRUD ответов (просмотр, удаление, редактирование)
- CSRF-защита
- Rate limiting (global, auth, publish, respond)
- Helmet security headers
- Валидация входных данных
- Health check: GET /health
- Error handlers (404, 500)

### Фронтенд
- Конструктор приглашений (index.html)
- Личный кабинет (dashboard.html) — список приглашений, статистика, удаление/редактирование ответов
- Страница входа/регистрации (login.html) — email + VK
- Просмотр приглашения (view.html)
- Трекер ответов (track.html)
- Рекламные слоты (девелопмент-плейсхолдеры, в продакшене — РСЯ/AdSense)

### Деплой
- GitHub: `Enot3D/love-constructor`
- Хостинг: Railway (Node.js + PostgreSQL)
- Домен: `loveconstructor.ru` (kуплен в reg.ru)
- Cloudflare: DNS Only (серое облако) — прокси ломает JS, используется только DNS
- **Сайт работает: https://loveconstructor.ru**

## Следующие шаги

1. ~~Сайт работает~~ ✅
2. ~~Firebase удалён~~ ✅ 
3. ~~PostgreSQL подключена~~ ✅
4. ~~Шрифты локальные~~ ✅
5. ~~VK OAuth~~ — временно недоступен (VK изменил интерфейс)
6. ~~Протестировать~~ ✅
7. ~~Реклама~~ — Яндекс.Реклама (R-A-19545012-1), отклонена модерацией, повторить через 2-4 недели
8. ~~Админ-панель~~ ✅ — /admin, доступ: egor.novoselisev@gmail.com

## Переменные окружения (Railway)

| Переменная | Значение |
|-----------|----------|
| NODE_ENV | production |
| SITE_URL | https://loveconstructor.ru |
| JWT_SECRET | 90ca9d66... (см. Railway) |
| VK_APP_ID | (нужно заполнить) |
| VK_APP_SECRET | (нужно заполнить) |
| VK_CALLBACK_URL | https://loveconstructor.ru/api/auth/vk/callback |
| PORT | 3000 |

## Ссылки

- **Сайт: https://loveconstructor.ru**
- GitHub: https://github.com/Enot3D/love-constructor
- Railway: https://railway.app
- Cloudflare: https://dash.cloudflare.com
- VK Dev: https://dev.vk.com
