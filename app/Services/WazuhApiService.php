<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class WazuhApiService
{
    private $baseUrl;
    private $token;

    public function __construct()
    {
        $this->baseUrl = config('services.wazuh.url');
        $this->token = config('services.wazuh.token');
    }

    /**
     * Récupère tous les agents Wazuh
     */
    public function getAgents(): array
    {
        /** @var Response $response */
        $response = Http::withToken($this->token)
            ->withoutVerifying()
            ->get($this->baseUrl . '/agents?limit=500');

        return $response->json()['data']['affected_items'] ?? [];
    }

    /**
     * Récupère la RAM de tous les agents en une seule requête
     */
    public function getAllAgentsHardware(): array
    {
        /** @var Response $response */
        $response = Http::withToken($this->token)
            ->withoutVerifying()
            ->get($this->baseUrl . '/syscollector/hardware');

        return $response->json()['data']['affected_items'] ?? [];
    }

    /**
     * Récupère la RAM d’un agent spécifique
     */
 public function getAgentHardware(string $agentId): ?array
{
    try {
        /** @var Response $response */
        $response = Http::withToken($this->token)
            ->withoutVerifying()
            ->timeout(5) // <--- max 5 secondes par agent
            ->get($this->baseUrl . "/syscollector/{$agentId}/hardware");

        $items = $response->json()['data']['affected_items'] ?? [];
        return $items[0] ?? null;

    } catch (\Illuminate\Http\Client\ConnectionException $e) {
        // On log et on continue
        \Illuminate\Support\Facades\Log::warning("Impossible de récupérer le hardware pour l'agent {$agentId}: " . $e->getMessage());
        return null;
    }
}
}