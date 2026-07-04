# Деплой LoveConstructor.ru

## Быстрый старт (Railway / Render)

Самый простой способ — PaaS-платформа с автоматическим деплоем из GitHub.

### Railway
1. Залейте код на GitHub
2. Зайдите на https://railway.app → New Project → Deploy from GitHub
3. Выберите репозорий
4. В Variables добавьте:
   - `JWT_SECRET` — сгенерируйте: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `NODE_ENV=production`
   - `SITE_URL=https://loveconstructor.ru`
   - `VK_APP_ID=...`
   - `VK_APP_SECRET=...`
   - `VK_CALLBACK_URL=https://loveconstructor.ru/api/auth/vk/callback`
5. В Settings → Networking → Generate Domain — получите публичный URL
6. Настройте свой домен: Settings → Custom Domain → добавьте `loveconstructor.ru`

### Render
1. Залейте код на GitHub
2. Зайдите на https://render.com → New → Web Service
3. Connect GitHub repository
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables: аналогично Railway

---

## VPS (DigitalOcean / Vultr / Timeweb)

### Шаг 1: Подготовка сервера
```bash
# Подключаемся к серверу
ssh root@ВАШ_IP

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Устанавливаем Nginx
apt install -y nginx

# Устанавливаем Certbot для SSL
apt install -y certbot python3-certbot-nginx
```

### Шаг 2: Деплой приложения
```bash
# Создаём директорию
mkdir -p /var/www/loveconstructor
cd /var/www/loveconstructor

# Клонируем репозорий (или копируем файлы)
git clone https://github.com/ВАШ_НИКНЕЙМ/love-constructor.git .

# Устанавливаем зависимости
npm install --production

# Создаём .env файл
cp .env.example .env
nano .env  # Заполните значения для продакшена
```

### Шаг 3: Systemd сервис
```bash
nano /etc/systemd/system/loveconstructor.service
```

Содержимое:
```ini
[Unit]
Description=Love Constructor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/loveconstructor
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable loveconstructor
systemctl start loveconstructor
```

### Шаг 4: Nginx конфиг
```bash
nano /etc/nginx/sites-available/loveconstructor
```

Содержимое:
```nginx
server {
    listen 80;
    server_name loveconstructor.ru www.loveconstructor.ru;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static files
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
ln -s /etc/nginx/sites-available/loveconstructor /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Шаг 5: SSL (Let's Encrypt)
```bash
certbot --nginx -d loveconstructor.ru -d www.loveconstructor.ru
```

Автопродление:
```bash
systemctl status certbot.timer
```

---

## Настройка VK OAuth

1. Зайдите на https://dev.vk.com
2. Выберите ваше приложение (или создайте новое)
3. В настройках приложения:
   - **Платформа**: Web
   - **Адрес сайта**: `https://loveconstructor.ru`
   - **Callback URL**: `https://loveconstructor.ru/api/auth/vk/callback`
4. Скопируйте `App ID` и `Secret Key` в `.env`

---

## Рекомендация: Cloudflare (DDoS-защита)

Бесплатный тариф Cloudflare даёт:
- **DDoS-защиту** на уровне сети
- **CDN** — кэширование статических файлов по всему миру
- **SSL** — бесплатный SSL-сертификат
- **DNS** — быстрое разрешение домена

### Настройка:
1. Зарегистрируйтесь на https://cloudflare.com
2. Добавьте домен `loveconstructor.ru`
3. Измените NS-серверы у регистратора домена на Cloudflare
4. В Cloudflare → SSL/TLS → Mode: **Full (Strict)**
5. В Cloudflare → Speed → Auto Minify: включите CSS и JS
6. В Cloudflare → Caching: Browser TTL — 1 month

---

## Реклама (монетизация)

Для запуска рекламы зарегистрируйтесь в:
- **Яндекс.Реклама (РСЯ)**: https://partner.yandex.ru — лучший вариант для RU-аудитории
- **Google AdSense**: https://adsense.google.com — альтернатива

В файле `public/js/ad.js` раскомментируйте нужный блок и вставьте ваш publisher ID.

---

## Чек-лист перед запуском

- [ ] `JWT_SECRET` — сгенерирован надёжный ключ
- [ ] `NODE_ENV=production` — установлено
- [ ] `SITE_URL=https://loveconstructor.ru` — установлено
- [ ] VK OAuth — настроен redirect URI
- [ ] SSL — работает (через Certbot или Cloudflare)
- [ ] Реклама — настроен publisher ID в ad.js
- [ ] Бэкапы — настроено регулярное копирование `data/love-constructor.db`
