var FILTER_PANEL = document.querySelector('#filter-panel');
var FILTER_TEMPLATE = document.querySelector('#filter-template');

class DanUtils {
  /**
   * Thanks https://stackoverflow.com/users/633183/thank-you for this snippet
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

  /**
   * Thanks https://stackoverflow.com/users/21677/james for this snippet
   * https://stackoverflow.com/a/5158301
   */
  static getQueryStringParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
}

class Filter {
  constructor(name, expression) {
    if (!name) {
      throw "Avoid creating empty filters please";
    }

    if (name.indexOf(",") > -1) {
      throw "Don't create labels/filters with commas, it breaks multiple tags in post definitions and the query string :(";
    }

    this.id = "filter-" + DanUtils.generateId(8); 
    this.name = name;
    this.expression = expression;
    this.element = Filter.getNewFilterElement(this.id, this.name, this.expression);
    this.element.addEventListener('click', this.filterClickEvent);
    this.active = false;
  }

  // Activate and deactivate do not force re-renders
  // Allows more precise control to avoid flickering in some loops
  activate() {
    this.active = true;
    this.element.classList.add('filter-tag-active');
  }

  deactivate() {
    this.active = false;
    this.element.classList.remove('filter-tag-active');
  }

  // Toggle forces a re-render
  toggle() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
    FILTER_INTERFACE.renderPosts();
  }

  hide() {
    this.element.setAttribute('style','display: none');
  }

  show() {
    this.element.removeAttribute('style');
  }

  // Method wired into filters to handle clicks
  filterClickEvent(event) {
    const id = event.target.getAttribute('id');
    FILTER_INTERFACE.getFilter(id).toggle();
  }
  
  static getNewFilterElement(id, name, expression) {
    var newFilter = FILTER_TEMPLATE.cloneNode(true);
    newFilter.id = id;
    newFilter.textContent = name;
    newFilter.setAttribute('filter-value', expression);
    return newFilter;
  }
}

// TODO: Posts + postTags deserve a class, but I've been lazy and inconsistent for now.
class FilterInterface {
  constructor() {
    this.filters = [];
    this.postTags = document.getElementsByClassName('post-tag');
    this.posts = document.getElementsByClassName('post-item');
    this.resetButton = document.getElementById('filter-reset');
    this.wireElementEvents();
  }

  getFilter(id) {
    return this.filters.find(filter => filter.id == id);
  }

  getFilterByName(name) {
    return this.filters.find(filter => filter.name == name);
  }

  upsertFilter(name, expression) {
    // Avoid adding duplications - just return the existing one
    var existingFilter = this.filters.find(filter => filter.name == name);
    if (existingFilter) {
      return existingFilter;
    }

    // Special case where the first user-added filter should deactivate 'all'
    if (this.filters.length == 1 && this.getFilterByName('all')) {
      this.getFilterByName('all').deactivate();
    }

    // Default the expression to the lowercased name
    if (!expression) {
      expression = name.toLowerCase();
    }

    // Add the filter
    var newFilter = new Filter(name, expression);
    this.filters.push(newFilter);
    FILTER_PANEL.insertBefore(newFilter.element, FILTER_TEMPLATE);
    return newFilter;
  }

  renderPosts() {
    // it was inconvenient to have to use Array.filter in this statement :D
    var activeFilters = this.filters.filter(filter => filter.active == true);

    // kind of wishing we had our virtual DOM at this point...
    // this loop gets a well-deserved rewrite when we add a class to handle post/tag behaviour
    for (const post of this.posts) {
      var hidden = true; 
      var tags = post.getElementsByClassName('post-tag');
      for (const tag of tags) {
        var tagName = tag.innerHTML.toLowerCase();
        var matchedFilters = activeFilters.filter(filter => tagName.match(filter.expression));
        if (matchedFilters && matchedFilters.length > 0) {
          hidden = false;
          // Don't highlight every tag if 'all' filter is active
          if (matchedFilters.length > 1 || matchedFilters[0].name != 'all') {  
            tag.classList.add('post-tag-active');
          } else {
            tag.classList.remove('post-tag-active');
          }
        } else {
          tag.classList.remove('post-tag-active');
        }
      }

      if (hidden) {
        post.setAttribute('style','display:none');
      } else {
        post.removeAttribute('style');
      }
    }
  }

  wireElementEvents() {
    for (const postTag of this.postTags) {
      postTag.addEventListener('click', this.postTagClickEvent);
    }
    this.resetButton.addEventListener('click', this.resetFiltersClickEvent);
  }

  // Method wired into to post tags to handle clicks
  postTagClickEvent(event) {
    const filter = FILTER_INTERFACE.upsertFilter(event.target.innerHTML);
    filter.show();
    filter.toggle();
  }

  resetFiltersClickEvent() {
    FILTER_INTERFACE.filters.forEach(function(filter) {
      if (filter.name == 'all') {
        filter.activate();
      } else {
        filter.deactivate();
        filter.hide();
      }
    });
    FILTER_INTERFACE.renderPosts();
  }
}

class PageState {
  constructor() {
    var qs_filterNames = DanUtils.getQueryStringParameterByName('filters');
    if (qs_filterNames) {
      this.filterNames = qs_filterNames.split(',');
    }
    this.initState();
  }

  initState() {
    // Add the 'all' filter
    var ALL_FILTER = FILTER_INTERFACE.upsertFilter('all', '.*');
    ALL_FILTER.show();
    ALL_FILTER.toggle();

    // Activate any other filters that have been requested from querystring
    // This will apply the usual logic to auto-deactivate 'all' when first activiating a custom filter
    if (this.filterNames) {
      for (const filterName of this.filterNames) {
        var newFilter = FILTER_INTERFACE.upsertFilter(filterName);
        newFilter.show();
        newFilter.toggle();
      }
    }
  }
}

/* Set up the filters */
var FILTER_INTERFACE = new FilterInterface();

/* Initialise the page string */
var PAGE_STATE = new PageState();