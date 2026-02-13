<?php namespace Blindern\Intern\Support;

use Illuminate\Database\Eloquent\Concerns\HasUniqueIds;

/**
 * Generate 24-char hex IDs matching MongoDB ObjectId format.
 */
trait HasObjectIds
{
    use HasUniqueIds;

    public function usesUniqueIds(): bool
    {
        return true;
    }

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
        // MongoDB ObjectId format: 4-byte timestamp + 5-byte random + 3-byte counter
        $timestamp = pack('N', time());
        $random = random_bytes(5);
        $counter = substr(pack('N', mt_rand(0, 0xFFFFFF)), 1, 3);
        return bin2hex($timestamp . $random . $counter);
    }
}
