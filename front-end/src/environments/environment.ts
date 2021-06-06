// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  timezone: 'America/Los_Angeles',
  backendURL: 'http://192.168.0.142:8000/',
  autoRefresh: 3000,
  demoMode: true,
  demoVideoURL: 'http://localhost:8080/demo.mp4',
  demo: {
    parking: {
      offSets: [6, 18, 24, 36],
      licenses: ['MCLABS3', 'MCLABS4'],
      where: 'Parking Lot #1',
      durations: [12, 9]
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
