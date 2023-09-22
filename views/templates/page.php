<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Red Fern Cafe</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="https://use.typekit.net/ycb0xxj.css">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png">
    <link rel="manifest" href="/images/favicon/site.webmanifest">
    <link rel="mask-icon" href="/images/favicon/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="/images/favicon/favicon.ico">
    <meta name="msapplication-TileColor" content="#00aba9">
    <meta name="msapplication-config" content="/images/favicon/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">
</head>
<body<?=(empty($bodyClass)) ? '' : ' class="'.$bodyClass.'"' ?>>
    <header>
        <nav>
            <a href="/about">About</a>
            <a href="/" class="logo"><h1>The Red Fern Cafe</h1><img src="/images/red-fern-logo.svg" alt="The Red Fern Cafe"></a>
            <a href="/menu">Menu</a>
        </nav>
    </header>
	<?=$content?>
    <footer>
        <div>
            <p>The Red Fern Cafe</p>
            <a href="https://www.google.com/maps/dir//125+E+Lincoln+Ave,+Fall+Creek,+WI+54742/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x87f8b40eccf330c5:0x4331d18cb77485e5?sa=X&ved=2ahUKEwissNiP5JaBAxVZGzQIHXuBANwQwwV6BAgcEAA&ved=2ahUKEwissNiP5JaBAxVZGzQIHXuBANwQwwV6BAgeEAQ">125 East Lincoln Ave<br>
                Fall Creek WI 54742</a>
        </div>
        <div class="social">
            <a href="https://www.facebook.com/profile.php?id=61550757692586"><img src="/images/facebook_white.svg" alt="Facebook"></a>
            <a href="https://www.instagram.com/redferncafe/"><img src="/images/instagram_white.svg" alt="instagram"></a>
            <a href="tel:7158771280"><img src="/images/phone.svg" alt="Call"></a>
            <a href="mailto:theredferncafe@gmail.com"><img src="/images/email.svg" alt="Email"></a>
        </div>
    </footer>
</body>
</html>