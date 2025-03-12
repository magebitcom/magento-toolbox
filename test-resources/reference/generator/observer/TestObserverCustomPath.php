<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Observer\Custom\Path;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class TestObserver implements ObserverInterface
{
    /**
     * Observer for "test_event"
     * 
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        $event = $observer->getEvent();
        // TODO: Observer code
    }
}
