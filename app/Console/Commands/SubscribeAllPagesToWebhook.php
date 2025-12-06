<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FacebookPage;
use App\Actions\Facebook\SubscribePageToWebhookAction;

class SubscribeAllPagesToWebhook extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'facebook:subscribe-webhooks {--check : Only check subscription status without subscribing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Subscribe all Facebook pages to webhooks for receiving messages and comments';

    /**
     * Execute the console command.
     */
    public function handle(SubscribePageToWebhookAction $subscribeAction)
    {
        $this->info('🔔 Facebook Webhook Subscription Tool');
        $this->newLine();

        $pages = FacebookPage::all();

        if ($pages->isEmpty()) {
            $this->warn('⚠️  No Facebook pages found!');
            return 0;
        }

        $this->info("Found {$pages->count()} pages");
        $this->newLine();

        // Check mode
        if ($this->option('check')) {
            $this->info('📊 Checking subscription status...');
            $this->newLine();

            $subscribed = 0;
            $notSubscribed = 0;

            foreach ($pages as $page) {
                $status = $subscribeAction->checkSubscription($page);
                
                if ($status['subscribed']) {
                    $subscribed++;
                    $fields = implode(', ', $status['fields']);
                    $this->line("✅ {$page->name}");
                    $this->line("   Fields: {$fields}");
                } else {
                    $notSubscribed++;
                    $this->line("❌ {$page->name} - NOT SUBSCRIBED");
                }
                $this->newLine();
            }

            $this->table(
                ['Status', 'Count'],
                [
                    ['✅ Subscribed', $subscribed],
                    ['❌ Not Subscribed', $notSubscribed],
                    ['📝 Total', $pages->count()],
                ]
            );

            if ($notSubscribed > 0) {
                $this->newLine();
                $this->info('💡 Run without --check flag to subscribe all pages');
            }

            return 0;
        }

        // Subscribe mode
        $this->info('🚀 Subscribing pages to webhooks...');
        $this->newLine();

        $bar = $this->output->createProgressBar($pages->count());
        $bar->start();

        $success = 0;
        $failed = 0;
        $failedPages = [];

        foreach ($pages as $page) {
            if ($subscribeAction->execute($page)) {
                $success++;
                $this->info("\n✅ Subscribed: {$page->name}");
            } else {
                $failed++;
                $failedPages[] = $page->name;
                $this->error("\n❌ Failed: {$page->name}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('📊 Summary:');
        $this->table(
            ['Status', 'Count'],
            [
                ['✅ Subscribed', $success],
                ['❌ Failed', $failed],
                ['📝 Total', $pages->count()],
            ]
        );

        if ($failed > 0) {
            $this->newLine();
            $this->warn('⚠️  Failed pages:');
            foreach ($failedPages as $pageName) {
                $this->line("   - {$pageName}");
            }
            $this->newLine();
            $this->info('💡 Check storage/logs/laravel.log for error details');
        }

        if ($success > 0) {
            $this->newLine();
            $this->info('🎉 Webhook subscription complete!');
            $this->info('📱 Your pages can now receive messages and comments in real-time.');
        }

        return 0;
    }
}
