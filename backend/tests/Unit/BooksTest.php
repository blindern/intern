<?php

namespace Tests\Unit;

use Blindern\Intern\Books\ISBN;
use Tests\TestCase;

class BooksTest extends TestCase
{
    public function testISBNSearch()
    {
        if (!ISBN::hasKey())
        {
            $this->markTestSkipped("Skipping test since no API key present");
            return;
        }

        $isbn = '9780988262591';
        $result = ISBN::searchByISBN($isbn);

        var_dump($result);

        $this->assertIsArray($result);
        $this->assertNotEmpty($result['title']);
        $this->assertNotEmpty($result['subtitle']);
        $this->assertIsArray($result['authors']);
        $this->assertIsInt($result['pageCount']);
        $this->assertNotEmpty($result['publishedDate']);
    }
}
