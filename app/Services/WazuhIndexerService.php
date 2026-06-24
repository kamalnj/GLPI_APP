<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class WazuhIndexerService
{
    public function initialScroll($scrollId = null)
    {

        if ($scrollId) {
            /** @var Response $response */
            $response = Http::withBasicAuth(
                config('services.wazuh_indexer.user'),
                config('services.wazuh_indexer.password')
            )
                ->withoutVerifying()
                ->post(config('services.wazuh_indexer.url').'/_search/scroll', [
                    'scroll' => '2m',
                    'scroll_id' => $scrollId,
                ]);
        } else {
            /** @var Response $response */
            $response = Http::withBasicAuth(
                config('services.wazuh_indexer.user'),
                config('services.wazuh_indexer.password')
            )
                ->withoutVerifying()
                ->post(config('services.wazuh_indexer.url').'/wazuh-states-vulnerabilities-*/_search?scroll=2m', [
                    'size' => 500,
                    'query' => [
                        'match_all' => (object) [],
                    ],
                ]);
        }

        return $response->json();
    }

    public function incremental($date)
    {
        $query = [
            'size' => 10,  // Réduit à 10 pour éviter circuit breaker
            '_source' => [
                'agent',
                'vulnerability',
                'package',
            ],
            'query' => [
                'range' => [
                    'vulnerability.detected_at' => [
                        'gte' => $date,
                    ],
                ],
            ],
        ];

        $url = config('services.wazuh_indexer.url').'/wazuh-states-vulnerabilities-*/_search?scroll=5m';

        error_log('Wazuh filtering vulnerability.detected_at from: '.$date);

        /** @var Response $response */
        $response = Http::withBasicAuth(
            config('services.wazuh_indexer.user'),
            config('services.wazuh_indexer.password')
        )
            ->withoutVerifying()
            ->post($url, $query);

        $result = $response->json();
        error_log('Wazuh response status: '.$response->status());
        error_log('Wazuh total hits: '.($result['hits']['total']['value'] ?? 'unknown'));

        return $result;
    }

    public function scroll($scrollId)
    {
        /** @var Response $response */
        $response = Http::withBasicAuth(
            config('services.wazuh_indexer.user'),
            config('services.wazuh_indexer.password')
        )
            ->withoutVerifying()
            ->post(config('services.wazuh_indexer.url').'/_search/scroll', [
                'scroll' => '5m',
                'scroll_id' => $scrollId,
            ]);

        return $response->json();
    }

    public function testSample($date = null)
    {
        // Si pas de date, utiliser une date très récente pour limiter les résultats
        if (! $date) {
            $date = now()->subDays(7)->toIso8601ZuluString();
        }

        $query = [
            'size' => 1,
            '_source' => ['agent', 'vulnerability', 'package'],
            'query' => [
                'range' => [
                    'vulnerability.detected_at' => [
                        'gte' => $date,
                    ],
                ],
            ],
        ];

        $url = config('services.wazuh_indexer.url').'/wazuh-states-vulnerabilities-*/_search';

        error_log('Fetching test sample from: '.$url);

        /** @var Response $response */
        $response = Http::withBasicAuth(
            config('services.wazuh_indexer.user'),
            config('services.wazuh_indexer.password')
        )
            ->withoutVerifying()
            ->post($url, $query);

        error_log('Test sample status: '.$response->status());
        $result = $response->json();
        error_log('Test sample result: '.json_encode($result));

        return $result;
    }
}
