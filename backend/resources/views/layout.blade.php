<?php

$user = Auth::check() ? Auth::user() : null;
$userdetails = null;

if ($user) {
    $userdetails = $user->toArray(array(), 2);
}

$is_office = \Blindern\Intern\Auth\Helper::isOffice();

?>
<!DOCTYPE html>
<html lang="en" ng-app="intern">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <base href="/intern/">
    <!--<link rel="shortcut icon" href="../../assets/ico/favicon.png">-->

    <title>@yield('title', 'Foreningen Blindern Studenterhjem')</title>

    <script type="text/javascript">
    var logged_in = <?php echo json_encode((bool) $user); ?>;
    var user = <?php echo json_encode($userdetails); ?>;
    var useradmin = <?php echo json_encode(Auth::member("useradmin")); ?>;
    var is_office = <?php echo json_encode((bool) $is_office); ?>;
    </script>

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
  </head>

  <body>
    <div>
      <h1>@yield('title', 'Foreningen Blindern Studenterhjem')</h1>

      <div>
        @yield('content')
      </div>
    </div>
  </body>
</html>
