import { observable } from 'mobx';
import { throttle } from 'lodash';

class WindowManager {
  @observable width = window.innerWidth;
  @observable height = window.innerHeight;

  constructor() {
    window.addEventListener('resize', this.resize);

    window.addEventListener('keydown', function(e) {
      if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    });

    document.ontouchmove = e => e.preventDefault();
  }

  resize = throttle(() => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }, 5);
}

export default new WindowManager();
