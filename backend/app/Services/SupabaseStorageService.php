<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class SupabaseStorageService
{
    private string $url;
    private string $serviceRoleKey;
    private string $bucket;
    private string $prefix;

    public function __construct()
    {
        $config = config('services.supabase', []);

        $this->url = rtrim((string) ($config['url'] ?? ''), '/');
        $this->serviceRoleKey = (string) ($config['service_role_key'] ?? '');
        $this->bucket = (string) ($config['storage_bucket'] ?? 'quiz-images');
        $this->prefix = trim((string) ($config['storage_prefix'] ?? ''), '/');
    }

    public function enabled(): bool
    {
        return $this->url !== '' && $this->serviceRoleKey !== '' && $this->bucket !== '';
    }

    public function uploadUploadedFile(UploadedFile $file): string
    {
        if (!$this->enabled()) {
            throw new RuntimeException('Supabase Storage is not configured.');
        }

        $extension = strtolower((string) ($file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'bin'));
        $filename = Str::random(40).'.'.$extension;
        $objectPath = $this->buildObjectPath($filename);

        $endpoint = $this->storageObjectEndpoint($objectPath);

        $response = Http::withHeaders($this->authHeaders([
            'x-upsert' => 'true',
            'content-type' => $file->getMimeType() ?: 'application/octet-stream',
        ]))
            ->withBody($file->get(), $file->getMimeType() ?: 'application/octet-stream')
            ->post($endpoint);

        if (!$response->successful()) {
            throw new RuntimeException(
                'Supabase upload failed: HTTP '.$response->status().' '.$response->body()
            );
        }

        return $this->publicUrlForObject($objectPath);
    }

    public function deleteByPublicUrl(string $publicUrl): void
    {
        if (!$this->enabled() || !$this->isManagedPublicUrl($publicUrl)) {
            return;
        }

        $objectPath = $this->extractObjectPathFromPublicUrl($publicUrl);
        if (!$objectPath) {
            return;
        }

        $endpoint = $this->storageObjectEndpoint($objectPath);

        $response = Http::withHeaders($this->authHeaders())
            ->delete($endpoint);

        // 404 means already deleted; ignore.
        if ($response->status() === 404 || $response->successful()) {
            return;
        }

        throw new RuntimeException(
            'Supabase delete failed: HTTP '.$response->status().' '.$response->body()
        );
    }

    public function isManagedPublicUrl(?string $publicUrl): bool
    {
        if (!$this->enabled() || !$publicUrl) {
            return false;
        }

        return str_starts_with($publicUrl, $this->publicBasePrefix());
    }

    private function storageObjectEndpoint(string $objectPath): string
    {
        return $this->url.'/storage/v1/object/'.$this->bucket.'/'.$this->encodeObjectPath($objectPath);
    }

    private function publicUrlForObject(string $objectPath): string
    {
        return $this->publicBasePrefix().$this->encodeObjectPath($objectPath);
    }

    private function publicBasePrefix(): string
    {
        return $this->url.'/storage/v1/object/public/'.$this->bucket.'/';
    }

    private function extractObjectPathFromPublicUrl(string $publicUrl): ?string
    {
        if (!$this->isManagedPublicUrl($publicUrl)) {
            return null;
        }

        $encodedPath = substr($publicUrl, strlen($this->publicBasePrefix()));
        if ($encodedPath === false || $encodedPath === '') {
            return null;
        }

        $segments = explode('/', $encodedPath);
        $decoded = array_map(static fn (string $segment): string => rawurldecode($segment), $segments);

        return implode('/', $decoded);
    }

    private function buildObjectPath(string $filename): string
    {
        return $this->prefix !== '' ? $this->prefix.'/'.$filename : $filename;
    }

    private function encodeObjectPath(string $objectPath): string
    {
        $segments = explode('/', trim($objectPath, '/'));
        $encoded = array_map(static fn (string $segment): string => rawurlencode($segment), $segments);

        return implode('/', $encoded);
    }

    private function authHeaders(array $extra = []): array
    {
        return array_merge([
            'authorization' => 'Bearer '.$this->serviceRoleKey,
            'apikey' => $this->serviceRoleKey,
        ], $extra);
    }
}
