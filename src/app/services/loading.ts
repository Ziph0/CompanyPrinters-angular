import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Loading {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private startTime = 0;
  private minDuration = 500; 
  private hideTimeout: any;

  show() {
  
    this.startTime = Date.now();
    this.loadingSubject.next(true);

   
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  hide() {
    const elapsed = Date.now() - this.startTime;
    const remaining = this.minDuration - elapsed;

    if (remaining > 0) {
     
      this.hideTimeout = setTimeout(() => {
        this.loadingSubject.next(false);
        this.hideTimeout = null;
      }, remaining);
    } else {
      
      this.loadingSubject.next(false);
    }
  }
}