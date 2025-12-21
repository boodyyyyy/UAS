<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Newsletter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin: 20px 0;
        }
        .content p {
            margin: 15px 0;
            font-size: 16px;
        }
        .highlight {
            background-color: #f0f4ff;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Welcome to Our Newsletter!</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $userName }},</p>
            
            <p>Thank you for subscribing to our newsletter! We're excited to have you on board.</p>
            
            <div class="highlight">
                <p><strong>What to expect:</strong></p>
                <ul>
                    <li>📊 Latest updates on financial management features</li>
                    <li>💡 Tips and best practices for managing your account</li>
                    <li>🔔 Important announcements and system updates</li>
                    <li>📈 Insights and reports on your financial activities</li>
                </ul>
            </div>
            
            <p>You'll receive regular updates delivered directly to <strong>{{ $userEmail }}</strong>.</p>
            
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>
            <strong>University Accounting System Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© {{ date('Y') }} University Accounting System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

