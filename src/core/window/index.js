import { observable } from 'mobx';
import { throttle } from 'lodash';
import * as Hammer from 'hammerjs';

import { pinchZoom, pinchZoomEnd, pan, panEnd } from '../../three/scene';

const PINCH_DELAY = 300;

class WindowManager {
  @observable width = window.innerWidth;
  @observable height = window.innerHeight;

  lastPinchTime = Date.now();

  constructor() {
    window.addEventListener('resize', this.resize);

    window.addEventListener('keydown', function(e) {
      if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    });

    const hammertime = new Hammer(document.querySelector('#root'), {
      touchAction: 'none',
      preventDefault: true,
    });
    hammertime.get('pinch').set({ enable: true });
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammertime.on('pinch', ev => {
      ev.preventDefault();
      pinchZoom(event.scale);
    });

    hammertime.on('pinchend', ev => {
      ev.preventDefault();
      pinchZoomEnd();
      this.lastPinchTime = Date.now();
    });

    hammertime.on('pan', ev => {
      if (Date.now() - this.lastPinchTime < PINCH_DELAY) {
        return;
      }

      ev.preventDefault();
      pan(ev.deltaX, ev.deltaY);
    });

    hammertime.on('panend', ev => {
      panEnd();
    });
  }

  resize = throttle(() => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }, 5);
}

export default new WindowManager();
