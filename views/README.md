Views
=====

This directory is where you should put your *views*

A view is basically like an HTML file that you can turn into a string easily, and you can pass it variables.

Here's a simple view for a site nav. This file is PROJECTROOT/views/flash.php

```php
<div class="flash">
	<p><?=$message?></p>
</div>
```

Now that that file exists, I can include that anywhere by just doing:

```php
$html = f()->view->load('flash', [
	'message'=>'Hello!',
]);
```

This is particularly useful when including views inside other controllers or other views.


Using views inside controllers
------------------------------

Controller functions are useful when you return a string.
Views happen to return strings.

Here is a nice example of a simple product listings page using a controller and a view.


This file is src/controllers/products.php:

```php
<?php
namespace controllers; // because it's in the `src/controllers/` directory

class products{
	// the route for this function is `/products` because the `index` is the default function name
	public function index(){
		// get all active products using the `isactive` field I made:
		$products = product::query()->where('isactive = 1');

		// load the HTML:
		return f()->view->load('products/index', [
			'products'=>$products,
		]);
	}
}
```

This file is views/products/index.php:

```php
<h2>Products</h2>
<ul>
	<?foreach($products as $product){?>
		<li>
			<a href="<?=$product->url()?>"><?=$product->name?></a>
			<?if($product->image->exists()){?>
				<img src="<?=$product->image->url()?>" alt="<?=$product->image->alt?>"/>
			<?}?>
		</li>
	<?}?>
</ul>
```


Using a view in a view
----------------------

Since the view->load() function just returns a string, you can easily include a view inside another view.

Let's say we have a view in the file views/components/social.php:

```php
<div class="social">
	<h2>Talk to me</h2>
	<a href="">Facebook</a>
	<a href="">Twitter</a>
	<a href="">Instagram</a>
</div>
```

Now we can include that in any other view like this:

```php
<?=f()->view->load('components/social')?>
```
