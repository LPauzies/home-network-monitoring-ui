import { Component, HostListener, OnInit } from '@angular/core';
import { map, Subscription, throwIfEmpty, timer } from 'rxjs';
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
  viewCurveWidth: number;
  viewCurveHeight: number;
  viewGridHeight: number;

  // Subscription
  timerSubscription: Subscription;

  // Represents the map of eventtime mapped to ping
  events: any[] = [];
  // options of the curve
  viewCurve: any;
  curveTitle: string = `${this.title} (last 24 hours)`;
  legendPosition: any = LegendPosition.Below;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Latency (ms)';

  // Represents the highest ping value the last 24 hours
  lastPingValues: any[] = [];

  // Represents the sum of packetloss the last 24 hours
  packetLossValues: any[] = [];
  // options of the bar
  barTitle: string = `Packet loss (last 24 hours)`;

  // Common color scheme for every charts
  colorScheme = {
    domain: ['#6BBA5C', '#E38531', '#91C0D7', '#A56BC4', '#DEB887', '#FFA07A', '#FFD700', '#B5ACE5']
  };

  constructor(private network: NetworkService) {
    this.viewCurveWidth = window.innerWidth * 0.96;
    this.viewCurveHeight = window.innerHeight * 0.5;
    this.viewCurve = [this.viewCurveWidth, this.viewCurveHeight];

    this.viewGridHeight = window.innerHeight * 0.30;

    // Initialize subscriptor
    this.timerSubscription = timer(0, 5000).pipe(
      map(
        () => {
          this.network.getPing().subscribe(
            response => {
              if (this.events.length == 0 && this.lastPingValues.length == 0) {
                response.forEach(element => {
                  this.events.push({
                    "name": `${element.DomainName} (${element.IP})`,
                    "series": [{ "value": element.ResponseTime, "name": this.convertTimestampToDate(element.EventTime) }]
                  });
                  this.lastPingValues.push({
                    "name": `${element.DomainName} (${element.IP})`,
                    "value": element.ResponseTime
                  });
                })
              } else {
                response.forEach(element => {
                  let index = this.events.findIndex(e => e.name == `${element.DomainName} (${element.IP})`);
                  this.events[index].series.push(
                    { "value": element.ResponseTime, "name": this.convertTimestampToDate(element.EventTime) }
                  );
                  this.lastPingValues[index].value = element.ResponseTime;
                });
              }
              // Make the clean if needed
              this.removeMoreThan24HoursOfData();

              // Update is triggered only when this.lastPingValues is reassigned and not updated in place
              this.lastPingValues = [...this.lastPingValues];
              // Update is triggered only when this.events is reassigned and not updated in place
              this.events = [...this.events];
            }
          );
          this.network.getPacketLossLast24Hours().subscribe(
            response => {
              if (this.packetLossValues.length == 0) {
                response.forEach(element => {
                  this.packetLossValues.push({
                    "name": `${element.DomainName}`,
                    "value": element.PacketLoss
                  });
                })
              } else {
                response.forEach(element => {
                  let index = this.packetLossValues.findIndex(e => e.name == `${element.DomainName}`);
                  this.packetLossValues[index].value = element.PacketLoss;
                });
              }
              // Update is triggered only when this.packetLossValues is reassigned and not updated in place
              this.packetLossValues = [...this.packetLossValues];
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

  // This method is available to be triggered on screen resize to allow best responsiveness
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.viewCurveWidth = event.target.innerWidth * 0.96;
    this.viewCurveHeight = event.target.innerHeight * 0.50;
    this.viewCurve = [this.viewCurveWidth, this.viewCurveHeight];

    this.viewGridHeight = event.target.innerHeight * 0.30;
  }

  convertTimestampToDate(timestamp: number): string {
    let date = new Date(timestamp * 1000);
    let hours = (date.getHours() < 10) ? `0${date.getHours()}` : date.getHours().toString();
    let minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes().toString();
    let seconds = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : date.getSeconds().toString();
    return `${hours}:${minutes}:${seconds}`;
  }

  cardFormatter(data: any): string {
    // If response time is > 2s then it means the ping is KO
    if (data.value >= 2000) return "KO";
    return `${data.value} ms`;
  };
}
