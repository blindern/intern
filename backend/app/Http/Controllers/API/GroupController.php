<?php namespace App\Http\Controllers\API;

use \Blindern\Intern\Auth\Group;
use \Blindern\Intern\Auth\UsersApiClient;
use \Blindern\Intern\Responses;
use \App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{
    public function index()
    {
        $groups = array();
        foreach (Group::all() as $group) {
            $groups[] = $group->toArray();
        }

        return $groups;
    }

    public function show($group)
    {
        $group = Group::find($group);
        if (is_null($group)) {
            \App::abort(404);
        }

        $c = new UserController();

        $group->getMembers();
        return $group->toArray(array(), 2, $c->exceptFields());
    }

    private function canManageGroup(string $groupName): bool
    {
        return \Auth::member("useradmin") || (\Auth::user() && \Auth::user()->isGroupOwner($groupName));
    }

    public function addMember(Request $request, string $groupName)
    {
        if (!$this->canManageGroup($groupName)) {
            return Responses::forbidden(['Ingen tilgang til å administrere denne gruppen.']);
        }

        $memberType = $request->input('memberType');
        $memberId = $request->input('memberId');

        if (!in_array($memberType, ['users', 'groups'], true) || !$memberId) {
            return Responses::clientError(['Ugyldig medlemstype eller ID.']);
        }

        $client = new UsersApiClient();
        $response = $client->addMemberToGroup($groupName, $memberType, $memberId);

        if (!$response->successful()) {
            return Responses::serverError(['Kunne ikke legge til medlem.']);
        }

        Log::info('Group member added', [
            'admin' => \Auth::user()->username,
            'group' => $groupName,
            'memberType' => $memberType,
            'memberId' => $memberId,
        ]);

        return Responses::success(['Medlem lagt til.']);
    }

    public function removeMember(string $groupName, string $memberType, string $memberId)
    {
        if (!$this->canManageGroup($groupName)) {
            return Responses::forbidden(['Ingen tilgang til å administrere denne gruppen.']);
        }

        if (!in_array($memberType, ['users', 'groups'], true)) {
            return Responses::clientError(['Ugyldig medlemstype.']);
        }

        $client = new UsersApiClient();
        $response = $client->removeMemberFromGroup($groupName, $memberType, $memberId);

        if (!$response->successful()) {
            return Responses::serverError(['Kunne ikke fjerne medlem.']);
        }

        Log::info('Group member removed', [
            'admin' => \Auth::user()->username,
            'group' => $groupName,
            'memberType' => $memberType,
            'memberId' => $memberId,
        ]);

        return Responses::success(['Medlem fjernet.']);
    }

    public function addOwner(Request $request, string $groupName)
    {
        if (!$this->canManageGroup($groupName)) {
            return Responses::forbidden(['Ingen tilgang til å administrere denne gruppen.']);
        }

        $ownerType = $request->input('ownerType');
        $ownerId = $request->input('ownerId');

        if (!in_array($ownerType, ['users', 'groups'], true) || !$ownerId) {
            return Responses::clientError(['Ugyldig eiertype eller ID.']);
        }

        $client = new UsersApiClient();
        $response = $client->addOwnerToGroup($groupName, $ownerType, $ownerId);

        if (!$response->successful()) {
            return Responses::serverError(['Kunne ikke legge til administrator.']);
        }

        Log::info('Group owner added', [
            'admin' => \Auth::user()->username,
            'group' => $groupName,
            'ownerType' => $ownerType,
            'ownerId' => $ownerId,
        ]);

        return Responses::success(['Administrator lagt til.']);
    }

    public function removeOwner(string $groupName, string $ownerType, string $ownerId)
    {
        if (!$this->canManageGroup($groupName)) {
            return Responses::forbidden(['Ingen tilgang til å administrere denne gruppen.']);
        }

        if (!in_array($ownerType, ['users', 'groups'], true)) {
            return Responses::clientError(['Ugyldig eiertype.']);
        }

        $client = new UsersApiClient();
        $response = $client->removeOwnerFromGroup($groupName, $ownerType, $ownerId);

        if (!$response->successful()) {
            return Responses::serverError(['Kunne ikke fjerne administrator.']);
        }

        Log::info('Group owner removed', [
            'admin' => \Auth::user()->username,
            'group' => $groupName,
            'ownerType' => $ownerType,
            'ownerId' => $ownerId,
        ]);

        return Responses::success(['Administrator fjernet.']);
    }
}
