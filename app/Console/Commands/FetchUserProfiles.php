<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FacebookPageUser;
use App\Services\Facebook\FacebookService;

class FetchUserProfiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'facebook:fetch-profiles {--all : Fetch all profiles, not just missing ones}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch user profiles (name and profile picture) from Facebook for users who are missing this data';

    /**
     * Execute the console command.
     */
    public function handle(FacebookService $facebookService)
    {
        $this->info('🔍 Fetching user profiles from Facebook...');
        $this->newLine();

        // Get users without names, or all users if --all flag is used
        $query = FacebookPageUser::with('page');
        
        if (!$this->option('all')) {
            $query->whereNull('name');
        }
        
        $users = $query->get();

        if ($users->isEmpty()) {
            $this->info('✅ No users need profile updates!');
            return 0;
        }

        $this->info("Found {$users->count()} users to update");
        $this->newLine();

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $updated = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                $page = $user->page;
                
                if (!$page) {
                    $this->warn("\n⚠️  User {$user->psid} has no associated page");
                    $failed++;
                    $bar->advance();
                    continue;
                }

                $token = decrypt($page->access_token);
                $profile = $facebookService->getUserProfile($user->psid, $token);

                if ($profile && isset($profile['name'])) {
                    $user->update([
                        'name' => $profile['name'] ?? null,
                        'profile_pic' => $profile['profile_pic'] ?? null,
                    ]);

                    $updated++;
                    $this->info("\n✅ Updated: {$user->psid} -> {$profile['name']}");
                } else {
                    $failed++;
                    $this->warn("\n⚠️  Could not fetch profile for: {$user->psid}");
                }
            } catch (\Exception $e) {
                $failed++;
                $this->error("\n❌ Error for {$user->psid}: " . $e->getMessage());
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
                ['✅ Updated', $updated],
                ['❌ Failed', $failed],
                ['📝 Total', $users->count()],
            ]
        );

        if ($updated > 0) {
            $this->newLine();
            $this->info('🎉 Profile fetch complete! Refresh your chat page to see the updates.');
        }

        return 0;
    }
}
