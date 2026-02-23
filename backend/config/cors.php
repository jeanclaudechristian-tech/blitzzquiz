<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'https://blitzzquiz.vercel.app',
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/blitzzquiz-[a-z0-9]+-testtrade404-7981s-projects\.vercel\.app$/',
        '/^https:\/\/blitzzquiz.*\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
