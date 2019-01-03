import React from 'react';
import enzyme, { configure } from 'enzyme';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import { Oxssy, OxssyMap, datatype, errorCode, receive } from '../src';

configure({ adapter: new Adapter() });

describe('receive', () => {
  test('connecting to functional component that has a handler', () => {
    const testState = new Oxssy(datatype.string.isRequired, 'test', true);
    const testComponent = props => <p id="test">{typeof props.handler.testState}</p>;

    const Connected = receive({ testState: '' })(testComponent);
    const rendered = enzyme.mount(<Connected receiveFrom={testState} />);
    expect(rendered.text()).toBe('function');
  });

  const testComponent = props => <p id="test">{props.text1} {props.text2}</p>;

  test('setting props causes component to render', () => {
    const data1 = new Oxssy(datatype.string.isRequired, 'Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = receive({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    const wrapper = enzyme.mount(<Connected receiveFrom={map1} text2="is beautiful" />);
    expect(wrapper.text()).toBe('Berkeley is beautiful');
    expect(Connected.prototype.render.callCount).toBe(1);
    wrapper.setProps({ text2: 'is cool' });
    expect(Connected.prototype.render.callCount).toBe(2);
    expect(wrapper.text()).toBe('Berkeley is cool');
  });

  test('setting receiveFrom causes component to resubscribe', () => {
    const data1 = new Oxssy(datatype.string.isRequired, 'Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = receive({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    sinon.spy(Connected.prototype, 'subscribeData');
    sinon.spy(Connected.prototype, 'unsubscribeData');
    const wrapper = enzyme.mount(<Connected receiveFrom={map1} text2="is beautiful" />);
    expect(wrapper.text()).toBe('Berkeley is beautiful');
    expect(Connected.prototype.render.callCount).toBe(1);
    expect(Connected.prototype.subscribeData.callCount).toBe(1);
    expect(Connected.prototype.unsubscribeData.callCount).toBe(0);
    const data2 = new Oxssy(datatype.string.isRequired, 'Richmond');
    const map2 = new OxssyMap({ california: data2 });
    wrapper.setProps({ receiveFrom: map2 });
    expect(Connected.prototype.render.callCount).toBe(2);
    expect(Connected.prototype.subscribeData.callCount).toBe(2);
    expect(Connected.prototype.unsubscribeData.callCount).toBe(1);
    expect(wrapper.text()).toBe('Richmond is beautiful');
  });

  test('data updates cause component to render', () => {
    const data1 = new Oxssy(datatype.string.isRequired, 'Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = receive({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    const wrapper = enzyme.mount(<Connected receiveFrom={map1} text2="is beautiful" />);
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

  test('validation causes component to render', () => {
    const data1 = new Oxssy(datatype.string.isRequired.withOption({ notContainsUpperCase: true }), 'Berkeley');
    const map1 = new OxssyMap({ california: data1 });
    const Connected = receive({ text1: '.california' })(testComponent);
    sinon.spy(Connected.prototype, 'render');
    const wrapper = enzyme.mount(<Connected receiveFrom={map1} text2="is beautiful" />);
    expect(wrapper.text()).toBe('Berkeley is beautiful');
    expect(data1.validation).toBeNull();
    expect(Connected.prototype.render.callCount).toBe(1);
    return map1.validate().then(() => {
      expect(data1.validation).toBe(errorCode.CHECK_UPPERCASE);
      expect(Connected.prototype.render.callCount).toBe(2);
      expect(wrapper.text()).toBe('Berkeley is beautiful');
    }).then(() => map1.unsetValidationError().then(() => {
      expect(data1.validation).toBeNull();
      expect(Connected.prototype.render.callCount).toBe(3);
      expect(wrapper.text()).toBe('Berkeley is beautiful');
    }));
  });
});
