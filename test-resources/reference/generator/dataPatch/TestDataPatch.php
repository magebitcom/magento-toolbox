<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Setup\Patch\Data;

use Magento\Framework\Setup\Patch\DataPatchInterface;

class TestDataPatch implements DataPatchInterface
{
    /**
     * @inheritdoc
     */
    public function apply(): self
    {
        // TODO: Implement apply() method.

        return $this;
    }

    /**
     * @inheritdoc
     */
    public function getAliases(): array
    {
        return [];
    }

    /**
     * @inheritdoc
     */
    public static function getDependencies(): array
    {
        return [];
    }
}
