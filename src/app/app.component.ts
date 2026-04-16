import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { CommonService } from './services/common.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  commonService = inject(CommonService);
}
