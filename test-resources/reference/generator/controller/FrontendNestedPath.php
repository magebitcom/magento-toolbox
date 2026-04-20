<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Controller\Account\Password;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\View\Result\PageFactory;

/**
 * Storefront route: foo-bar/account/password/reset
 */
class Reset extends Action implements HttpGetActionInterface, HttpPostActionInterface
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
