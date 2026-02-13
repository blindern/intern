<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordReset extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $realname,
        public string $username,
        public string $token,
    ) {
    }

    public function build()
    {
        $resetUrl = config('app.url') . '/intern/reset-password?token=' . urlencode($this->token);

        return $this
            ->subject("Tilbakestill passord - foreningsbruker")
            ->from("it-gruppa@foreningenbs.no")
            ->text('emails.passwordreset', [
                'name' => $this->realname . ' (' . $this->username . ')',
                'resetUrl' => $resetUrl,
            ]);
    }
}
