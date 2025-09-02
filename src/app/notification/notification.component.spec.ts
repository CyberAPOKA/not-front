import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from '../notification.service';
import { TranslateModule } from '@ngx-translate/core';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        NotificationComponent,
      ],
      providers: [NotificationService],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send notification and add it to the list', () => {
    component.message = 'Test message';
    component.send();

    const req = httpMock.expectOne('http://localhost:3000/api/notify');
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0].messageContent).toBe('Test message');
    expect(component.notifications[0].status).toBe('PENDING');
  });
});
