<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\Staff;

class UserController extends Controller
{
    public function home()     
    { 
        return view('user.home'); 
    }

    public function menu()
    {
        $categories = DB::table('category_product')
            ->join('product', 'category_product.id', '=', 'product.category_id')
            ->select('category_product.id', 'category_product.name')
            ->distinct()
            ->get();

        $products = DB::table('product')->get();

        return view('user.menu', compact('categories', 'products'));
    }

    public function location()  
    {
        return view('user.location'); 
    }

    public function news()      
    { 
        return view('user.news'); 
    }

    public function contact()   
    { 
        return view('user.contact'); 
    }
}
