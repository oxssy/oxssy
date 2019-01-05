import { Component, createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Observer } from './Observer';
import find from './find';
import OxssyMap from './OxssyMap';
import { shallowEqual } from './util';

export default function oxssify(oxssyPaths, isPure = true) {
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
        if (!this.oxssyPaths) {
          return;
        }
        const oxssyMap = {};
        Object.entries(this.oxssyPaths).forEach(([key, path]) => {
          const found = find(this.props.oxssy, path);
          if (found && found.isOxssy) {
            oxssyMap[key] = found;
          }
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
          if (this.props.oxssy !== nextProps.oxssy) {
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
            oxssy: {...this.oxssyMap.oxssyCollection},
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
