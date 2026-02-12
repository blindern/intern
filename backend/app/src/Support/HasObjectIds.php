<?php namespace Blindern\Intern\Support;

/**
 * Generate 24-char hex IDs matching MongoDB ObjectId format.
 */
trait HasObjectIds
{
    public function getKeyType(): string
    {
        return 'string';
    }

    public function getIncrementing(): bool
    {
        return false;
    }

    public function uniqueIds(): array
    {
        return [$this->getKeyName()];
    }

    public function newUniqueId(): string
    {
        return bin2hex(random_bytes(12));
    }
}
