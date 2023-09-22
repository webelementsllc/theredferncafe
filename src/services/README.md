Services
========

This is the directory where you should put your services.

You can override any logic in any of the services that come with funky by simply making one here with the same name.

If you want to retain some logic in the funky version, just extend the funky service class.

Once you make a service, you can easily call any function from it.

Let's see an example:

Let's say we want to make a service called "weather" that integrates with a nice weather service.

We want to be able to call a function from anywhere that will return the chance it will rain, let's call it `rainChance()`

In this directory (src/services/) we would create a file called "weather.php" that would look like this:

```php
<?php
namespace services;

class weather{
	public function rainChance(){
		// for simplicity, let's assume we live in Seattle:
		return 100;
	}
}
```

With that simple class set up like that, we can call it from *anywhere* by just doing:

```php
f()->weather->rainChance();
```

You can put anything you want in a service, but it's really good for stuff that involves business logic, integrating with something, or just something that you want to be able to re-use anywhere.


Advanced
--------

Technically, services are instantiated as a "singleton", which basically means there is a single object made from your service class the first time it's called.

So you could technically have member variables in your service class that would persist throughout the request lifespan.

You could also use the constructor and destructor to do stuff with handling resources or any logic you want to happen just once per request.
