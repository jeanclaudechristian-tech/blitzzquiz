<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $password;
    public $isNewUser;

    public function __construct($password, $isNewUser)
    {
        $this->password = $password;
        $this->isNewUser = $isNewUser;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $message = (new MailMessage)
            ->subject('Invitation Administration - BlizzQuiz')
            ->line('Vous avez été invité à devenir administrateur sur BlizzQuiz.');

        if ($this->isNewUser) {
            $message->line('Un compte a été créé pour vous avec les identifiants suivants :')
                    ->line('Email : ' . $notifiable->email)
                    ->line('Mot de passe temporaire : ' . $this->password)
                    ->action('Se connecter', env('FRONTEND_URL') . '/connexion')
                    ->line('Nous vous conseillons de changer votre mot de passe dès votre première connexion.');
        } else {
            $message->line('Votre compte existant a été promu au rang d\'administrateur.')
                    ->line('Si vous avez oublié votre mot de passe, vous pouvez utiliser la fonction de récupération.')
                    ->action('Accéder au panel', env('FRONTEND_URL') . '/admin');
        }

        return $message;
    }
}
