var FILTER_PANEL = document.querySelector('#filter-panel');
var FILTER_TEMPLATE = document.querySelector('#filter-template');

class DanUtils {
  /**
   * Thanks 'https://stackoverflow.com/users/633183/thank-you' for this snippet
   * https://stackoverflow.com/a/27747377
   */
  static dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2);
  }

  // generateId :: Integer -> String
  static generateId(len) {
    var arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, DanUtils.dec2hex).join('');
  }
}

class Filter {
  constructor(name, expression) {
    this.id = "filter-" + DanUtils.generateId(8); 
    this.name = name;
    this.expression = expression;
    this.element = Filter.getNewFilterElement(this.id, this.name, this.expression);
  }

  activate() {
    this.element.classList.add('filter-tag-active');
  }

  deactivate() {
    this.element.classList.remove('filter-tag-active');
  }

  remove() {
    this.element.remove();
  }

  hide() {
    this.element.setAttribute('style','display: none');
  }

  show() {
    this.element.removeAttribute('style');
  }
  
  static getNewFilterElement(id, name, expression) {
    var newFilter = FILTER_TEMPLATE.cloneNode(true);
    newFilter.id = id;
    newFilter.textContent = name;
    newFilter.setAttribute('filter-value', expression);
    return newFilter;
  }
}

class FilterInterface {
  constructor() {
    this.filters = [];
    this.wirePostTagClickEvents();
  }

  addNewFilter(name, expression) {
    var newFilter = new Filter(name, expression);
    this.filters.push(newFilter);
    FILTER_PANEL.insertBefore(newFilter.element, FILTER_TEMPLATE);
    return newFilter;
  }

  wirePostTagClickEvents() {
    var postTags = document.getElementsByClassName("post-tag");
    for (const postTag of postTags) {
      postTag.addEventListener('click', this.postTagClickEvent);
    }
  }

  // Method wired into to post tags to handle clicks
  postTagClickEvent(event) {
    console.log(event.target);
    console.log(event.target.innerHTML);
    const filter = FILTER_INTERFACE.addNewFilter(event.target.innerHTML, event.target.innerHTML);
    filter.show();
    filter.activate();
  }
}

var FILTER_INTERFACE = new FilterInterface();
var ALL_FILTER = FILTER_INTERFACE.addNewFilter('all', '.*');
ALL_FILTER.show();
ALL_FILTER.activate();