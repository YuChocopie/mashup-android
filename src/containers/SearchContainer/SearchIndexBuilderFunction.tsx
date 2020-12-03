import * as JsSearch from "js-search"
/**
 * rebuilds the overall index based on the options
 */
export const rebuildIndex = (searchData: any) => {
  const dataToSearch = new JsSearch.Search("title")
  /**
   *  defines a indexing strategy for the data
   * more more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
   */
  dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()
  /**
   * defines the sanitizer for the search
   * to prevent some of the words from being excluded
   *
   */
  dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer()
  /**
   * defines the search index
   * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
   */
  dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex("title")

  dataToSearch.addIndex("title") // sets the index attribute for the data
  dataToSearch.addIndex("description") // sets the index attribute for the data
  dataToSearch.addIndex("tags") // sets the index attribute for the data

  dataToSearch.addDocuments(searchData) // adds the data to be searched
  return dataToSearch
}
