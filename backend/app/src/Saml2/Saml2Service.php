<?php

namespace Blindern\Intern\Saml2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use OneLogin\Saml2\Auth as OneLoginAuth;
use OneLogin\Saml2\Utils as OneLoginUtils;

class Saml2Service
{
    /**
     * @var OneLoginAuth
     */
    public $saml;

    function __construct()
    {
        OneLoginUtils::setProxyVars(true);

        $this->saml = new OneLoginAuth([
            'strict' => true,
            'sp' => [
                'entityId' => URL::route('saml2.metadata'),
                'NameIDFormat' => 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
                'assertionConsumerService' => [
                    'url' => URL::route('saml2.acs'),
                ],
                'singleLogoutService' => [
                    'url' => URL::route('saml2.sls'),
                ],
                'x509cert' => '',
                'privateKey' => '',

            ],
            'idp' => [
                'entityId' => 'https://foreningenbs.no/simplesaml/saml2/idp/metadata.php',
                'singleSignOnService' => [
                    'url' => 'https://foreningenbs.no/simplesaml/saml2/idp/SSOService.php',
                ],
                'singleLogoutService' => [
                    'url' => 'https://foreningenbs.no/simplesaml/saml2/idp/SingleLogoutService.php',
                ],
                'x509cert' => 'MIIEOzCCAyOgAwIBAgIJAJB1ClZFzgNIMA0GCSqGSIb3DQEBCwUAMIGzMQswCQYDVQQGEwJOTzENMAsGA1UECAwET3NsbzENMAsGA1UEBwwET3NsbzEqMCgGA1UECgwhRm9yZW5pbmdlbiBCbGluZGVybiBTdHVkZW50ZXJoamVtMRIwEAYDVQQLDAlJVC1ncnVwcGExHDAaBgNVBAMME2lkcC5mb3JlbmluZ2VuYnMubm8xKDAmBgkqhkiG9w0BCQEWGWl0LWdydXBwYUBmb3JlbmluZ2VuYnMubm8wHhcNMTQxMTEyMDAyODE2WhcNMjQxMTExMDAyODE2WjCBszELMAkGA1UEBhMCTk8xDTALBgNVBAgMBE9zbG8xDTALBgNVBAcMBE9zbG8xKjAoBgNVBAoMIUZvcmVuaW5nZW4gQmxpbmRlcm4gU3R1ZGVudGVyaGplbTESMBAGA1UECwwJSVQtZ3J1cHBhMRwwGgYDVQQDDBNpZHAuZm9yZW5pbmdlbmJzLm5vMSgwJgYJKoZIhvcNAQkBFhlpdC1ncnVwcGFAZm9yZW5pbmdlbmJzLm5vMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr1ufEAkElJH9EpVX/xGZsUV7R17PpGWCHvnF6+nHTAKQxSM57h9UmjxdMx1jShbU0AWm6IVt4KPRyBXGEFfqVuXYvuU5pjGDpK1I9fAn/Fpkw0fe+RQQYq2QT0iKPDUkmjcq99WirJKMzUwfO7KuUV4lvctBnMx7s/1K6olq8HzY6km70kji46vmU45YiMgyo1TL3keVb+zVKgbjEX6P7Hm0Q7eXXY+3NHIqaKQ8N6d5xOT7mVuRqhvKAlwqUO296KhYBSgntElmH3/f/QayEaFoDbpMuWBbSmnLCNcQch+qYM/wFKFxt6i5AZRVmzTZAB8WkiKepvGiFCWujXRhNQIDAQABo1AwTjAdBgNVHQ4EFgQULdQSA/j4QuWMrB0SGhkyDW6Dai4wHwYDVR0jBBgwFoAULdQSA/j4QuWMrB0SGhkyDW6Dai4wDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAfBjmva4UE7/0u4+g4JiTTSsX5ZaveccHxTV7JqneFBbj7OmPQsaOpgFpaiwjyM1XIbOGKK3/A0sTAmKGwQC8o+VwQTAHiZhtv3CqWLY0MVZ03OYuuhX/q5AQij3FXUTriUfMaoqqsKX8hh8BTK4wcntCi4qYHihtvXsfrCnrJwl+Y811LziUKDFJymv3ZXYsTsiFqB7KI6+3YCe8mKy9KwYSHz5qDktwGERAShEvRDHVZ1kSARChrdSgf0LcuIO9nFd3O3x2VzMHC2vZj91KsX8tWHErodHxtZcHMpzOJSIvBY5cZx/qtCifl3yVYGxhUg4kl67afV5M2DRuvA7XXQ==',
            ],
            'security' => [
                'requestedAuthnContext' => false,
            ],
            'contactPerson' => [
                'technical' => [
                    'givenName' => 'IT-gruppa',
                    'emailAddress' => 'it-gruppa@foreningenbs.no'
                ],
                'support' => [
                    'givenName' => 'IT-gruppa',
                    'emailAddress' => 'it-gruppa@foreningenbs.no'
                ],
            ],
            'organization' => [
                'en-US' => [
                    'name' => 'Foreningen Blindern Studenterhjem',
                    'displayname' => 'FBS',
                    'url' => 'https://foreningenbs.no'
                ],
            ],
        ]);
    }

    public function acs()
    {
        $this->saml->processResponse();

        $errors = $this->saml->getErrors();

        if (!empty($errors)) {
            return $errors;
        }

        if (!$this->saml->isAuthenticated()) {
            return ['error' => 'Could not authenticate'];
        }

        return null;
    }

    public function relayState(Request $request)
    {
        $relayState = app('request')->input('RelayState');

        if ($relayState && URL::full() != $relayState) {
            return $relayState;
        }

        return null;
    }
}
