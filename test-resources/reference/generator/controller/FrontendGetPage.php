<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\View\Result\PageFactory;

/**
 * Storefront route: foo-bar/index/index
 */
class Index extends Action implements HttpGetActionInterface
{
    public function __construct(
        Context $context,
        private PageFactory $pageFactory,
    ) {
        parent::__construct($context);
    }

    public function execute()
    {
        return $this->pageFactory->create();
    }
}
