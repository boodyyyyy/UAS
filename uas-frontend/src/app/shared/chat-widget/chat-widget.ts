import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget {
  isOpen = false;
  messages: Message[] = [];
  inputMessage = '';
  isLoading = false;

  constructor(private chatService: ChatService) {
    // Add welcome message
    this.messages.push({
      text: 'Hello! I\'m your AI assistant. How can I help you with the University Accounting System?',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    // Play sound effect
    this.playSound('click');
  }

  sendMessage() {
    if (!this.inputMessage.trim() || this.isLoading) return;

    const userMessage: Message = {
      text: this.inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    const messageText = this.inputMessage;
    this.inputMessage = '';
    this.isLoading = true;

    this.chatService.sendMessage(messageText).subscribe({
      next: (response) => {
        const botMessage: Message = {
          text: response.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request.',
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        this.isLoading = false;
        this.playSound('notification');
      },
      error: () => {
        const errorMessage: Message = {
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
      }
    });
  }

  playSound(type: 'click' | 'notification') {
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
  }
}
