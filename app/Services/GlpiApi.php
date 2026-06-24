<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GlpiApi
{
    /**
     * Create a new class instance.
     */
    private string $baseUrl;

    private string $appToken;

    private string $userToken;

    public function __construct()
    {
        $this->baseUrl = config('services.glpi.url');
        $this->appToken = config('services.glpi.app_token');
        $this->userToken = config('services.glpi.user_token');

        if ($this->baseUrl === '' || $this->appToken === '' || $this->userToken === '') {
            throw new RuntimeException('GLPI config missing: check GLPI_URL / GLPI_APP_TOKEN / GLPI_USER_TOKEN in .env');
        }
    }

    private function http(): PendingRequest
    {
        // Doc: always provide Content-Type header
        return Http::withHeaders([
            'Content-Type' => 'application/json',
            'App-Token' => $this->appToken,
        ])->timeout(20);
    }

    public function initSession(): string
    {
        /** @var Response $res */
        $res = $this->http()
            ->withHeaders([
                'Authorization' => 'user_token '.$this->userToken,
            ])
            ->get($this->baseUrl.'/apirest.php/initSession');

        $res->throw();

        $token = $res->json('session_token');

        if (! is_string($token) || $token === '') {
            throw new RuntimeException('GLPI initSession failed: session_token not found in response');
        }

        return $token;
    }

    /**
     * Doc: killSession is GET
     */
    public function killSession(string $sessionToken): void
    {
        /** @var Response $res */
        $res = $this->http()
            ->withHeaders(['Session-Token' => $sessionToken])
            ->get($this->baseUrl.'/apirest.php/killSession');

        $res->throw();
    }

    /**
     * GET collection: /apirest.php/:itemtype/
     * Doc: GET requests must have empty body; params in query string.
     */
    public function getCollection(string $itemtype, string $sessionToken, array $query = []): array
    {
        /** @var Response $res */
        $res = $this->http()
            ->withHeaders(['Session-Token' => $sessionToken])
            ->get($this->baseUrl.'/apirest.php/'.trim($itemtype, '/').'/', $query);

        $res->throw();

        $data = $res->json();

        return is_array($data) ? $data : [];
    }

    /**
     * GET item: /apirest.php/:itemtype/:id
     */
    public function getItem(string $itemtype, int $id, string $sessionToken, array $query = []): array
    {
        /** @var Response $res */
        $res = $this->http()
            ->withHeaders(['Session-Token' => $sessionToken])
            ->get($this->baseUrl.'/apirest.php/'.trim($itemtype, '/').'/'.$id, $query);

        $res->throw();

        $data = $res->json();

        return is_array($data) ? $data : [];
    }

    /**
     * GET sub-collection: /apirest.php/{parentType}/{parentId}/{childType}
     * Example: /Computer/1/Item_Disk
     */
    public function getSubCollection(string $parentType, int $parentId, string $childType, string $sessionToken, array $query = []): array
    {
        /** @var Response $res */
        $res = $this->http()
            ->withHeaders(['Session-Token' => $sessionToken])
            ->get(
                $this->baseUrl.'/apirest.php/'
                    .trim($parentType, '/').'/'
                    .$parentId.'/'
                    .trim($childType, '/'),
                $query
            );

        $res->throw();

        $data = $res->json();

        return is_array($data) ? $data : [];
    }

    public function getMultipleItems(
        string $itemtype,
        array $ids,
        string $sessionToken,
        array $query = []
    ): array {
        if (empty($ids)) {
            return [];
        }

        // Construit items[0][itemtype]=X&items[0][items_id]=1&...
        $params = $query;

        foreach (array_values($ids) as $index => $id) {
            $params["items[{$index}][itemtype]"] = $itemtype;
            $params["items[{$index}][items_id]"] = $id;
        }

        /** @var Response $res */
        $res = $this->http()
            ->withHeaders(['Session-Token' => $sessionToken])
            ->get($this->baseUrl.'/apirest.php/getMultipleItems', $params);

        $res->throw();

        $data = $res->json();

        return is_array($data) ? $data : [];
    }

    public function search(string $itemType, string $sessionToken, array $params = [])
    {
        /** @var Response $res */
        $res = $this->http()
            ->withHeaders(['Session-Token' => $sessionToken])
            ->get($this->baseUrl.'/apirest.php/search/'.trim($itemType, '/'), $params);

        $res->throw();

        $data = $res->json();

        return is_array($data) ? $data : [];
    }
}
