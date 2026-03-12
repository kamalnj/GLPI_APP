<?php

use App\Http\Controllers\ComputerDetailsController;
use App\Http\Controllers\inventaireController;
use App\Http\Controllers\alertesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect('/login');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/inventaire', [inventaireController::class, 'index'])->name('inventaire');
Route::get('/inventaire/{computer}', [ComputerDetailsController::class, 'show'])->name('inventaire.show');
Route::get('/alertes', [alertesController::class, 'index'])->name('alertes');






require __DIR__.'/settings.php';
