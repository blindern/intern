<?php namespace API;

use Illuminate\Support\Facades\Input;
use Blindern\Intern\Helpers\Flash;
use Blindern\Intern\Helpers\FlashCollection;
use Blindern\Intern\Books\Models\Book;
use Blindern\Intern\Books\ISBN;

class BookController extends \Controller {
    public function isbn() {
        $isbn = Input::get("isbn");

        if (!empty($isbn)) $result = ISBN::searchByISBN($isbn);

        if (empty($isbn) || !$result) {
            return array(
                'isbn' => $isbn,
                'found' => false,
                'data' => array()
            );
        }

        return array(
            'isbn' => $isbn,
            'found' => true,
            'data' => array(
                'title' => $result['title'],
                'subtitle' => @$result['subtitle'] ?: null,
                'authors' => @$result['authors'] ?: null,
                'categories' => @$result['categories'] ?: null,
                'description' => @$result['description'] ?: null,
                'pubdate' => @$result['publishedDate'] ?: null
            )
        );
    }

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        return Book::orderBy('created_at', 'desc')->paginate($limit = 100);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store()
    {
        if (!\Auth::member("biblioteksutvalget")) {
            return Flash::forge('Du har ikke tilgang til denne funksjonen.')->setError()->asResponse(null, 403);
        }

        $validator = \Validator::make(Input::all(), array(
            'title' => 'required',
            'subtitle' => '',
            'authors' => 'array',
            'pubdate' => array('regex:/^(\d{4}-\d\d(-\d\d)?|\d{4}\??|\d{2}\?)$/'),
            'description' => '',
            'isbn' => '',
            'bib_comment' => '',
            'bib_room' => '',
            'bib_section' => ''
        ));

        if ($validator->fails()) {
            $c = FlashCollection::forge();
            foreach ($validator->messages()->all(':message') as $message)
            {
                $c->add(Flash::forge($message)->setError());
            }
            return $c->asResponse(null, 400);
        }

        $book = new Book();
        $book->title = Input::get('title');
        $book->subtitle = Input::get('subtitle');
        $book->authors = Input::get('authors');
        $book->pubdate = Input::get('pubdate');
        $book->description = Input::get('description');
        $book->isbn = Input::get('isbn');
        $book->bib_comment = Input::get('bib_comment');
        $book->bib_room = Input::get('bib_room');
        $book->bib_section = Input::get('bib_section');

        // check for ISBN-data
        if ($isbn_data = ISBN::searchByISBN($book->isbn)) {
            $book->isbn_data = $isbn_data;

            if (isset($isbn_data['imageLinks']['smallThumbnail'])) {
                $book->thumbnail = $isbn_data['imageLinks']['smallThumbnail'];
            }
        }

        $book->save();

        return $book;
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $book = Book::find($id);
        if (!$book) {
            return Flash::forge('Fant ikke boka som ble søkt etter.')->setError()->asResponse(null, 404);
        }
        return $book;
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function update($id)
    {
        // TODO
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        if (!\Auth::member("biblioteksutvalget")) {
            return Flash::forge('Du har ikke tilgang til denne funksjonen.')->setError()->asResponse(null, 403);
        }

        $book = Book::find($id);
        if (!$book) {
            return Flash::forge('Fant ikke boka som ble søkt etter.')->setError()->asResponse(null, 404);
        }

        $book->delete();
        return array(
            'deleted' => true
        );
    }

    /**
     * Assign a barcode to the book
     */
    public function barcode($id)
    {
        if (!\Auth::member("biblioteksutvalget")) {
            return Flash::forge('Du har ikke tilgang til denne funksjonen.')->setError()->asResponse(null, 403);
        }

        $book = Book::find($id);
        if (!$book) {
            return Flash::forge('Fant ikke boka som ble søkt etter.')->setError()->asResponse(null, 404);
        }

        // a barcode cannot be changed
        if ($book->bib_barcode) {
            return Flash::forge('Boka har allerede en strekkode tilegnet.')->setError()->asResponse(null, 400);
        }

        $barcode = Input::get('barcode');
        if (empty($barcode)) {
            return Flash::forge('Mangler strekkode.')->setError()->asResponse(null, 400);
        }

        $res = $book->setBarcode($barcode);
        if ($res === true) {
            return array('barcode' => $barcode);
        } elseif ($res == 'unique') {
            return Flash::forge('Løpenummeret er allerede i bruk.')->setError()->asResponse(null, 404);
        } elseif ($res == 'format') {
            return Flash::forge('Formatet på strekkoden er galt.')->setError()->asResponse(null, 404);
        } else {
            return Flash::forge('Ukjent feil.')->setError()->asResponse(null, 404);
        }
    }
}