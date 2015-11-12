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

    <title ng-bind="title">@yield('title', 'Foreningen Blindern Studenterhjem')</title>

    <link href="{{ asset('assets/stylesheets/frontend.css') }}" rel="stylesheet" />
    <script src="{{ asset('assets/javascript/frontend.js') }}"></script>

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
    <div id="wrap">

      <!-- Fixed navbar -->
      <div class="navbar navbar-default navbar-fixed-top" ng-controller="HeaderController">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/intern/" title="Foreningen Blindern Studenterhjem">FBS</a>
          </div>
          <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
              <li ng-class="{ active: isActive('/arrplan', '/arrplan/') }"><a href="arrplan">Arrangementplan</a></li>
              <li ng-class="{ active: isActive('/books', '/books/') }"><a href="books">Biblioteket</a></li>
              <li class="dropdown">
                <a href class="dropdown-toggle" data-toggle="dropdown">Brukere og grupper <b class="caret"></b></a>
                <ul class="dropdown-menu">
                  <li ng-class="{ active: isActive('/users') }"><a href="users">Brukerliste</a></li>
                  <li ng-class="{ active: isActive('/groups') }"><a href="groups">Gruppeliste</a></li>
                </ul>
              </li>
              <li class="dropdown">
                <a href class="dropdown-toggle" data-toggle="dropdown">Dugnaden <b class="caret"></b></a>
                <ul class="dropdown-menu">
                  <li ng-class="{ active: isActive('/dugnaden/old/list') }"><a href="dugnaden/old/list">Dugnadsinnkalling</a></li>
                </ul>
              </li>
              <li class="dropdown">
              	<a href class="dropdown-toggle" data-toggle="dropdown">Printer <b class="caret"></b></a>
              	<ul class="dropdown-menu">
              	  <li ng-class="{ active: isActive('/printer/siste') }"><a href="printer/siste">Siste utskrifter</a></li>
                  <li ng-class="{ active: isActive('/printer/fakturere') }"><a href="printer/fakturere">Fakturering</a></li>
	              </ul>
  	          </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
            	<li ng-show="AuthService.isLoggedIn()" class="dropdown">
            		<a href class="dropdown-toggle" data-toggle="dropdown">@{{ AuthService.getUser().realname || AuthService.getUser().username }} <b class="caret"></b></a>
            		<ul class="dropdown-menu">
            			<li ng-class="{ active: isActive('/user/'+AuthService.getUser().username) }"><a ng-href="user/@{{ AuthService.getUser().username }}">Brukerinfo</a></li>
            			<li><a href="logout">Logg ut</a></li>
            		</ul>
            	</li>
              <li ng-show="!AuthService.isLoggedIn()" ng-class="{ active: isActive('/login') }"><a href="login">Logg inn</a></li>
              <li ng-show="!AuthService.isLoggedIn()" ng-class="{ active: isActive('/register') }"><a href="register">Registrer</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>

      <!-- Begin page content -->

      <div class="container">

        <div ng-repeat="flash in flashes" class="message-box-wrap">
          <div class="message-box" ng-class="flash.type ? 'bg-'+flash.type : ''">
            <b>@{{ flash.date|customdate:'HH:mm:ss' }}:</b> <span ng-bind="flash.message"></span>
          </div>
        </div>

      	<div class="page-header">
          <h1 id="page_title" ng-bind="title">@yield('title', 'Foreningen Blindern Studenterhjem')</h1>
        </div>

        <div id="content">
          @yield('content')
          <div ng-view></div>
        </div>
      </div>
    </div>

    <div id="footer" class="hidden-print">
      <div class="container">
        <p class="text-muted credit"><a href="/">Foreningen Blindern Studenterhjem</a> - Kontakt <a href="mailto:it-gruppa@foreningenbs.no">it-gruppa@foreningenbs.no</a> ved henvendelser vedr. denne siden - <a href="https://github.com/blindern/intern">GitHub-prosjekt</a></p>
      </div>
    </div>
  </body>
</html>
