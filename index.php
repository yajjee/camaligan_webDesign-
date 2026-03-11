<?php
// Serve the main page from html/template/ while keeping all relative URLs correct.
header('Location: html/template/main.html', true, 302);
exit;