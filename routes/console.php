<?php


use Illuminate\Support\Facades\Schedule;


    Schedule::command('prod:run-all')
             ->dailyAt('02:00')        
             ->withoutOverlapping()    // évite les doublons si sync lente
             ->runInBackground()       // non bloquant
             ->appendOutputTo(storage_path('logs/sync.log')); // logs



