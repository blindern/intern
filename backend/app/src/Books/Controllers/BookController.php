<?php namespace Blindern\Intern\Books\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Blindern\Intern\Books\Models\Book;
use Blindern\Intern\Books\ISBN;
use Blindern\Intern\Responses;

class BookController extends Controller
{
    public function isbn()
    {
        $isbn = \Request::input("isbn");

        if (!empty($isbn)) {
            $result = ISBN::searchByISBN($isbn);
        }

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
    public function index(Request $request)
    {
        $query = Book::orderBy('created_at', 'desc');

        if ($request->input('q')) {
            $s = preg_split("/\s+/", $request->input('q'));
            foreach ($s as $part) {
                $query = $query->where(function ($query) use ($part) {
                    $check = '%' . $part  .'%';
                    $query->where('title', 'like', $check)
                          ->orWhere('subtitle', 'like', $check)
                          ->orWhere('authors', 'like', $check)
                          ->orWhere('pubdate', 'like', $check)
                          ->orWHere('isbn', 'like', $check)
                          ->orWhere('bib_barcode', 'like', $check);
                });
            }
        }

        return $query->paginate($limit = 100);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store()
    {
        if (!\Auth::member("biblioteksutvalget")) {
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $book = new Book();
        if (($val = $this->validateInputAndUpdate($book)) !== true) {
            return $val;
        }

        // check for ISBN-data
        if ($isbn_data = ISBN::searchByISBN($book->isbn)) {
            // Convert stdClass to associative arrays.
            $isbn_data = json_decode(json_encode($isbn_data), true);
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
            return response('', 404);
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
        $book = Book::find($id);
        if (!$book) {
            return response('', 404);
        }

        if (($val = $this->validateInputAndUpdate($book)) !== true) {
            return $val;
        }

        $book->save();
        return $book;
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
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $book = Book::find($id);
        if (!$book) {
            return response('', 404);
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
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $book = Book::find($id);
        if (!$book) {
            return response('', 404);
        }

        // a barcode cannot be changed
        if ($book->bib_barcode) {
            return Responses::clientError(['Boka har allerede en strekkode tilegnet.']);
        }

        $barcode = \Request::input('barcode');
        if (empty($barcode)) {
            return Responses::clientError(['Mangler strekkode.']);
        }

        $res = $book->setBarcode($barcode);
        if ($res === true) {
            return array('barcode' => $barcode);
        } elseif ($res == 'unique') {
            return Responses::clientError(['Løpenummeret er allerede i bruk.']);
        } elseif ($res == 'format') {
            return Responses::clientError(['Formatet på strekkoden er galt.']);
        } else {
            return Responses::serverError(['Ukjent feil.']);
        }
    }

    /**
     * Run validator for add/edit
     */
    private function validateInputAndUpdate(Book $book)
    {
        $validator = \Validator::make(\Request::all(), array(
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
            return Responses::clientError($validator->messages()->all(':message'));
        }

        $book->title = \Request::input('title');
        $book->subtitle = \Request::input('subtitle');
        $book->authors = \Request::input('authors');
        $book->pubdate = \Request::input('pubdate');
        $book->description = \Request::input('description');
        $book->isbn = \Request::input('isbn');
        $book->bib_comment = \Request::input('bib_comment');
        $book->bib_room = \Request::input('bib_room');
        $book->bib_section = \Request::input('bib_section');

        return true;
    }
}
