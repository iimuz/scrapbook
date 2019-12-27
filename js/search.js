var lunrIndex, $results, pagesIndex;

function initLunr() {
  $.getJSON("../index.json").done(function(index) {
    pagesIndex = index;
    lunrIndex = lunr(function() {
      var lunrConfig = this;
      lunrConfig.use(lunr.multiLanguage('en', 'jp'));
      lunrConfig.ref("href");
      lunrConfig.field("title", { boost: 10 });
      lunrConfig.field("contents");
      pagesIndex.forEach(function(page) {
        lunrConfig.add(page);
      });
    });
  })
  .fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.error("Error getting Hugo index flie:", err);
  });
}

function search(){
  $results = $("#results");
  $results.empty();
  var query = document.getElementById('search-query').value;
  if (query.length < 2) {
    return;
  }
  renderResults(results(query));
}

function results(query) {
  return lunrIndex.search(`*${query}*`).map(function(result) {
    return pagesIndex.filter(function(page) {
        return page.href === result.ref;
    })[0];
  });
}

function renderResults(results) {
  if (!results.length) {
    $results.append('<p>No matches found</p>');
    return;
  }

  results = results.sort((x, y) => x.date > y.date)
  results.forEach(function(result) {
    var $result = $("<li>", { class: "post_search_item" });

    var $excerpt = $("<div>", { class: "excerpt" });

    var $title = $("<a>", { href: result.href });
    $title.append($("<h3>", { class: "post_link", text: result.title }));
    $excerpt.append($title);

    $excerpt.append($("<p>", { text: result.date }));

    length = 100;
    if (length > result.contents.length) { length = result.contents.length; }
    $excerpt.append($("<p>", { text: result.contents.slice(0, length) + " ..." }));

    $result.append($excerpt);
    $results.append($result);
  });
}

initLunr();

