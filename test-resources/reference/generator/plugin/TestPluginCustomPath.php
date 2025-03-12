<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Plugin\Custom\Path;

use Foo\Bar\Model\SubjectClass;

class TestPlugin
{
    public function aroundSetData(SubjectClass $subject, callable $proceed, array $data)
    {
        // TODO: Plugin code
    }
}
