import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly API_URL: string;
  private readonly API_KEY: string;
  private readonly SYSTEM_PROMPT = `You are a helpful financial assistant for the University Accounting System (UAS). Your role is to help students, staff, and administrators understand and navigate the system effectively.

Your responsibilities include:
- Answering questions about how the University Accounting System works
- Explaining student fees, invoices, and payment processes
- Providing guidance on budget management concepts
- Helping with payroll-related questions
- Assisting with navigation (e.g., "Where do I find my invoice?", "How do I update my profile?")
- Providing general financial and accounting guidance
- Explaining system features and functionality

Key system features you should know about:
- Student Fees Management: Students can view their fees, invoices, and payment history. They can make payments and track their payment status.
- Staff Payroll: Administrators can manage employee salaries, allowances, and deductions with automated payroll reports.
- Department Budget: Track departmental income and expenses with interactive charts and visualizations.
- Dashboard: Overview of financial metrics, payment progress, and revenue trends.
- Profile Management: Users can update their profile information and preferences.

Always be helpful, clear, and concise. If you don't know something specific about the system, guide users to the appropriate section or suggest they contact support.`;

  constructor(private http: HttpClient) {
    // Determine which API to use based on environment configuration
    if (environment.chatApiProvider === 'together') {
      this.API_URL = environment.togetherApiUrl;
      this.API_KEY = environment.togetherApiKey;
    } else {
      this.API_URL = environment.openaiApiUrl;
      this.API_KEY = environment.openaiApiKey;
    }
  }

  /**
   * Get fallback response when API is not configured
   */
  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Handle greetings and casual conversation
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy)$/i) || 
        lowerMessage.match(/^(hi|hello|hey)\s+there$/i) ||
        lowerMessage.match(/^how\s+are\s+you/i)) {
      return 'Hello! 👋 I\'m your AI financial assistant for the University Accounting System. I\'m here to help you with questions about student fees, invoices, payments, budgets, payroll, and system navigation. How can I assist you today?';
    }
    
    if (lowerMessage.match(/^(thanks|thank you|thx|appreciate it)/i)) {
      return 'You\'re welcome! If you have any other questions about the University Accounting System, feel free to ask. I\'m here to help!';
    }
    
    if (lowerMessage.match(/^(bye|goodbye|see you|farewell)/i)) {
      return 'Goodbye! Feel free to come back anytime if you need help with the University Accounting System. Have a great day!';
    }
    
    if (lowerMessage.match(/^(what can you do|what do you do|help|what help|capabilities)/i)) {
      return `I can help you with many things related to the University Accounting System:

📄 **Student Fees & Invoices**: Find invoices, view payment history, understand fee statuses
💳 **Payments**: Guide you through making payments, understanding payment methods
📊 **Budget Management**: Explain budget tracking, department budgets, and financial reports
👥 **Payroll**: Help with payroll questions (for administrators)
🧭 **Navigation**: Show you where to find features and how to navigate the system
⚙️ **Profile & Settings**: Help update your profile and account settings
📈 **Dashboard**: Explain charts, statistics, and financial overviews

Just ask me anything about these topics, and I'll provide detailed guidance!`;
    }
    
    // Detailed invoice questions
    if (lowerMessage.includes('invoice') || lowerMessage.includes('bill') || 
        lowerMessage.includes('find invoice') || lowerMessage.includes('where invoice') ||
        lowerMessage.includes('view invoice') || lowerMessage.includes('see invoice')) {
      return `To find your invoices, follow these steps:

1. **Navigate to Student Fees**:
   - Click on "Student Fees" in the left sidebar menu, OR
   - Go to Dashboard → Click "Student Fees" in the Quick Actions section

2. **View Your Invoices**:
   - Once in the Student Fees section, you'll see a table listing all your invoices
   - Each invoice shows: ID, Student Name, Description, Amount, Due Date, Status, and Actions

3. **Invoice Status**:
   - 🟢 **Paid** (green badge): Invoice has been paid
   - 🟡 **Pending** (yellow badge): Payment is due but not yet paid
   - 🔴 **Overdue** (red badge): Payment is past the due date

4. **Actions Available**:
   - For pending invoices, you can click "Mark Paid" to update the payment status
   - You can also create new invoices using the "+ Create Invoice" button at the top

The Student Fees page also includes helpful charts showing payment trends and status distribution. Is there anything specific about invoices you'd like to know more about?`;
    }
    
    // Detailed payment questions
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || 
        lowerMessage.includes('make payment') || lowerMessage.includes('how to pay') ||
        lowerMessage.includes('pay invoice') || lowerMessage.includes('pay fee')) {
      return `Here's how to make payments in the system:

**Method 1: From Student Fees Page**
1. Go to Dashboard → Student Fees (or click "Student Fees" in the sidebar)
2. Find the invoice you want to pay in the table
3. If the status is "Pending" or "Overdue", click the "Mark Paid" button
4. The system will update the payment status and record the payment date

**Method 2: From Dashboard**
1. On the main Dashboard, you'll see payment progress charts
2. Click on "Student Fees" in the Quick Actions section
3. Follow the same steps as Method 1

**Payment Features**:
- ✅ Automatic status updates when you mark a payment as paid
- 📊 Real-time charts showing payment progress and trends
- 📅 Payment history tracking with timestamps
- 🔔 Automatic overdue detection for past-due invoices

**Note**: In this frontend-only version, payments are marked manually. In a full system, you would integrate with payment gateways for actual transactions.

Would you like help with anything else related to payments?`;
    }
    
    // Detailed fee questions
    if (lowerMessage.includes('fee') || lowerMessage.includes('fees') ||
        lowerMessage.includes('student fee') || lowerMessage.includes('tuition')) {
      return `Student fees are managed in the **Student Fees** section. Here's what you can do:

**Viewing Fees**:
- Navigate to Dashboard → Student Fees
- You'll see a comprehensive table with all your fees
- Information displayed: Fee ID, Student Name, Description, Amount, Due Date, Status

**Fee Statuses**:
- **Paid**: Fee has been successfully paid (green badge)
- **Pending**: Fee is due but payment hasn't been made yet (yellow badge)
- **Overdue**: Fee's due date has passed without payment (red badge) - automatically detected

**Creating New Fees** (for administrators):
- Click the "+ Create Invoice" button at the top
- Fill in: Student ID, Student Name, Description, Amount, and Due Date
- The system automatically sets status to "Pending" or "Overdue" based on the due date

**Charts & Analytics**:
- Payment Status Distribution: Pie chart showing paid/pending/overdue breakdown
- Payment Trends: Line chart showing fee amounts over the last 12 months

**Automatic Features**:
- Fees with past due dates are automatically marked as "Overdue"
- Charts update in real-time when fees are added or status changes

Need help with anything specific about fees?`;
    }
    
    // Detailed budget questions
    if (lowerMessage.includes('budget') || lowerMessage.includes('department budget') ||
        lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
      return `The **Department Budget** section provides comprehensive budget management tools:

**Access**: Dashboard → Department Budget (in the sidebar menu)

**Key Features**:

1. **Summary Cards**:
   - Total Budget: Shows the allocated budget for the fiscal year
   - Total Spent: Amount already spent with percentage of budget used
   - Remaining Balance: How much budget is left
   - Variance: Shows if you're under or over budget

2. **Interactive Charts**:
   - **Budget vs. Actual Spending**: Bar chart comparing budgeted vs. actual spending by category
   - **Budget Allocation**: Doughnut chart showing how budget is distributed across categories
   - Categories include: Salaries, Supplies, Utilities, Travel, and Other

3. **Transaction Management**:
   - Add new transactions (income or expenses)
   - Track transactions by category and date
   - View transaction history in a detailed table

4. **Budget Categories**:
   - Each category shows: Allocated amount, Spent amount, Remaining balance, and Percentage used
   - Visual progress bars for each category

**To Add a Transaction**:
1. Click "+ Add Transaction" button
2. Enter: Description, Category, Amount, Type (Income/Expense), and Date
3. The budget and charts will automatically update

The budget section helps you track departmental finances with visual analytics and detailed reporting. Would you like to know more about any specific budget feature?`;
    }
    
    // Detailed payroll questions
    if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') ||
        lowerMessage.includes('employee pay') || lowerMessage.includes('staff pay')) {
      return `The **Staff Payroll** section manages employee compensation:

**Access**: Dashboard → Staff Payroll (in the sidebar menu)

**Features**:

1. **Summary Statistics**:
   - Total Payroll Cost: Sum of all employee payments
   - Employees Paid: Number of employees in the payroll
   - Next Pay Date: When the next payroll will be processed

2. **Payroll Table**:
   - Employee ID, Name, Department
   - Gross Pay: Total earnings before deductions
   - Deductions: Taxes, benefits, etc. (shown in red)
   - Net Pay: Final amount after deductions (shown in bold)

3. **Payroll Management**:
   - Create new payroll entries
   - View current payroll and payroll history
   - Generate payroll reports
   - Filter employees by department or name

**Creating Payroll**:
1. Click "+ Run New Payroll" button
2. Enter employee details: ID, Name, Department
3. Set: Gross Pay, Allowances, Deductions
4. System automatically calculates Net Pay = Gross Pay + Allowances - Deductions

**Note**: This section is typically accessible to administrators and accounting staff.

The payroll system helps manage employee compensation efficiently with automated calculations and reporting. Need help with anything else?`;
    }
    
    // Detailed profile questions
    if (lowerMessage.includes('profile') || lowerMessage.includes('update profile') ||
        lowerMessage.includes('edit profile') || lowerMessage.includes('change profile') ||
        lowerMessage.includes('account settings') || lowerMessage.includes('my account')) {
      return `To update your profile:

**Access**: Dashboard → Profile (in the sidebar menu)

**What You Can Update**:
- **Personal Information**: Username, Full Name, Email Address
- **Profile Picture**: Upload or change your profile photo
- **Payment Information**: Credit card details (optional, for future payment processing)
- **Preferences**:
  - Theme: Light/Dark mode
  - Notifications: Email notification preferences
  - Language: System language selection

**Steps to Update**:
1. Navigate to Dashboard → Profile
2. The form will be pre-filled with your current information
3. Make your changes
4. Click "Save Changes" button
5. You'll see a success message confirming the update

**Profile Features**:
- All changes are saved immediately
- Your profile information is used throughout the system
- Preferences affect how the system displays information to you

The profile section lets you customize your account and system experience. Is there a specific profile setting you'd like help with?`;
    }
    
    // Dashboard questions
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('main page') ||
        lowerMessage.includes('home page') || lowerMessage.includes('overview')) {
      return `The **Dashboard** is your main control center for the University Accounting System:

**Access**: Click "Dashboard" in the sidebar menu (usually the first item)

**What You'll See**:

1. **Welcome Section**: Personalized greeting with your name

2. **Statistics Cards**:
   - Total Fees: Number of fees/invoices
   - Pending Payments: Fees awaiting payment
   - Total Amount: Sum of all fees
   - Total Invoices: Count of all invoices
   - Pending Invoices: Invoices not yet paid

3. **Interactive Charts**:
   - **Payment Progress**: Doughnut chart showing paid vs. remaining amounts
   - **Revenue Trends**: Line chart showing revenue over the last 12 months
   - **Fee Status Distribution**: Pie chart showing paid/pending/overdue breakdown

4. **Quick Actions**:
   - Student Fees: Jump directly to fee management
   - Staff Payroll: Access payroll features
   - Department Budget: View budget management
   - Profile: Update your account settings

**Dashboard Features**:
- Real-time updates when data changes
- Visual analytics with interactive charts
- Quick navigation to all major sections
- Comprehensive financial overview at a glance

The dashboard provides a complete overview of your financial status and quick access to all system features. What would you like to explore?`;
    }
    
    // Navigation questions
    if (lowerMessage.includes('navigate') || lowerMessage.includes('where') ||
        lowerMessage.includes('how to') || lowerMessage.includes('how do i') ||
        lowerMessage.includes('menu') || lowerMessage.includes('sidebar')) {
      return `Here's how to navigate the University Accounting System:

**Main Navigation - Sidebar Menu** (left side):
- 📊 **Dashboard**: Main overview page with charts and statistics
- 📄 **Student Fees**: View and manage invoices, fees, and payments
- 👥 **Staff Payroll**: Employee payroll management (admin/accounting)
- 💰 **Department Budget**: Budget tracking and financial planning
- 👤 **Profile**: Update your account information and preferences

**Top Header**:
- Search bar: Search for transactions, reports, and information
- Notifications: Bell icon for alerts
- User profile: Access your account

**Quick Navigation Tips**:
1. **From Dashboard**: Use the Quick Actions cards to jump to any section
2. **From Sidebar**: Click any menu item to navigate directly
3. **Breadcrumbs**: Some pages show your current location
4. **Back Button**: Use browser back button or click Dashboard to return home

**Key Pages**:
- **Home**: Landing page with system overview (accessible via URL: /home)
- **Dashboard**: Main financial dashboard (/dashboard)
- **Login/Signup**: Authentication pages (currently frontend-only, no actual auth)

All navigation is intuitive and consistent throughout the system. Which section would you like to explore?`;
    }
    
    // Overdue questions
    if (lowerMessage.includes('overdue') || lowerMessage.includes('late') ||
        lowerMessage.includes('delayed') || lowerMessage.includes('past due')) {
      return `**Overdue Fees** are automatically detected and managed:

**How It Works**:
- When you create an invoice with a due date in the past, it's automatically marked as "Overdue"
- Existing "Pending" fees are automatically checked when you load the Student Fees page
- If a fee's due date has passed, its status changes from "Pending" to "Overdue"

**Identifying Overdue Fees**:
- Look for the red "Overdue" badge in the Status column
- Overdue fees appear in the payment status charts (red section)
- The system highlights overdue amounts in financial summaries

**What to Do**:
1. Go to Student Fees section
2. Find fees with red "Overdue" status
3. Click "Mark Paid" once payment is received
4. The status will update and charts will refresh automatically

**Important Notes**:
- Overdue fees are tracked in real-time
- Charts automatically update to show overdue amounts
- Payment trends chart includes an "Overdue" line showing overdue amounts over time

The system helps you stay on top of overdue payments with automatic detection and visual indicators. Need help with anything else?`;
    }
    
    // General help
    if (lowerMessage.match(/^(help|what|how|can you|tell me)/i)) {
      return `I'm here to help! I can assist you with:

**System Navigation**:
- Finding specific pages and features
- Understanding the menu structure
- Quick access to different sections

**Financial Management**:
- Student fees and invoices
- Payment processes and tracking
- Budget management and reporting
- Payroll information (for admins)

**Account Management**:
- Updating your profile
- Changing preferences
- Account settings

**General Questions**:
- How the system works
- Feature explanations
- Best practices

Just ask me anything! For example:
- "Where can I find my invoices?"
- "How do I make a payment?"
- "Explain the budget section"
- "How do I update my profile?"

What would you like to know?`;
    }
    
    // Default response - more helpful
    return `I'm your AI financial assistant for the University Accounting System! I can help you with:

📄 **Invoices & Fees**: Finding invoices, understanding payment status, managing fees
💳 **Payments**: Making payments, payment history, payment methods
📊 **Budgets**: Department budgets, spending tracking, financial reports
👥 **Payroll**: Employee payments and payroll management
🧭 **Navigation**: Finding features, understanding the system layout
⚙️ **Profile**: Updating account information and settings

**To get full AI-powered responses**, you can configure an API key:
1. Get an API key from OpenAI (https://platform.openai.com/api-keys) or Together AI (https://api.together.xyz/)
2. Open src/environments/environment.ts file
3. Replace YOUR_OPENAI_API_KEY_HERE with your actual API key
4. Restart the development server

**In the meantime**, I can still help with specific questions! Try asking:
- "Where can I find my invoices?"
- "How do I make a payment?"
- "Explain the budget section"
- "How do I update my profile?"

What would you like to know about the University Accounting System?`;
  }

  /**
   * Send a message to the chatbot API
   * @param userMessage The user's message
   * @param conversationHistory Previous messages in the conversation
   * @returns Observable with the assistant's response
   */
  sendMessage(userMessage: string, conversationHistory: ChatMessage[] = []): Observable<ChatResponse> {
    // Check if API key is configured
    if (!this.API_KEY || this.API_KEY.includes('YOUR_') || this.API_KEY === '') {
      // Return fallback response instead of error
      const fallbackResponse = this.getFallbackResponse(userMessage);
      return new Observable(observer => {
        // Simulate API delay for better UX
        setTimeout(() => {
          observer.next({ message: fallbackResponse });
          observer.complete();
        }, 500);
      });
    }

    // Build the messages array with system prompt and conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: this.SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Prepare the request body based on API provider
    const requestBody = this.prepareRequestBody(messages);

    // Set up headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.API_KEY}`
    });

    // Make the API call
    return this.http.post<any>(this.API_URL, requestBody, { headers }).pipe(
      map(response => {
        // Extract the response message based on API provider
        const message = this.extractMessage(response);
        return { message };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Chatbot API Error:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Prepare request body based on API provider
   */
  private prepareRequestBody(messages: ChatMessage[]): any {
    if (environment.chatApiProvider === 'together') {
      // Together AI request format
      return {
        model: 'meta-llama/Llama-3-70b-chat-hf', // You can change this model
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 1000,
        temperature: 0.7
      };
    } else {
      // OpenAI request format
      return {
        model: 'gpt-3.5-turbo', // You can use 'gpt-4' for better responses
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 1000,
        temperature: 0.7
      };
    }
  }

  /**
   * Extract message from API response based on provider
   */
  private extractMessage(response: any): string {
    if (environment.chatApiProvider === 'together') {
      return response.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t process your request.';
    } else {
      // OpenAI format
      return response.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t process your request.';
    }
  }

  /**
   * Handle API errors gracefully
   */
  private handleError(error: HttpErrorResponse): Error {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'API key is invalid. Please check your API key configuration.';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.error?.message || `Error ${error.status}: ${error.message}`;
      }
    }

    return new Error(errorMessage);
  }

  /**
   * Convert chat history to API message format
   */
  convertToApiMessages(messages: Array<{ text: string; sender: 'user' | 'bot' }>): ChatMessage[] {
    return messages
      .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
  }
}

