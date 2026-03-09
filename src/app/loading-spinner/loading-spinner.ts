import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
    standalone: true,
  imports: [CommonModule
  ],
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.css'],
})
export class LoadingSpinner {
   @Input() size: number = 40;
  @Input() color: string = '#1e293b ';
  @Input() overlay: boolean = false;
  

}
