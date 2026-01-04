<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class KiotController extends Controller
{
    public function index()
    {
        return view('pos.kiot');
    }
}
