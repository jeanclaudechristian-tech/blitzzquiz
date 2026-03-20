<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('Checking Super Admin', ['email' => $request->user()->email, 'role' => $request->user()->role]);

        // 调用你在 User.php 中定义的逻辑
        if ($request->user() && $request->user()->isSuperAdmin()) {
            return $next($request);
        }

        abort(403, 'Accès Super Admin requis');
    }
}
