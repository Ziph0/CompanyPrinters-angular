import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface PrinterData {
  makeName: any;
  onUpdateSuccess: any;
  printerId?: number;
  printerName: string;
  makeID?: number;
  folderToMonitor: string;
  outputType: string;
  fileOutput: string;
  active: boolean;
  createdTimeStamp: Date;
   onAddSuccess?: () => void;   
}
export interface Printer {
  makeName: any;
  printerId?: number;
  printerName: string;
  makeID?: number;
  folderToMonitor: string;
  outputType: string;
  fileOutput: string;
  active: boolean;
  createdTimeStamp: Date;
  
}


export interface User{
  userId?: number;
  firstName: string;
  lastName: string;
  designationName: string;
  email: string;
  username :string;
  password?:string;
  designationId?: number;
}

export interface Designation{
  designationId:number;
  designationName:string;
}
export interface Makes{
  printerMakeId:number;
  printerMakeName:string;
}
@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://localhost:7221/api/Printer';

  constructor(private http: HttpClient) {}

 login(credentials: any) {
  
  const mockUser = { username: credentials.username, token: 'fake-jwt-token' };
  localStorage.setItem('user', JSON.stringify(mockUser)); 
  return of(mockUser); 
}

  getRole(): number {
    return Number(sessionStorage.getItem('designationId'));
  }

  hasRole(role: number): boolean {
    return this.getRole() === role;
  }

  logout() {
    sessionStorage.clear();
  }
getPrinters(): Observable<Printer[]> {
  return of([
    { 
      engenPrintersID: 1, 
      printerName: 'EP8P', 
      folderToMonitor: 'C:\\FTPArea\\formidable\\P00\\EP8P\\in', 
      outputType: 'File Output', 
      fileOutput: 'C:\\FTPArea\\formidable\\P00\\EP8P\\out', 
      active: true, // Changed from 1 to true
      printerMakeID: 1,
      makeName: 'Canon',
      createdTimeStamp: new Date()
    },
    { 
      engenPrintersID: 2, 
      printerName: 'BM2P', 
      folderToMonitor: '\\\\ctdzlp01\\formidable\\P00\\BM2P\\in', 
      outputType: 'FTP Output', 
      fileOutput: '\\\\ctdzlp01\\formidable\\P00\\BM2P\\out', 
      active: true, // Changed from 1 to true
      printerMakeID: 2, 
      makeName: 'Samsung',
      createdTimeStamp: new Date()
    },
    { 
      engenPrintersID: 3, 
      printerName: 'CT3A', 
      folderToMonitor: '\\\\ctdzlp01\\formidable\\P00\\CT3A\\in', 
      outputType: 'FTP Output', 
      fileOutput: '\\\\ctdzlp01\\formidable\\P00\\CT3A\\out', 
      active: true, 
      printerMakeID: 3,
      makeName: 'Epson',
      createdTimeStamp: new Date()
    }
  ]);
}

 getUsers(): Observable<User[]> {
  return of([
    { 
      userID: 1, 
      firstName: 'Sihle', 
      lastName: 'Mlaba', 
      designationID: 1, 
      designationName: 'Manager', 
      email: 'Mlaba@Printers.com', 
      username: 'SihleMlaba', 
      password: 'S!@Hle' 
    },
    { 
      userID: 2, 
      firstName: 'Sthe', 
      lastName: 'Ngiba', 
      designationID: 2, 
      designationName: 'System Administrator', 
      email: 'Ngiba@Printers.com', 
      username: 'Sthembiso',
      password: 'Sthe@Mbiso2' 
    },
    { 
      userID: 3, 
      firstName: 'Dumisani', 
      lastName: 'Juba', 
      designationID: 3, 
      designationName: 'Level 1 Employee', 
      email: 'Juba@Printers.com', 
      username: 'JubaDumi', 
      password: 'JubaDumi@23' 
    }
  ]);
}
getDesignations(options: unknown): Observable<Designation[]> {
  return of([
    { designationId: 1, designationName: 'Manager' },
    { designationId: 2, designationName: 'System Administrator' },
    { designationId: 3, designationName: 'Level 1 Employee' }
  ]);
}
 getMakes(options: { headers?: any } = {}): Observable<Makes[]> {
  return this.http.get<Makes[]>(`${this.apiUrl}/makes`, options);
}
 getPrintersFiltered(makeId?: number) {
    return this.getPrinters(); 
  }

  getUsersFiltered(designationId?: number): Observable<User[]> {
    return this.getUsers();
  }


 addPrinter(printer: Printer) {
    return this.http.post<{ success: boolean; message: string }>(this.apiUrl, printer);
  }

  updatePrinter(id: number, printer: Printer) {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, printer);
  }
deletePrinter(id: number) {
  return this.http.delete(`${this.apiUrl}/printer/${id}`, { responseType: 'text' });
}
updateUser(id: number, user: User) {
  return this.http.put(`${this.apiUrl}/users/${id}`, user, { responseType: 'text' });
}

addUser(user: User) {
  return this.http.post(`${this.apiUrl}/users`, user, { responseType: 'text' });
}

deleteUser(userId: number) {
    return this.http.delete(`${this.apiUrl}/user/${userId}`, { responseType: 'text' });
}



addDesignation(designation: Designation) {
  return this.http.post(`${this.apiUrl}/designation`, designation, { responseType: 'text' });
}

updateDesignation(designation: Designation) {
  return this.http.put(`${this.apiUrl}/designation/${designation.designationId}`, designation, { responseType: 'text' });
}

deleteDesignation(designationId: number) {
    return this.http.delete(`${this.apiUrl}/designation/${designationId}`, { responseType: 'text' });
}

getCurrentUser(): Observable<User> {
  const id = Number(sessionStorage.getItem('designationId'));

 
  if (!id) return of({ designationId: 0, designationName: '' } as User);

  return this.getDesignations({}).pipe(
    map(designations => {
      const match = designations.find(d => d.designationId === id);
      return {
        designationId: id,
        designationName: match ? match.designationName : 'Unknown'
      } as User;
    })
  );
}


}
