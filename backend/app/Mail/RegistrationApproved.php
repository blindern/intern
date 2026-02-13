<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $username)
    {
    }

    public function build()
    {
        return $this
            ->subject("Foreningsbruker godkjent - {$this->username}")
            ->from("it-gruppa@foreningenbs.no")
            ->text('emails.registrationapproved', ['username' => $this->username]);
    }
}
