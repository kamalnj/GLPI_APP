<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class WazuhIndexerService
{

    public function initialScroll($scrollId=null)
    {

        if($scrollId){
                                    /** @var Response $response */

            $response = Http::withBasicAuth(
                config('services.wazuh_indexer.user'),
                config('services.wazuh_indexer.password')
            )
            ->withoutVerifying()
            ->post(config('services.wazuh_indexer.url').'/_search/scroll',[
                'scroll'=>'2m',
                'scroll_id'=>$scrollId
            ]);

        }else{
                                /** @var Response $response */

            $response = Http::withBasicAuth(
                config('services.wazuh_indexer.user'),
                config('services.wazuh_indexer.password')
            )
            ->withoutVerifying()
            ->post(config('services.wazuh_indexer.url').'/wazuh-states-vulnerabilities-*/_search?scroll=2m',[
                'size'=>500,
                'query'=>[
                    'match_all'=>(object)[]
                ]
            ]);
        }

        return $response->json();
    }


    public function incremental($date)
    {
                                        /** @var Response $response */

        $response = Http::withBasicAuth(
            config('services.wazuh_indexer.user'),
            config('services.wazuh_indexer.password')
        )
        ->withoutVerifying()
        ->post(config('services.wazuh_indexer.url').'/wazuh-states-vulnerabilities-*/_search',[
            'size'=>500,
            'query'=>[
                'range'=>[
                    'detected_at'=>[
                        'gt'=>$date
                    ]
                ]
            ]
        ]);

        return $response->json();
    }
}