import { Component, createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Receiver } from './EmitterReceiver';
import find from './find';
import { shallowEqual, mapEval } from './util';

export default function receive(oxssyPaths, isPure = true) {
  return function hoc(WrappedComponent) {
    class Connected extends Receiver(Component) {
      constructor(props) {
        super(props);
        this.oxssyPaths = oxssyPaths;
        this.oxssyMap = {};
        this.handler = {};
        this.clearCache();
        this.subscribeData();
        this.cacheDataProps();
      }

      clearCache() {
        this.renderedElement = null;
        this.cachedDataProps = {};
        this.haveSubscriptionsChanged = true;
        this.haveDataPropsChanged = true;
      }

      subscribeData() {
        if (!this.props.oxssy || !this.oxssyPaths) {
          return;
        }
        Object.entries(this.oxssyPaths).forEach(([key, path]) => {
          const data = find(this.props.oxssy, path);
          this.oxssyMap[key] = data;
          this.subscribeTo(data);
          if (data.handler) {
            this.handler[key] = data.handler;
          }
        });
        this.haveSubscriptionsChanged = false;
      }

      unsubscribeData() {
        Object.entries(this.oxssyMap).forEach(([key, data]) => {
          this.unsubscribeTo(data);
          if (data.resetOnUnsubscribe) {
            data.reset();
          }
          delete this.oxssyMap[key];
          delete this.handler[key];
        });
      }

      cacheDataProps() {
        const nextDataProps = mapEval(this.oxssyMap);
        this.haveDataPropsChanged = this.haveDataPropsChanged
          || !shallowEqual(nextDataProps, this.cachedDataProps);
        if (this.haveDataPropsChanged) {
          this.cachedDataProps = nextDataProps;
        }
      }

      shouldReceiveMessage() {
        return true;
      }

      onReceive() {
        this.cacheDataProps();
        if (this.haveDataPropsChanged) {
          this.forceUpdate();
        }
      }

      shouldComponentUpdate(nextProps) {
        const haveOwnPropsChanged = !shallowEqual(this.props, nextProps);
        if (haveOwnPropsChanged) {
          if (this.props.oxssy !== nextProps.oxssy) {
            this.haveSubscriptionsChanged = true;
          }
        }
        return !isPure || haveOwnPropsChanged || this.haveDataPropsChanged;
      }

      componentWillUnmount() {
        this.unsubscribeData();
        this.clearCache();
      }

      render() {
        if (this.haveSubscriptionsChanged) {
          this.unsubscribeData();
          this.subscribeData();
          this.cacheDataProps();
        }
        this.renderedElement = createElement(
          WrappedComponent,
          { ...this.props, ...this.cachedDataProps, oxssyHandler: this.handler },
        );
        this.haveDataPropsChanged = false;
        return this.renderedElement;
      }
    }
    Connected.displayName = `Connected(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return hoistNonReactStatics(Connected, WrappedComponent);
  };
}
