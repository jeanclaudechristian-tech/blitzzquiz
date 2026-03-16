<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // 必须
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomVerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $url;

    public function __construct($url) {
        $this->url = $url;
    }

    public function via($notifiable) {
        return ['mail'];
    }

    public function toMail($notifiable) {
        return (new MailMessage)
            ->subject('Vérifiez votre adresse email - BlizzQuiz')
            ->line('Cliquez sur le bouton ci-dessous pour vérifier votre compte.')
            ->action('Vérifier l\'email', $this->url)
            ->line('Si vous n\'avez pas créé de compte, ignorez ce message.');
    }
}
