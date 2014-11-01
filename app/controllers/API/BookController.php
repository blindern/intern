<?php namespace API;

use Illuminate\Support\Facades\Input;
use Blindern\Intern\Books\Models\Book;
use Blindern\Intern\Helpers\Flash;

class BookController extends \Controller {
    public function isbn() {
        $isbnCode = Input::get("isbn");
        return array(
            'isbn' => $isbnCode,
            'found' => false,
            'data' => array(
                'title' => 'Ukjent bok'
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
        return Book::paginate($limit = 10);
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {

    }


    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store()
    {
        // TODO: access check, data validation

        $book = new Book();
        $book->title = Input::get('title');
        $book->isbn = Input::get('isbn');
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
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function edit($id)
    {
        //
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function update($id)
    {
        //
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        //
    }


}