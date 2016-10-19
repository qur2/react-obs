import React from 'react';
import ReactDOM from 'react-dom';
import Rx from '@reactivex/rxjs'
import observe from './observe';
import { shallow } from 'enzyme';

const Dumper = ({ value }) => <p>{value}</p>
const mapEmitToProps = ({ value }) => ({ value });
const LiftedDumper = observe(mapEmitToProps)(Dumper);

it('passes down observable values as props', () => {
  var obs$ = Rx.Observable.never().startWith({ value: 7 });

  const lifted = shallow(<LiftedDumper observable={obs$} />);
  expect(lifted.contains(<Dumper value={7}/>)).toEqual(true);
});

it('updates subscription when the observable is replaced', () => {
  var obs$ = Rx.Observable.never().startWith({ value: 7 });
  var obs2$ = Rx.Observable.never().startWith({ value: 8 });

  const lifted = shallow(<LiftedDumper observable={obs$} />);
  lifted.setProps({ observable: obs2$ });
  expect(lifted.contains(<Dumper value={8}/>)).toEqual(true);
});

it('unsubscribes from subscription when the component is unmounted', () => {
  var obs$ = Rx.Observable.never().startWith({ value: 7 });

  const lifted = shallow(<LiftedDumper observable={obs$} />);
  const inst = lifted.instance();
  // could use some spy from sinonjs
  let clean = false;
  inst.subscription = { unsubscribe: () => clean = true };
  lifted.unmount();
  expect(clean).toEqual(true);
});
