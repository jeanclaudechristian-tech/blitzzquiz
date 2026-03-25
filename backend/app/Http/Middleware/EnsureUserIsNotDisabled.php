<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotDisabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && (bool) $user->is_disabled) {

            if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            return response()->json([
                'message' => 'Your account has been disabled.',
            ], 403);
        }

        return $next($request);
    }
}
