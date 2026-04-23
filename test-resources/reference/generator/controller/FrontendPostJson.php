<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Controller\Api;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\Controller\Result\JsonFactory;

/**
 * Storefront route: foo-bar/api/save
 */
class Save extends Action implements HttpPostActionInterface
{
    public function __construct(
        Context $context,
        private JsonFactory $jsonFactory,
    ) {
        parent::__construct($context);
    }

    public function execute()
    {
        return $this->jsonFactory->create()->setData([]);
    }
}
