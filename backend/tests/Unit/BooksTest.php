<?php

namespace Tests\Unit;

use Blindern\Intern\Books\ISBN;
use Tests\TestCase;

class BooksTest extends TestCase
{
    public function testISBNSearch()
    {
        /* Disabled as it requires an API key.
        $isbn = '9780988262591';
        $result = ISBN::searchByISBN($isbn);

        $this->assertInternalType('array', $result);
        $this->assertNotEmpty($result['title']);
        $this->assertNotEmpty($result['subtitle']);
        $this->assertInternalType('array', $result['authors']);
        $this->assertNotEmpty($result['pageCount']);
        $this->assertNotEmpty($result['publishedDate']);
        */
    }
}
