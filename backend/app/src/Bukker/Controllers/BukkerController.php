<?php namespace Blindern\Intern\Bukker\Controllers;

use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Blindern\Intern\Bukker\Models\Bukk;
use Blindern\Intern\Responses;

class BukkerController extends Controller
{
    public function index(Request $request)
    {
        return Bukk::all();
    }

    public function store(Request $request)
    {
        if (!\Auth::member("bukkekollegiet")) {
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $bukk = new Bukk();
        $this->validateInputAndUpdate($bukk, $request);
        $bukk->save();

        return $bukk;
    }

    public function show($id)
    {
        return Bukk::findOrFail($id);
    }

    public function update($id, Request $request)
    {
        if (!\Auth::member("bukkekollegiet")) {
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $bukk = Bukk::findOrFail($id);
        $this->validateInputAndUpdate($bukk, $request);
        $bukk->save();

        return $bukk;
    }

    public function destroy($id)
    {
        if (!\Auth::member("bukkekollegiet")) {
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $bukk = Bukk::findOrFail($id);
        $bukk->delete();
        return array(
            'deleted' => true
        );
    }

    /**
     * Validator for add/edit
     */
    private function validateInputAndUpdate(Bukk $bukk, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'awards' => 'array',
        ]);

        $validator->sometimes('died', array('regex:/^(\d{4})$/'), function ($input) {
            return !is_bool($input->died);
        });

        if ($validator->fails()) {
            $this->throwValidationException($request, $validator);
        }

        if ($request->has('awards')) {
            $newAwards = [];
            foreach ($request->input('awards') as $item) {
                $validator = Validator::make($item, [
                    'year' => array('required', 'regex:/^(\d{4})$/'),
                    'rank' => 'required|in:Halv,Hel,Høy',
                    'image_file' => '',
                    'devise' => '',
                    'comment' => '',
                ]);

                if ($validator->fails()) {
                    $this->throwValidationException($request, $validator);
                }

                $award = [
                    'year' => $item['year'],
                    'rank' => $item['rank'],
                ];
                if (isset($item['image_file'])) {
                    $award['image_file'] = $item['image_file'];
                }
                if (isset($item['devise'])) {
                    $award['devise'] = $item['devise'];
                }
                if (isset($item['comment'])) {
                    $award['comment'] = $item['comment'];
                }

                $newAwards[] = $award;
            }

            $bukk->setRawAwards($newAwards);
        }

        $bukk->name = $request->input('name');
        if ($request->has('died')) {
            if ($request->input('died') === false) {
                $bukk->died = null;
            } else {
                $bukk->died = $request->input('died');
            }
        }

        return true;
    }
}
