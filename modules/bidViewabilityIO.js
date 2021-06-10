
import * as events from '../src/events.js';
import { EVENTS } from '../src/constants.json';

const DEBUG = true;
const IAB_VIEWABLE_TIME = 1000;
const IAB_VIEWABLE_THRESHOLD = 0.5
let SUPPORTS_IO = false;

if (window.IntersectionObserver && window.IntersectionObserverEntry && window.IntersectionObserverEntry.prototype &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
  SUPPORTS_IO = true;
}
// options for the iO that fires when the ad is viewed.  This one has no root margin, and a threshold of 1,
// because we only want it to fire when the entire ad placement has come into view.  This might actually be too
// aggressive, because ads that are obscured, possibly by the edge of a browser if you're too narrow or something
// will never have this fire.
let viewableOptions = {
  root: null,
  rootMargin: '0px',
  threshold: IAB_VIEWABLE_THRESHOLD
};

// markViewed returns a function what will be executed when a display ad has met the
// IAB definition of viewable
let markViewed = (bid, entry, observer) => {
  return () => {
    observer.unobserve(entry.target);
    events.emit(EVENTS.BID_VIEWABLE, bid);
    entry.target.style.outline = 'green solid 5px';
    DEBUG && console.log(entry.target.getAttribute('id') + ' was viewed');// eslint-disable-line no-console
  }
}

// viewCallbackFactory creates the callback used by the viewable IntersectionObserver.
// when an ad comes into view, it sets a timeout for a function to be executed
// when that ad would be considered viewed per the IAB specs. the bid that was rendered
// is passed into the factory, so it can pass it into markViewed, so that it can be included
// in the BID_VIEWABLE event data
let viewCallbackFactory = (bid) => {
  return (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        DEBUG && console.log('start watching view time');// eslint-disable-line no-console
        entry.target.style.outline = 'yellow solid 5px';
        entry.target.view_tracker = setTimeout(markViewed(bid, entry, observer), IAB_VIEWABLE_TIME);
      } else {
        DEBUG && console.log(entry.target.getAttribute('id') + ' is not viewable');// eslint-disable-line no-console
        if (entry.target.view_tracker) {
          clearTimeout(entry.target.view_tracker);
        }
      }
    });
  };
};

export let init = () => {
  events.on(EVENTS.AD_RENDER_SUCCEEDED, ({doc, bid, id}) => {
    console.log('oh hi there'); // eslint-disable-line no-console
    console.log(bid); // eslint-disable-line no-console

    if (SUPPORTS_IO) {
      let viewable = new IntersectionObserver(viewCallbackFactory(bid), viewableOptions);
      let element = document.getElementById(bid.adUnitCode);
      viewable.observe(element);
      element.style.outline = 'red solid 5px';
    }
  });
}

init()
