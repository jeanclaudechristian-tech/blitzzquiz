<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminResetPasswordNotification extends Notification
{
    use Queueable;

    public $newPassword;

    public function __construct($newPassword)
    {
        $this->newPassword = $newPassword;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nouveau mot de passe - BlizzQuiz')
            ->line('Un administrateur a réinitialisé votre mot de passe.')
            ->line('Votre nouveau mot de passe temporaire est : ' . $this->newPassword)
            ->action('Se connecter', env('FRONTEND_URL') . '/connexion')
            ->line('Pour votre sécurité, changez ce mot de passe après votre connexion.');
    }
}
