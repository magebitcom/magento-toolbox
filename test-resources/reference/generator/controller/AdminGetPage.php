<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Controller\Adminhtml\Item;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\View\Result\PageFactory;

/**
 * Admin route: admin/foo-bar/item/edit
 */
class Edit extends Action implements HttpGetActionInterface
{
    public const ADMIN_RESOURCE = 'Foo_Bar::items';

    public function __construct(
        Context $context,
        private PageFactory $pageFactory,
    ) {
        parent::__construct($context);
    }

    public function execute()
    {
        $page = $this->pageFactory->create();
        $page->setActiveMenu(self::ADMIN_RESOURCE);
        $page->getConfig()->getTitle()->prepend(__('Edit'));

        return $page;
    }
}
