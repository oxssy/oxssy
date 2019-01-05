import React from 'react';
import enzyme, { configure } from 'enzyme';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import { Oxssy, OxssyMap, oxssify } from '../src';

configure({ adapter: new Adapter() });

describe('oxssify', () => {
  test('oxssify', () => {
    const test1 = new Oxssy(1);
    const test2 = new Oxssy(2);
    const test3 = new Oxssy(3);
    const grouped = new OxssyMap({
      2: test2,
      3: test3,
    });
    const testComponent = props => <p id="test">{
      (props[1] || 0) + (props[2] || 0) + (props[3] || 0)
    }</p>;
    const Connected = oxssify({
      1: test1,
      2: '2',
      3: '3',
    })(testComponent);
    const rendered1 = enzyme.mount(<Connected oxssy={grouped} />);
    expect(rendered1.text()).toBe('6');
    const rendered2 = enzyme.mount(<Connected />);
    expect(rendered2.text()).toBe('1');
  });

  test('oxssifying functional component that has a handler', () => {
    const testState = new Oxssy('test', true);
    const testComponent = props => <p id="test">{typeof props.oxssy.testState.handler}</p>;
    const Connected = oxssify({ testState: '' })(testComponent);
    const rendered = enzyme.mount(<Connected oxssy={testState} />);
    expect(rendered.text()).toBe('function');
  });

  const testComponent = props => <p id="test">{props.text1} {props.text2}</p>;

  test('setting props causes component to render', () => {
    const data1 = new Oxssy('Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = oxssify({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    const wrapper = enzyme.mount(<Connected oxssy={map1} text2="is beautiful" />);
    expect(wrapper.text()).toBe('Berkeley is beautiful');
    expect(Connected.prototype.render.callCount).toBe(1);
    wrapper.setProps({ text2: 'is cool' });
    expect(Connected.prototype.render.callCount).toBe(2);
    expect(wrapper.text()).toBe('Berkeley is cool');
  });

  test('setting oxssy causes component to resubscribe', () => {
    const data1 = new Oxssy('Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = oxssify({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    sinon.spy(Connected.prototype, 'subscribeData');
    sinon.spy(Connected.prototype, 'unsubscribeData');
    const wrapper = enzyme.mount(<Connected oxssy={map1} text2="is beautiful" />);
    expect(wrapper.text()).toBe('Berkeley is beautiful');
    expect(Connected.prototype.render.callCount).toBe(1);
    expect(Connected.prototype.subscribeData.callCount).toBe(1);
    expect(Connected.prototype.unsubscribeData.callCount).toBe(0);
    const data2 = new Oxssy('Richmond');
    const map2 = new OxssyMap({ california: data2 });
    wrapper.setProps({ oxssy: map2 });
    expect(Connected.prototype.render.callCount).toBe(2);
    expect(Connected.prototype.subscribeData.callCount).toBe(2);
    expect(Connected.prototype.unsubscribeData.callCount).toBe(1);
    expect(wrapper.text()).toBe('Richmond is beautiful');
  });

  test('data updates cause component to render', () => {
    const data1 = new Oxssy('Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = oxssify({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    const wrapper = enzyme.mount(<Connected oxssy={map1} text2="is beautiful" />);
    expect(wrapper.text()).toBe('Berkeley is beautiful');
    expect(Connected.prototype.render.callCount).toBe(1);
    return data1.update('Berkeley').then(() => {
      expect(Connected.prototype.render.callCount).toBe(1);
      expect(wrapper.text()).toBe('Berkeley is beautiful');
    }).then(() => data1.update('Richmond').then(() => {
      expect(Connected.prototype.render.callCount).toBe(2);
      expect(wrapper.text()).toBe('Richmond is beautiful');
    }));
  });

});
