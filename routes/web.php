<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\CustomerBookingController;

use App\Http\Controllers\KiotController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryProductController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\CategoryIngredientController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\PromotionTypeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// USER PAGE    
Route::get('/', [UserController::class, 'home'])->name('home');

Route::get('/menu', [UserController::class, 'menu'])->name('menu');
Route::get('/menu/filter/{categoryId}', [MenuController::class, 'filter'])
    ->where('categoryId', '.*');

Route::get('/location', [UserController::class, 'location'])->name('location');

Route::get('/news', [UserController::class, 'news'])->name('news');

Route::get('/contact', [UserController::class, 'contact'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/booking', [CustomerBookingController::class, 'index'])
    ->name('customer.booking');
Route::post('/booking/store', [CustomerBookingController::class, 'store']);

// LOGIN
Route::prefix('pos')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login'); 
    Route::post('/login', [AuthController::class, 'login'])->name('pos.login.post');
});

Route::prefix('pos')->middleware('auth:staff')->group(function () {
    // LOGOUT
    Route::post('/logout', [AuthController::class, 'logout'])->name('pos.logout');

    // ACCOUNT
    Route::post('/user/update', [StaffController::class, 'updateAccount'])->name('pos.user.update');

    // DASHBOARD
    Route::get('/kiot', [KiotController::class, 'index'])->name('pos.kiot');
    Route::get('/revenue', [KiotController::class, 'revenue']);
    Route::get('/orders',   [KiotController::class, 'orders']);
    Route::get('/products', [KiotController::class, 'products']);
    Route::get('/dashboard/activity', function () {
    return DB::table('activity_log')
        ->leftJoin('users', 'users.id', '=', 'activity_log.staff_id')
        ->select(
            'activity_log.*',
            'users.name as staff_name'
        )
        ->orderByDesc('activity_log.created_at')
        ->limit(10)
        ->get();
});



    // CASHIER
    Route::get('/cashier', [CashierController::class, 'index'])->name('pos.cashier');
    Route::post('/cashier/start-serving', [CashierController::class, 'startServing']);
    Route::post('/cashier/remove-serving', [CashierController::class, 'removeServing']);
    Route::get('/cashier/servicing-count', function () {
        return response()->json([
            'count' => \App\Models\Invoice::where('status', 'serving')->count()
        ]);
    });

    // BOOKING
    Route::get('/booking', [BookingController::class, 'index'])->name('pos.booking');
    Route::post('/booking/store', [BookingController::class, 'store'])->name('booking.store');
    Route::get('/booking/search-product', [ProductController::class, 'searchForBooking']);
    Route::get('/booking/{id}', [BookingController::class, 'show'])->name('pos.booking.show');
    Route::post('/booking/{id}/update', [BookingController::class, 'update'])->name('booking.update');
    Route::post('/booking/{id}/receive', [BookingController::class, 'receive'])->name('booking.receive');
    Route::post('/booking/{id}/cancel', [BookingController::class, 'cancel'])->name('booking.cancel');
    Route::get('/api/booking-items/{id}', [BookingController::class, 'getBookingItems'])->name('api.booking_items');

    // PRODUCT
    Route::get('/product', [ProductController::class, 'index'])->name('pos.product');
    Route::post('/products/store', [ProductController::class, 'store'])->name('product.store');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('product.show');
    Route::post('/products/{id}/update', [ProductController::class, 'update'])->name('product.update');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('product.destroy');
    Route::get('/search-product', [CashierController::class, 'searchProduct'])->name('pos.search.product');

    // CATEGORY PRODUCT
    Route::post('/product-category/store', [CategoryProductController::class, 'store'])
        ->name('product.category.store');
    Route::post('/product-category/update/{id}', [CategoryProductController::class, 'update'])
        ->name('product.category.update');    
    Route::delete('/product-category/delete/{id}', [CategoryProductController::class, 'destroy'])
        ->name('product.category.delete');

    // INGREDIENT
    Route::get('/ingredient', [IngredientController::class, 'index'])->name('pos.ingredient');
    Route::post('/ingredient/store', [IngredientController::class, 'store'])->name('ingredient.store');
    Route::get('/ingredient/{id}', [IngredientController::class, 'show'])->name('ingredient.show');
    Route::post('/ingredient/{id}/update', [IngredientController::class, 'update'])->name('ingredient.update');
    Route::delete('/ingredient/{id}', [IngredientController::class, 'destroy'])->name('ingredient.destroy');
    Route::get('/ingredients/search', function(Request $request) {
        $keyword = $request->keyword;

        return DB::table('ingredient')
            ->selectRaw('
                id,
                code,
                name,
                unit,
                quantity AS stock_qty,
                price AS last_price
            ')
            ->where(function ($q) use ($keyword) {
                $q->where('name', 'LIKE', "%{$keyword}%")
                ->orWhere('code', 'LIKE', "%{$keyword}%");
            })
            ->orderBy('name')
            ->limit(20)
            ->get();
    });


    // CATEGORY INGREDIENT
    Route::post('/ingredient-category/store', [CategoryIngredientController::class, 'store'])
        ->name('ingredient.category.store');
    Route::post('/ingredient-category/update/{id}', [CategoryIngredientController::class, 'update'])
        ->name('ingredient.category.update');    
    Route::delete('/ingredient-category/delete/{id}', [CategoryIngredientController::class, 'destroy'])
        ->name('ingredient.category.delete');

    // TABLE
    Route::get('/table', [TableController::class, 'index'])->name('pos.table');
    Route::post('/table/store', [TableController::class, 'store'])->name('table.store');
    Route::post('/table/{id}/toggle-status', [TableController::class, 'toggleStatus'])
        ->name('table.toggleStatus');
    Route::get('/table/{id}', [TableController::class, 'show'])->name('table.show');
    Route::post('/table/{id}/update', [TableController::class, 'update'])->name('table.update');
    Route::delete('/table/{id}', [TableController::class, 'destroy'])->name('table.destroy');

    // AREA
    Route::post('/area/store', [AreaController::class, 'store'])
        ->name('area.store');
    Route::post('/area/update/{id}', [AreaController::class, 'update'])
        ->name('area.update');    
    Route::delete('/area/delete/{id}', [AreaController::class, 'destroy'])
        ->name('area.delete');

    // INVOICE
    Route::get('/invoice', [InvoiceController::class, 'index'])->name('pos.invoice');
    Route::post('/checkout', [InvoiceController::class, 'checkout'])->name('pos.checkout');
    Route::post('/invoice/{id}/cancel', [InvoiceController::class, 'cancel'])
        ->name('pos.invoice.cancel');

    // IMPORT
    Route::get('/import', [ImportController::class, 'index'])->name('pos.import');
    Route::get('/import/create', [ImportController::class, 'create'])->name('import.detail');
    Route::post('/import/store', [ImportController::class, 'store'])->name('import.store');
    Route::post('/import/import/{id}/cancel', [ImportController::class, 'cancel'])
        ->name('import.cancel');

    // EXPORT 
    Route::get('/export', [ExportController::class, 'index'])->name('pos.export');
    Route::get('/export/create', [ExportController::class, 'create'])->name('export.detail');
    Route::post('/export/store', [ExportController::class, 'store'])->name('export.store');
    Route::post('/export/export/{id}/cancel', [ExportController::class, 'cancel'])
        ->name('export.cancel');

    // CUSTOMER
    Route::get('/customer/check', [CustomerController::class, 'checkByPhone']);
    Route::get('/customer/by-phone', [CustomerController::class, 'findByPhone']);
    Route::get('/customer', [CustomerController::class, 'index'])->name('pos.customer');
    Route::post('/customer/store', [CustomerController::class, 'store'])->name('customer.store');
    Route::post('/customer/{id}/update', [CustomerController::class, 'update'])->name('customer.update');
    Route::get('/customer/{id}', [CustomerController::class, 'show'])->name('customer.show');
    
    // STAFF
    Route::get('/staff', [StaffController::class, 'index'])->name('pos.staff');
    Route::post('/staff/store', [StaffController::class, 'store'])->name('staff.store');
    Route::get('/staff/{id}', [StaffController::class, 'show'])->name('staff.show');
    Route::post('/staff/{id}/update', [StaffController::class, 'update'])->name('staff.update');
    Route::post('/staff/{id}/status', [StaffController::class, 'updateStatus'])->name('staff.status');
    Route::delete('/staff/{id}', [StaffController::class, 'destroy'])->name('staff.destroy');

    //ROLE
    Route::post('/role/store', [RoleController::class, 'store'])
        ->name('role.store');
    Route::post('/role/update/{id}', [RoleController::class, 'update'])
        ->name('role.update');    
    Route::delete('/role/delete/{id}', [RoleController::class, 'destroy'])
        ->name('role.delete');

    // CONTACT
    Route::get('/contact', [ContactController::class, 'index'])->name('pos.contact');
    Route::post('/contact/update-status/{id}', [ContactController::class, 'updateStatus'])->name('contact.update');

    // PROMOTION
    Route::get('/promotion', [PromotionController::class, 'index'])->name('pos.promotion');
    Route::get('/promotion/{id}', [PromotionController::class, 'show'])->name('promotion.show');
    Route::post('/promotion', [PromotionController::class, 'store'])->name('promotion.store');
    Route::put('/promotion/{id}', [PromotionController::class, 'update'])->name('promotion.update');
    Route::delete('promotion/{id}', [PromotionController::class, 'delete'])->name('promotion.delete');
    Route::get('/promotions/available', [PromotionController::class, 'available'])
        ->name('pos.promotions.available');
    //
    Route::post('/promotion-type', [PromotionTypeController::class, 'store'])->name('promotion_type.store');
    Route::put('/promotion-type/{id}', [PromotionTypeController::class, 'update'])->name('promotion_type.update');
    Route::delete('/promotion-type/{id}', [PromotionTypeController::class, 'destroy'])->name('promotion_type.destroy');


});