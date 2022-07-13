<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegisterUser extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject("Foreningsbruker - {$this->data['username']}")
            ->from("it-gruppa@foreningenbs.no")
            ->replyTo(preg_replace("/\s/", "", $this->data['email']))
            ->text('emails.registeruser', $this->data);
    }
}
