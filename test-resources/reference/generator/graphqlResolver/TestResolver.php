<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

/**
 * Resolves the test field.
 */
class TestResolver implements ResolverInterface
{
    /**
     * @inheritdoc
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        // TODO: Implement resolve() method.

        return null;
    }
}
