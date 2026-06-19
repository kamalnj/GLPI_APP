<?php


use Illuminate\Support\Facades\Schedule;


Schedule::command('glpi:sync-computers')->daily();
Schedule::command('glpi:sync-cpu')->daily();
Schedule::command('glpi:sync-ram')->daily();
Schedule::command('glpi:sync-volumes')->daily();
Schedule::command('glpi:sync-os')->daily();
Schedule::command('glpi:sync-softwares')->daily();
Schedule::command('glpi:sync-antiviruses')->daily();
Schedule::command('wazuh:sync-agents')->daily();
Schedule::command('wazuh:link-computers')->daily(); 
Schedule::command('wazuh:initial-import')->daily();
Schedule::command('wazuh:sync-vulns')->daily();



