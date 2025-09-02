import { Component, OnInit, OnDestroy } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from '../notification.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { io, Socket } from 'socket.io-client';

interface Notification {
  messageId: string;
  messageContent: string;
  status: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatInputModule
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  message = '';
  notifications: Notification[] = [];
  filterText = '';
  filterStatus = '';
  socket!: Socket;

  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.translate.addLangs(['en', 'pt', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  currentLang = 'en';
  ngOnInit(): void {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      this.notifications = JSON.parse(saved);
    }

    const savedFilterText = localStorage.getItem('filterText');
    if (savedFilterText) this.filterText = savedFilterText;

    const savedFilterStatus = localStorage.getItem('filterStatus');
    if (savedFilterStatus) this.filterStatus = savedFilterStatus;

    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
      this.translate.use(savedLang);
    } else {
      this.translate.use(this.currentLang);
    }

    this.socket = io('http://localhost:3000');
    this.socket.on(
      'statusUpdate',
      (data: { messageId: string; status: string }) => {
        const notif = this.notifications.find(
          (n) => n.messageId === data.messageId
        );
        if (notif) {
          notif.status = data.status;
          localStorage.setItem(
            'notifications',
            JSON.stringify(this.notifications)
          );
        }
      }
    );
  }

  onFilterChange() {
    localStorage.setItem('filterText', this.filterText);
    localStorage.setItem('filterStatus', this.filterStatus);
  }

  ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  send(): void {
    if (!this.message.trim()) return;

    const id = uuidv4();
    const newNotification: Notification = {
      messageId: id,
      messageContent: this.message,
      status: 'PENDING',
    };

    this.notificationService
      .sendNotification(id, this.message)
      .subscribe(() => {
        this.notifications.unshift(newNotification);
        localStorage.setItem(
          'notifications',
          JSON.stringify(this.notifications)
        );
        this.message = '';
      });
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  get filteredNotifications() {
    return this.notifications.filter((n) => {
      const matchText =
        !this.filterText ||
        n.messageContent.toLowerCase().includes(this.filterText.toLowerCase());
      const matchStatus = !this.filterStatus || n.status === this.filterStatus;
      return matchText && matchStatus;
    });
  }
}
