<?php

use App\Http\Controllers\ComputerDetailsController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\AlertesController;
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

});



require __DIR__.'/settings.php';