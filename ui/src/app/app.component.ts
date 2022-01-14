import { Component, HostListener, OnInit } from '@angular/core';
import { map, Subscription, timer } from 'rxjs';
import { NetworkService } from 'src/services/network.service';
import { LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  static MAX_EVENTS = 17280;

  title: string = 'Home network dashboard';

  // View size
  viewWidth: number;
  viewHeight: number;

  // Subscription
  timerSubscription: Subscription;

  // Represents the map of eventtime mapped to ping
  events: any[] = [];
  // options of the curve
  view: any;
  legend: boolean = true;
  legendPosition: any = LegendPosition.Below;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Latency';
  yScaleMin: number = 0;
  showGridLines: boolean = false;
  timeline: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  constructor(private network: NetworkService) {
    this.viewWidth = window.innerWidth * 0.95;
    this.viewHeight = window.innerHeight * 0.60;
    this.view = [this.viewWidth, this.viewHeight];

    // Initialize subscriptor
    this.timerSubscription = timer(0, 5000).pipe(
      map(
        () => {
          this.network.getPing().subscribe(
            response => {
              if (this.events.length == 0) {
                response.forEach(element => {
                  this.events.push({
                    "name": `${element.DomainName} (${element.IP})`,
                    "series": [{ "value": element.ResponseTime, "name": element.EventTime.toString() }]
                  });
                })
              } else {
                response.forEach(element => {
                  let index = this.events.findIndex(e => e.name == `${element.DomainName} (${element.IP})`);
                  this.events[index].series.push(
                    { "value": element.ResponseTime, "name": element.EventTime.toString() }
                  );
                });
              }
              // Make the clean if needed
              this.removeMoreThan24HoursOfData();

              // Update is triggered only when this.events is reassigned and not updated in place
              this.events = [...this.events];
            }
          );
        }
      )
    ).subscribe();
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }

  removeMoreThan24HoursOfData(): void {
    for (const event of this.events) {
      if (event.series.length < AppComponent.MAX_EVENTS) continue;
      // Clean the last entry
      event.series.shift();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewWidth = event.target.innerWidth * 0.90;
    this.viewHeight = event.target.innerHeight * 0.80;
    this.view = [this.viewWidth, this.viewHeight];
  }

  // Curve behaviour
  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  convertTimestampToDate(timestamp: number): any {

  }
}
