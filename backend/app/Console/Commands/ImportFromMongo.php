<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Import data from mongoexport JSONL files into PostgreSQL.
 *
 * Usage:
 *   mongoexport --uri="mongodb://..." --collection=books --out=books.json
 *   (repeat for bukker, matmeny, googleapps_accounts, googleapps_accountusers, users)
 *
 *   php artisan import:from-mongo /path/to/export/dir
 *
 * Can be deleted after migration is complete.
 */
class ImportFromMongo extends Command
{
    protected $signature = 'import:from-mongo {dir : Directory containing mongoexport JSONL files}';
    protected $description = 'Import mongoexport JSONL files into PostgreSQL';

    // Maps old MongoDB _id to new ULID
    private array $idMap = [];

    public function handle(): int
    {
        $dir = $this->argument('dir');

        if (!is_dir($dir)) {
            $this->error("Directory not found: $dir");
            return 1;
        }

        DB::beginTransaction();
        try {
            $this->importBooks("$dir/books.json");
            $this->importBukker("$dir/bukker.json");
            $this->importMatmeny("$dir/matmeny.json");
            $this->importGoogleappsAccounts("$dir/googleapps_accounts.json");
            $this->importGoogleappsAccountusers("$dir/googleapps_accountusers.json");
            $this->importUsers("$dir/users.json");
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("Import failed: " . $e->getMessage());
            return 1;
        }

        $this->info('Import complete.');
        return 0;
    }

