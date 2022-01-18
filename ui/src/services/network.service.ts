import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private apiUrl: string = `${environment.apiProtocol}://${environment.apiDomainName}:${environment.apiPort}${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  getPing(): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.apiUrl}/ping`);
  }

  getPacketLossLast24Hours(): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.apiUrl}/ping/packetloss`);
  }

}
