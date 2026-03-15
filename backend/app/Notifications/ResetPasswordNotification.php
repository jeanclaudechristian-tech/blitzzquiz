<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue // 关键：必须实现此接口
{
    use Queueable;

    public $url;

    public function __construct($url)
    {
        $this->url = $url;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // 这里你可以根据你的 App 语言进行调整
        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe - BlizzQuiz')
            ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe.')
            ->action('Réinitialiser le mot de passe', $this->url)
            ->line('Ce lien expirera dans 60 minutes.')
            ->line('Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.');
    }
}
