<?php namespace Blindern\Intern\Books;

class ISBN
{
    public static function hasKey()
    {
        return isset($_ENV['INTERN_GOOGLE_API_KEY']);
    }

    /**
     * Find information of book by searching the ISBN-number.
     * Information will be cached for later lookup.
     *
     * Currently uses the Google Books API.
     *
     * @param string ISBN-number
     * @return array
     */
    public static function searchByISBN($isbn)
    {
        if (empty($isbn)) {
            return null;
        }

        // check if it is in cache
        $cache = static::getFromCache($isbn);
        if ($cache !== null) {
            return ($cache === false ? null : $cache);
        }

        // use the Google API to fetch data
        if (!isset($_ENV['INTERN_GOOGLE_API_KEY'])) {
            throw new \Exception("Google API-key not found in ENV-variable INTERN_GOOGLE_API_KEY");
        }

        $client = new \Google_Client();
        $client->setApplicationName("FBS Intern");
        $client->setDeveloperKey($_ENV['INTERN_GOOGLE_API_KEY']);

        $service = new \Google_Service_Books($client);
        $results = $service->volumes->listVolumes('isbn:' . $isbn);

        if ($results->totalItems > 0) {
            $r = (array)$results[0]['volumeInfo']->toSimpleObject();

            // store to cache so it can be used later
            \Cache::put('isbn_cache_' . $isbn, $r, 15);

            return $r;
        }

        // cache the miss
        \Cache::put('isbn_cache_' . $isbn, false, 15);
        return null;
    }

    /**
     * Get cached ISBN-data if available
     *
     * @param string ISBN-number
     * @return array
     */
    public static function getFromCache($isbn)
    {
        return \Cache::get('isbn_cache_' . $isbn);
    }
}
