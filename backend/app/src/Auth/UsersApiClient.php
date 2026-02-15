<?php namespace Blindern\Intern\Auth;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UsersApiClient
{
    private function baseUrl(): string
    {
        return rtrim(config('auth.blindern-auth.api'), '/');
    }

    private function generateHmacV2(string $time, string $method, string $uri, string $body): string
    {
        $data = "{$method}\n{$uri}\n{$time}\n{$body}";
        $key = \Config::get('auth.blindern-auth.api-key');
        return hash_hmac('sha256', $data, $key);
    }

    private function jsonRequest(string $method, string $path, ?array $body = null)
    {
        $url = $this->baseUrl() . '/' . $path;
        $time = (string) time();

        $parsedUrl = parse_url($url);
        $uriPath = ($parsedUrl['path'] ?? '/') . (isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '');

        $jsonBody = '';
        if ($body !== null) {
            $jsonBody = json_encode($body, JSON_THROW_ON_ERROR);
        }
        $hash = $this->generateHmacV2($time, $method, $uriPath, $jsonBody);

        $request = Http::timeout(5)->retry(2, 200)->withHeaders([
            'X-API-Time' => $time,
            'X-API-Hash' => $hash,
            'X-API-Hash-Version' => '2',
        ]);

        if ($body !== null) {
            $request = $request->withBody($jsonBody, 'application/json');
        }

        $response = $request->send($method, $url);

        if (!$response->successful()) {
            Log::error('users-api call failed', [
                'endpoint' => "$method $path",
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response;
    }

    public function getUsers(): ?array
    {
        $response = $this->jsonRequest('GET', 'v2/users');
        if (!$response->successful()) {
            return null;
        }
        return $response->json();
    }

    public function createUser(
        string $username,
        string $firstName,
        string $lastName,
        string $email,
        ?string $phone,
        string $passwordHash,
    ) {
        $body = [
            'username' => $username,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'passwordHash' => $passwordHash,
        ];

        return $this->jsonRequest('POST', 'v2/users', $body);
    }

    public function modifyUser(string $username, array $data)
    {
        return $this->jsonRequest('POST', "v2/users/" . rawurlencode($username) . "/modify", $data);
    }

    public function verifyCredentials(string $username, string $password): bool
    {
        $response = $this->jsonRequest('POST', 'v2/simpleauth', [
            'username' => $username,
            'password' => $password,
        ]);

        return $response->successful();
    }

    public function addMemberToGroup(string $groupname, string $memberType, string $memberId)
    {
        return $this->jsonRequest('PUT', "v2/groups/" . rawurlencode($groupname) . "/members/" . rawurlencode($memberType) . "/" . rawurlencode($memberId));
    }

    public function removeMemberFromGroup(string $groupname, string $memberType, string $memberId)
    {
        return $this->jsonRequest('DELETE', "v2/groups/" . rawurlencode($groupname) . "/members/" . rawurlencode($memberType) . "/" . rawurlencode($memberId));
    }

    public function addOwnerToGroup(string $groupname, string $ownerType, string $ownerId)
    {
        return $this->jsonRequest('PUT', "v2/groups/" . rawurlencode($groupname) . "/owners/" . rawurlencode($ownerType) . "/" . rawurlencode($ownerId));
    }

    public function removeOwnerFromGroup(string $groupname, string $ownerType, string $ownerId)
    {
        return $this->jsonRequest('DELETE', "v2/groups/" . rawurlencode($groupname) . "/owners/" . rawurlencode($ownerType) . "/" . rawurlencode($ownerId));
    }
}
