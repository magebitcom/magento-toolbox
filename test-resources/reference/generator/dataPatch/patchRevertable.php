<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Setup\Patch\Data;

use Magento\Framework\Setup\Patch\DataPatchInterface;
use Magento\Framework\Setup\Patch\PatchRevertableInterface;

class TestRevertableDataPatch implements DataPatchInterface, PatchRevertableInterface
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
    public function revert(): void
    {
        // TODO: Implement revert() method.
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
