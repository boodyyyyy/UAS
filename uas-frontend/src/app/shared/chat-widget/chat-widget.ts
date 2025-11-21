import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';
import { StorageService } from '../../services/storage.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'uas_chat_history';

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  isOpen = false;
  messages: Message[] = [];
  inputMessage = '';
  isLoading = false;
  private shouldScrollToBottom = false;

  constructor(
    private chatbotService: ChatbotService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    // Load chat history from localStorage
    this.loadChatHistory();
    
    // If no history exists, add welcome message
    if (this.messages.length === 0) {
      this.messages.push({
        text: 'Hello! I\'m your AI financial assistant for the University Accounting System. I can help you with questions about student fees, invoices, payments, budgets, payroll, and system navigation. How can I assist you today?',
        sender: 'bot',
        timestamp: new Date()
      });
      this.saveChatHistory();
    }
  }

  ngAfterViewChecked() {
    // Auto-scroll to bottom when new messages are added
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.playSound('click');
    
    // Scroll to bottom when opening chat
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    if (!this.inputMessage.trim() || this.isLoading) return;

    const userMessage: Message = {
      text: this.inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    this.messages.push(userMessage);
    const messageText = this.inputMessage.trim();
    this.inputMessage = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;
    
    // Save user message immediately
    this.saveChatHistory();

    // Convert messages to API format (excluding the current user message for history)
    const conversationHistory = this.chatbotService.convertToApiMessages(
      this.messages.slice(0, -1) // Exclude the just-added user message
    );

    // Send message to chatbot service
    this.chatbotService.sendMessage(messageText, conversationHistory).subscribe({
      next: (response) => {
        const botMessage: Message = {
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.saveChatHistory();
        this.playSound('notification');
      },
      error: (error: Error) => {
        let errorText = 'Sorry, I encountered an error. Please try again.';
        
        // Provide more helpful error messages
        if (error.message.includes('API key')) {
          errorText = 'The AI assistant requires an API key to be configured. Please check CHATBOT_SETUP.md for instructions on how to set up your API key. In the meantime, I can still help with basic questions about the system!';
        } else if (error.message.includes('Rate limit')) {
          errorText = 'The API rate limit has been exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('401') || error.message.includes('invalid')) {
          errorText = 'The API key appears to be invalid. Please check your API key configuration in environment.ts and ensure it\'s correct.';
        } else {
          errorText = error.message || 'Sorry, I encountered an error. Please try again later.';
        }
        
        const errorMessage: Message = {
          text: errorText,
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.saveChatHistory();
        this.playSound('notification');
      }
    });
  }

  /**
   * Load chat history from localStorage
   */
  private loadChatHistory() {
    try {
      const savedMessages = this.storageService.getLocalStorage<Message[]>(CHAT_HISTORY_KEY);
      if (savedMessages && Array.isArray(savedMessages)) {
        // Convert timestamp strings back to Date objects
        this.messages = savedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.messages = [];
    }
  }

  /**
   * Save chat history to localStorage
   */
  private saveChatHistory() {
    try {
      // Keep only last 50 messages to avoid localStorage size limits
      const messagesToSave = this.messages.slice(-50);
      this.storageService.setLocalStorage(CHAT_HISTORY_KEY, messagesToSave);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Clear chat history
   */
  clearHistory() {
    this.messages = [{
      text: 'Hello! I\'m your AI financial assistant for the University Accounting System. I can help you with questions about student fees, invoices, payments, budgets, payroll, and system navigation. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }];
    this.storageService.removeLocalStorage(CHAT_HISTORY_KEY);
    this.saveChatHistory();
  }

  /**
   * Scroll chat messages to bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  playSound(type: 'click' | 'notification') {
    try {
      // Simple audio feedback using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'click') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } else {
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
      }
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug('Audio feedback not available');
    }
  }
}
