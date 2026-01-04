<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        View::composer('user.partials.header', function ($view) {
            $locations = DB::table('location')
                ->where('status', 1)
                ->orderBy('name')
                ->get();

            $view->with('locations', $locations);

            $promotions = DB::table('promotion')
                ->whereDate('start_date', '<=', now())
                ->where(function ($q) {
                    $q->whereDate('end_date', '>=', now())
                    ->orWhereNull('end_date');
                })
                ->orderBy('name')
                ->get();

            $view->with('promotions', $promotions);
        });
    }
}
