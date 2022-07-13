<?php namespace Blindern\Intern;

class Responses {
    public static function clientError(array $texts) {
        $messages = [];
        foreach ($texts as $message) {
            $messages[] = [
                'type' => 'danger',
                'message' => $message,
            ];
        }
        return \Response::json(['messages' => $messages], 400);
    }

    public static function invalidAuth(array $texts) {
        $messages = [];
        foreach ($texts as $message) {
            $messages[] = [
                'type' => 'danger',
                'message' => $message,
            ];
        }
        return \Response::json(['messages' => $messages], 401);
    }

    public static function forbidden(array $texts) {
        $messages = [];
        foreach ($texts as $message) {
            $messages[] = [
                'type' => 'danger',
                'message' => $message,
            ];
        }
        return \Response::json(['messages' => $messages], 403);
    }

    public static function serverError(array $texts) {
        $messages = [];
        foreach ($texts as $message) {
            $messages[] = [
                'type' => 'danger',
                'message' => $message,
            ];
        }
        return \Response::json(['messages' => $messages], 500);
    }

    public static function success(array $texts) {
        $messages = [];
        foreach ($texts as $message) {
            $messages[] = [
                'type' => 'success',
                'message' => $message,
            ];
        }
        return \Response::json(['messages' => $messages], 200);
    }
}
