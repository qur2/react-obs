import { Observable } from '@reactivex/rxjs'

export default Observable
  .interval(1500 /* ms */)
  .timeInterval()
  .startWith({ value: -1 })
  .map(({ value, ...more }) => ({ value: value + 1, ...more}));
