// @flow

import React from 'react'
import {Container} from 'flux/utils';
import type {TagDefinition} from '../../../utils/ProjectAPIUtils.js';
import LocationAutocomplete from "../../../common/location/LocationAutocomplete.jsx";
import type {LocationInfo} from "../../../common/location/LocationInfo";
import LocationSearchSection from "./LocationSearchSection.jsx";
import ProjectAPIUtils from '../../../utils/ProjectAPIUtils.js';
import ProjectSearchStore from "../../../stores/ProjectSearchStore.js";
import ProjectSearchDispatcher from "../../../stores/ProjectSearchDispatcher.js";
import RenderFilterCategory from "./RenderFilterCategory.jsx";
import metrics from "../../../utils/metrics";
import _ from 'lodash'

/**
 * @category: Tag category to pull from
 * @title: Title of the dropdown
 */
type Props = {|
  title: string
|};

type State = {|
  tags: ?$ReadOnlyArray<TagDefinition>,
  filterCounts: ?{ [key: string]: number },
  selectedTags: ?{ [key: string]: boolean },
|};

class ProjectFilterDataContainer extends React.Component<Props, State> {
  constructor(props: Props): void {
    super(props);
    this.state = {
      tags: null,
      selectedTags: null,
      filterCounts: null
    };

    // passing true to fetchTagsByCategory asks backend to return num_times in API response
    ProjectAPIUtils.fetchAllTags(true, tags => {
      //Need to do some work before setting state: Remove empty tags, generate cat/subcat totals, cleanup, then set state.
      //Remove tags from API with num_times=0 before doing anything else
      let filteredTags = tags.filter(function(key) {
          return key.num_times > 0;
        })
      //Generate category and subcategory totals - this is number of FILTERS and not total number of PROJECTS
      //So this may be used for "Select All" checkbox reference but will not be used for display of counts in DOM
      let subcatCount = _.countBy(filteredTags, 'subcategory' );
      let catCount = _.countBy(filteredTags, 'category');
      let countMergeResult = _.merge(catCount, subcatCount)
      //remove unneeded count of empty category/subcategory entries
      delete countMergeResult['']
      //Group tags by category before generating child components
      let sorted = _.groupBy(filteredTags, 'category');

      //last, set state with our computed data
      this.setState({
        tags: filteredTags,
        filterCounts: countMergeResult,
        sortedTags: sorted
      });
    });
    this._checkEnabled = this._checkEnabled.bind(this);
    this._selectOption = this._selectOption.bind(this);
  }

  static getStores(): $ReadOnlyArray<FluxReduceStore> {
    return [ProjectSearchStore];
  }

  static calculateState(prevState: State): State {
    return {
      selectedTags:_.mapKeys(ProjectSearchStore.getTags().toArray(), (tag: TagDefinition) => tag.tag_name)
    };
  }

  render(): React$Node {
    //should render a number of <RenderFilterCategory> child components

    return (
      <div>
        { this.state.sortedTags ? this._renderFilterCategories() : null }
        <LocationSearchSection/>
      </div>
    );
  }

  _renderFilterCategories(): void {
    //iterate through this.state.sortedTags into key/value pairs, one per component
    //first get category names in an array to iterate over


    //define the order we want our filters to be in (these must match database "category" values to be valid)
    const fixedOrderCategories = ["Issue(s) Addressed", "Role", "Technologies Used", "Project Stage", "Organization"]
    //get all the filters from API results so we display every filter category
    const apiCategories = Object.keys(this.state.sortedTags)
    //sort filters first by fixed order if applicable, then any others in alphabetical order
    //TODO: Extract this sort into another function for readability
    const orderedFilters = apiCategories.map(function(x) {
      var n = fixedOrderCategories.indexOf(x);
      return [n < 0 ? fixedOrderCategories.length : n, x]
    }).sort(function(a, b) {
      return (a[0] - b[0]) || (a[1] > b[1] ? 1 : a[1] == b[1] ? 0 : -1);
    }).map(function(x) {
        return x[1]
        // schwartzian transform from https://stackoverflow.com/questions/17420773
    })

    //generate child components in sorted order
      const displayFilters = orderedFilters.map(key =>
            <RenderFilterCategory
              key={key}
              categoryCount={_.sumBy(this.state.sortedTags[key], 'num_times')} //for displaying "category total" numbers
              category={key}
              data={_.sortBy(this.state.sortedTags[key], (tag) => tag.display_name.toUpperCase())}
              hasSubcategories={_.every(this.state.sortedTags[key], 'subcategory')}
              checkEnabled={this._checkEnabled}
              selectOption={this._selectOption}
            />
          );
        return (
            <div className="ProjectFilterDataContainer-root">
                {displayFilters}
            </div>
        )
    }

    _checkEnabled(tag: TagDefinition): boolean {
      return !!this.state.selectedTags[tag.tag_name];
    }

    _selectOption(tag: TagDefinition): void {
      var tagInState = _.has(this.state.selectedTags, tag.tag_name);
      //if tag is NOT currently in state, add it, otherwise remove
      if(!tagInState) {
        ProjectSearchDispatcher.dispatch({
          type: 'ADD_TAG',
          tag: tag.tag_name,
        });
        metrics.logSearchFilterByTagEvent(tag);
      } else {
        ProjectSearchDispatcher.dispatch({
          type: 'REMOVE_TAG',
          tag: tag,
        });
      }


  }
}


export default Container.create(ProjectFilterDataContainer);
