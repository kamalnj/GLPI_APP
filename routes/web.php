<?php

use App\Http\Controllers\ComputerDetailsController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\AlertesController;
use App\Http\Controllers\CollaborateursController;
use App\Http\Controllers\DashboardController;
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
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

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
    Route::get('/alertes/export/volumes', [AlertesController::class, 'exportDisque'])
        ->name('volumes.export');

    // Export des patches de sécurité
    Route::get('/alertes/export/patches', [AlertesController::class, 'exportPatch'])
        ->name('patches.export');

    // Export de l'inventaire
    Route::get('/alertes/export/inventaire', [AlertesController::class, 'exportInventory'])
        ->name('inventaire.export');

    Route::get('/collaborateurs', [CollaborateursController::class, 'index'])
        ->name('collaborateurs');

    Route::get('/collaborateurs/export/data', [CollaborateursController::class, 'export'])
        ->name('collaborateurs.export');

    Route::get('/collaborateurs/{user}', [CollaborateursController::class, 'show'])
        ->name('collaborateurs.show');
});



require __DIR__ . '/settings.php';
