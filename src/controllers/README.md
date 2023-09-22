Controllers
===========

Controllers are your easy way to make a page, or a series of related pages.

Let's say you want 2 pages: a product listings page at `/products`, and a product details page at `/products/show/PRODUCT_SLUG`

You would want to make a controller like this, in this directory (src/controllers/products.php)

```php
<?php
namespace controllers;

class products{
	// index is the name of the route that will be invoked in the absense of everything else
	// so the full path for this route is `/products`
	public function index(){
		// load all active products (this uses a model I would have already set up called "product")
		$products = product::query()->where('isactive = 1');

		// load a view, which returns a string containing the HTML from the view file
		return f()->view->load('products/index', [
			'products'=>$products,
		]);
	}

	// naming this function "show" makes the route for this function be "/products/show/{slug}"
	public function show($product_slug){
		// this attempts to load a product using a function I would have already set up called fromslug()
		$product = product::fromslug($product_slug);

		// load the product "show" page
		return f()->view->load('products/show', [
			'product'=>$product,
		]);
	}
}
```