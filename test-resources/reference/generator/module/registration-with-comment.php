<?php

/**
 * This is a test comment
 */

declare(strict_types=1);

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(ComponentRegistrar::MODULE, 'Foo_Bar', __DIR__);
