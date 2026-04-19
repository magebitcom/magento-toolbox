<?php

/**
 * Foo_Bar
 */

declare(strict_types=1);

namespace Foo\Bar\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class TestCliCommand extends Command
{
    /**
     * @inheritdoc
     */
    protected function configure(): void
    {
        $this->setName('foo:bar:test');
        $this->setDescription('Runs the test command');
        parent::configure();
    }

    /**
     * @inheritdoc
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // TODO: Implement execute() method.

        return Command::SUCCESS;
    }
}
