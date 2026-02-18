<?php

namespace App\Providers;

use App\Models\Quiz;
use App\Policies\QuizPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     */
    protected $policies = [
        Quiz::class => QuizPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        return $frontendUrl.'/reset-password?token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
    });
    }
}
