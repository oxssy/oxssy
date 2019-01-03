import { Component, createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Observer } from './Observer';
import find from './find';
import OxssyMap from './OxssyMap';
import { shallowEqual } from './util';


export default function receive(oxssyPaths, isPure = true) {
  return function hoc(WrappedComponent) {
    class Connected extends Observer(Component) {
      constructor(props) {
        super(props);
        this.oxssyPaths = oxssyPaths;
        this.oxssyMap = null;
        this.clearCache();
        this.subscribeData();
      }

      clearCache() {
        this.renderedElement = null;
        this.cachedDataProps = {};
        this.haveSubscriptionsChanged = true;
      }

      subscribeData() {
        if (!this.props.receiveFrom || !this.oxssyPaths) {
          return;
        }
        const oxssyMap = {};
        Object.entries(this.oxssyPaths).forEach(([key, path]) => {
          oxssyMap[key] = find(this.props.receiveFrom, path);
        });
        this.oxssyMap = new OxssyMap(oxssyMap);
        this.oxssyMap.onObserve(this);
        this.haveSubscriptionsChanged = false;
      }

      unsubscribeData() {
        this.oxssyMap.offObserve(this);
        this.oxssyMap.destroy();
      }

      onNotified() {
        this.forceUpdate();
      }

      shouldComponentUpdate(nextProps) {
        const haveOwnPropsChanged = !shallowEqual(this.props, nextProps);
        if (haveOwnPropsChanged) {
          if (this.props.receiveFrom !== nextProps.receiveFrom) {
            this.haveSubscriptionsChanged = true;
          }
        }
        return !isPure || haveOwnPropsChanged;
      }

      componentWillUnmount() {
        this.unsubscribeData();
        this.clearCache();
      }

      render() {
        if (this.haveSubscriptionsChanged) {
          this.unsubscribeData();
          this.subscribeData();
        }
        this.renderedElement = createElement(
          WrappedComponent,
          {
            ...this.props,
            ...this.oxssyMap.value,
            handler: this.oxssyMap.handler,
            validation: this.oxssyMap.validation,
          },
        );
        return this.renderedElement;
      }
    }
    Connected.displayName =
      `Connected(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return hoistNonReactStatics(Connected, WrappedComponent);
  };
}
