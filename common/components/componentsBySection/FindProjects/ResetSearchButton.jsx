// @flow
import type {FluxReduceStore} from 'flux/utils';
import {List} from 'immutable'
import {Container} from 'flux/utils';
import ProjectSearchStore from '../../stores/ProjectSearchStore.js';
import ProjectSearchDispatcher from '../../stores/ProjectSearchDispatcher.js';
import React from 'react';
import _ from 'lodash';

type State = {|
  keyword: string,
  tags: List<TagDefinition>,
  sortField: string,
  location: string
|};

class ResetSearchButton extends React.Component<{||}, State> {

  static getStores(): $ReadOnlyArray<FluxReduceStore> {
    return [ProjectSearchStore];
  }

  static calculateState(prevState: State): State {
    return {
      keyword: ProjectSearchStore.getKeyword() || '',
      tags: ProjectSearchStore.getTags() || [],
      sortField: ProjectSearchStore.getSortField() || '',
      location: ProjectSearchStore.getLocation() || ''
    };
  }

  render(): React$Node {
    return (
      <React.Fragment>
        <button
          className="btn btn-primary btn-block reset-search-button"
          disabled={!(this.state.keyword || this.state.tags.size > 0 || this.state.sortField || !_.isEmpty(this.state.location)) }
          onClick={this._clearFilters.bind(this)}>
          Clear Filters
        </button>
      </React.Fragment>
    );
  }
  _clearFilters(): void {
    ProjectSearchDispatcher.dispatch({
      type: 'CLEAR_FILTERS',
    });
  }
}

export default Container.create(ResetSearchButton);
