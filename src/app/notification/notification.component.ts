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
    MatInputModule,
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  message = '';
  notifications: Notification[] = [];
  intervalId: any;
  filterText = '';
  filterStatus = '';

  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.translate.addLangs(['en', 'pt', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      this.notifications = JSON.parse(saved);
    }

    this.intervalId = setInterval(() => this.updateStatuses(), 3000);
  }

  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
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
        this.notifications.push(newNotification);
        this.saveNotifications();
        this.message = '';
      });
  }

  updateStatuses(): void {
    this.notifications.forEach((n) => {
      if (n.status === 'PENDING' || n.status === 'PROCESSING') {
        this.notificationService.getStatus(n.messageId).subscribe((res) => {
          n.status = res.status;
          this.saveNotifications();
        });
      }
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  get filteredNotifications() {
    return this.notifications
      .filter((n) => {
        const matchText =
          !this.filterText ||
          n.messageContent
            .toLowerCase()
            .includes(this.filterText.toLowerCase());
        const matchStatus =
          !this.filterStatus || n.status === this.filterStatus;
        return matchText && matchStatus;
      })
      .slice()
      .reverse();
  }
}
