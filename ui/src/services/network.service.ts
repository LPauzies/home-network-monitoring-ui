import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export class Ping {
  EventTime!: number;
  IP!: string;
  DomainName!: string;
  IPDescription!: string;
  ResponseTime!: number;
  PacketLoss!: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private apiUrl: string = `${environment.apiProtocol}://${environment.apiDomainName}:${environment.apiPort}${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  getPingWithIp(ip : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ping/${ip}?callback=?`);
  }

  getPing(): Observable<Array<Ping>> {
    return this.http.get<Array<Ping>>(`${this.apiUrl}/ping`);
  }

}
