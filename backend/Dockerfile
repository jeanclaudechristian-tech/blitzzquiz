FROM php:8.2-apache-alpine

# 安装 Laravel 必要的系统依赖和 PHP 扩展
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    curl-dev \
    icu-dev

RUN docker-php-ext-install pdo_mysql mbstring zip pcntl bcmath intl

# 1. 开启 Apache 的 Rewrite 模块（Laravel 路由必须）
RUN cp /etc/apache2/httpd.conf /etc/apache2/httpd.conf.bak \
    && sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /etc/apache2/httpd.conf \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/httpd.conf

# 2. 修改 Apache 的运行目录到 Laravel 的 public 文件夹
ENV APACHE_DOCUMENT_ROOT /var/www/public
RUN sed -ri -e 's!/var/www/localhost/htdocs!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/httpd.conf

# 安装 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

# 修复目录权限，确保 storage 能够写入日志和缓存
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# 暴露 80 端口（容器内部端口）
EXPOSE 80

CMD ["httpd", "-D", "FOREGROUND"]
