<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PrivacyPolicyController extends Controller
{
    public function show()
    {
        return Inertia::render('PrivacyPolicy');
    }
}