    private function readJsonl(string $path): array
    {
        if (!file_exists($path)) {
            $this->warn("File not found, skipping: $path");
            return [];
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $records = [];
        foreach ($lines as $i => $line) {
            $decoded = json_decode($line, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->warn("Invalid JSON at line " . ($i + 1) . " in $path, skipping");
                continue;
            }
            $records[] = $decoded;
        }
        return $records;
    }

    private function mapId(string $oldId): string
    {
        if (!isset($this->idMap[$oldId])) {
            $this->idMap[$oldId] = strtolower((string) Str::ulid());
        }
        return $this->idMap[$oldId];
    }

    private function extractOid(mixed $id): string
    {
        if (is_array($id) && isset($id['$oid'])) {
            return $id['$oid'];
        }
        return (string) $id;
    }

    private function extractDate(mixed $date): ?string
    {
        if (is_array($date) && isset($date['$date'])) {
            $val = $date['$date'];
            if (is_array($val) && isset($val['$numberLong'])) {
                $ms = (int) $val['$numberLong'];
                $sec = intdiv($ms, 1000);
                $frac = $ms % 1000;
                return gmdate('Y-m-d H:i:s', $sec) . sprintf('.%03d', $frac) . '+00';
            }
            return $this->parseDateString($val);
        }
        if (is_string($date)) {
            return $this->parseDateString($date);
        }
        return null;
    }

    private function parseDateString(string $val): ?string
    {
        try {
            $dt = (new \DateTimeImmutable($val))->setTimezone(new \DateTimeZone('UTC'));
            return $dt->format('Y-m-d H:i:s.v') . '+00';
        } catch (\Exception) {
            return null;
        }
    }

    private function importBooks(string $path): void
    {
        $records = $this->readJsonl($path);
        $this->info("Importing " . count($records) . " books...");

        foreach ($records as $doc) {
            $oldId = $this->extractOid($doc['_id']);
            DB::table('books')->insert([
                'id' => $this->mapId($oldId),
                'title' => $doc['title'] ?? null,
                'subtitle' => $doc['subtitle'] ?? null,
                'authors' => isset($doc['authors']) ? json_encode($doc['authors']) : null,
                'pubdate' => $doc['pubdate'] ?? null,
                'description' => $doc['description'] ?? null,
                'isbn' => $doc['isbn'] ?? null,
                'isbn_data' => isset($doc['isbn_data']) ? json_encode($doc['isbn_data']) : null,
                'thumbnail' => $doc['thumbnail'] ?? null,
                'bib_barcode' => $doc['bib_barcode'] ?? null,
                'bib_comment' => $doc['bib_comment'] ?? null,
                'bib_room' => $doc['bib_room'] ?? null,
                'bib_section' => $doc['bib_section'] ?? null,
                'created_at' => $this->extractDate($doc['created_at'] ?? null),
                'updated_at' => $this->extractDate($doc['updated_at'] ?? null),
            ]);
        }
    }

    private function importBukker(string $path): void
    {
        $records = $this->readJsonl($path);
        $this->info("Importing " . count($records) . " bukker...");

        foreach ($records as $doc) {
            $oldId = $this->extractOid($doc['_id']);

            // 'died' and 'dead' are the same concept; prefer 'died', fall back to 'dead'
            $died = $doc['died'] ?? $doc['dead'] ?? null;
            if ($died === true) {
                $died = 'true';
            } elseif (is_int($died)) {
                $died = (string) $died;
            }

            // Awards are embedded — extract and clean up MongoDB metadata
            $awards = [];
            if (isset($doc['awards']) && is_array($doc['awards'])) {
                foreach ($doc['awards'] as $award) {
                    unset($award['_id'], $award['created_at'], $award['updated_at']);
                    $awards[] = $award;
                }
            }

            DB::table('bukker')->insert([
                'id' => $this->mapId($oldId),
                'name' => $doc['name'] ?? '',
                'died' => $died,
                'comment' => $doc['comment'] ?? null,
                'awards' => !empty($awards) ? json_encode($awards) : null,
                'created_at' => $this->extractDate($doc['created_at'] ?? null),
                'updated_at' => $this->extractDate($doc['updated_at'] ?? null),
            ]);
        }
    }

    private function importMatmeny(string $path): void
    {
        $records = $this->readJsonl($path);
        $this->info("Importing " . count($records) . " matmeny...");

        foreach ($records as $doc) {
            $oldId = $this->extractOid($doc['_id']);
            DB::table('matmeny')->insert([
                'id' => $this->mapId($oldId),
                'day' => $doc['day'] ?? null,
                'text' => $doc['text'] ?? null,
                'dishes' => isset($doc['dishes']) ? json_encode($doc['dishes']) : null,
                'created_at' => $this->extractDate($doc['created_at'] ?? null),
                'updated_at' => $this->extractDate($doc['updated_at'] ?? null),
            ]);
        }
    }

    private function importGoogleappsAccounts(string $path): void
    {
        $records = $this->readJsonl($path);
        $this->info("Importing " . count($records) . " googleapps_accounts...");

        foreach ($records as $doc) {
            $oldId = $this->extractOid($doc['_id']);
            DB::table('googleapps_accounts')->insert([
                'id' => $this->mapId($oldId),
                'accountname' => $doc['accountname'] ?? '',
                'group' => $doc['group'] ?? null,
                'aliases' => isset($doc['aliases']) ? json_encode($doc['aliases']) : null,
                'created_at' => $this->extractDate($doc['created_at'] ?? null),
                'updated_at' => $this->extractDate($doc['updated_at'] ?? null),
                'deleted_at' => $this->extractDate($doc['deleted_at'] ?? null),
            ]);
        }
    }

    private function importGoogleappsAccountusers(string $path): void
    {
        $records = $this->readJsonl($path);
        $this->info("Importing " . count($records) . " googleapps_accountusers...");

        foreach ($records as $doc) {
            $oldId = $this->extractOid($doc['_id']);
            $accountOldId = $this->extractOid($doc['account_id']);

            if (!isset($this->idMap[$accountOldId])) {
                $this->warn("Account not found for accountuser, skipping: $accountOldId");
                continue;
            }

            DB::table('googleapps_accountusers')->insert([
                'id' => $this->mapId($oldId),
                'account_id' => $this->idMap[$accountOldId],
                'username' => $doc['username'] ?? '',
                'notification' => $doc['notification'] ?? false,
                'created_at' => $this->extractDate($doc['created_at'] ?? null),
                'updated_at' => $this->extractDate($doc['updated_at'] ?? null),
                'deleted_at' => $this->extractDate($doc['deleted_at'] ?? null),
            ]);
        }
    }

    private function importUsers(string $path): void
    {
        $records = $this->readJsonl($path);
        $this->info("Importing " . count($records) . " users...");

        $seen = [];
        foreach ($records as $doc) {
            $username = $doc['username'] ?? '';
            if (isset($seen[$username])) {
                $this->warn("Duplicate username, skipping: $username");
                continue;
            }
            $seen[$username] = true;

            $oldId = $this->extractOid($doc['_id']);
            DB::table('users')->insert([
                'id' => $this->mapId($oldId),
                'username' => $username,
                'remember_token' => $doc['remember_token'] ?? null,
                'created_at' => $this->extractDate($doc['created_at'] ?? null),
                'updated_at' => $this->extractDate($doc['updated_at'] ?? null),
            ]);
        }
    }
}
