<?php

namespace App\Services;

use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class BrevoEmailService
{
    /**
     * Send email via Brevo API using HTTP
     */
    private function sendViaHttpApi($to, $subject, $html, $fromEmail, $fromName): bool
    {
        $apiKey = env('BREVO_API_KEY');
        if (!$apiKey) {
            Log::warning('Brevo API key is not configured.');
            return false;
        }

        try {
            $httpClient = Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ]);
            
            // On Windows, SSL verification might fail - disable for development
            if (PHP_OS_FAMILY === 'Windows') {
                $httpClient = $httpClient->withoutVerifying();
            }
            
            $payload = [
                'sender' => [
                    'name' => $fromName,
                    'email' => $fromEmail,
                ],
                'to' => [
                    [
                        'email' => $to,
                    ]
                ],
                'subject' => $subject,
                'htmlContent' => $html,
            ];

            // Log the request for debugging (without sensitive data)
            Log::info('Sending email via Brevo API', [
                'to' => $to,
                'from' => $fromEmail,
                'subject' => $subject,
            ]);

            $response = $httpClient->post('https://api.brevo.com/v3/smtp/email', $payload);

            // Log full response for debugging
            Log::info('Brevo API Response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Newsletter welcome email sent successfully via Brevo API', [
                    'email' => $to,
                    'message_id' => $data['messageId'] ?? $data['id'] ?? null,
                ]);
                return true;
            } else {
                $errorBody = $response->body();
                $errorData = $response->json();
                Log::error('Failed to send email via Brevo API', [
                    'email' => $to,
                    'status' => $response->status(),
                    'response' => $errorBody,
                    'error_message' => $errorData['message'] ?? $errorData['error'] ?? 'Unknown error',
                ]);
                return false;
            }
        } catch (\Throwable $e) {
            Log::error('Exception sending email via Brevo HTTP API: ' . $e->getMessage(), [
                'email' => $to,
            ]);
            return false;
        }
    }

    /**
     * Send newsletter subscription welcome email
     */
    public function sendNewsletterWelcome($user): bool
    {
        try {
            // Render the Blade template to HTML
            $html = View::make('emails.newsletter-subscription', [
                'userName' => $user->name,
                'userEmail' => $user->email,
            ])->render();

            $fromEmail = env('MAIL_FROM_ADDRESS', 'noreply@uas.edu');
            $fromName = env('MAIL_FROM_NAME', 'University Accounting System');

            return $this->sendViaHttpApi(
                $user->email,
                'Welcome to Our Newsletter!',
                $html,
                $fromEmail,
                $fromName
            );
        } catch (\Throwable $e) {
            Log::error('Failed to send newsletter subscription email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}

