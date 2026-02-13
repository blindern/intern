<?php namespace App\Support;

use Illuminate\Database\Query\Grammars\PostgresGrammar as BaseGrammar;

class PostgresGrammar extends BaseGrammar
{
    public function getDateFormat()
    {
        return 'Y-m-d H:i:s.vP';
    }
}
