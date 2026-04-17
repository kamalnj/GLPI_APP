<?php

use App\Http\Controllers\ComputerDetailsController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\AlertesController;
use App\Http\Controllers\alertesController as ControllersAlertesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect('/login');
})->name('home');

/*
|--------------------------------------------------------------------------
| Protected Routes (Auth + Verified + Rate Limit)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'throttle:60,1'])->group(function () {

    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Inventaire
    Route::get('/inventaire', [InventaireController::class, 'index'])
        ->name('inventaire');

    Route::get('/inventaire/{computer}', [ComputerDetailsController::class, 'show'])
        ->name('inventaire.show');

    // Alertes
    Route::get('/alertes', [AlertesController::class, 'index'])
        ->name('alertes');
    
    // Export des vulnérabilités
    Route::get('/inventaire/{computer}/export', [ComputerDetailsController::class, 'export'])
        ->name('vulne.export');

    // Export des volumes
    Route::get('/alertes/export/volumes', [ControllersAlertesController::class, 'exportDisque'])
        ->name('volumes.export');

    // Export des patches de sécurité
    Route::get('/alertes/export/patches', [ControllersAlertesController::class, 'exportPatch'])
        ->name('patches.export');

    // Export de l'inventaire
    Route::get('/alertes/export/inventaire', [ControllersAlertesController::class, 'exportInventory'])
        ->name('inventaire.export');
});



require __DIR__.'/settings.php';