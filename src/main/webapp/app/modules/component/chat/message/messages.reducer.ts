import axios from 'axios';
import {
  ICrudDeleteAction,
  ICrudGetAction,
  ICrudGetAllAction,
  ICrudPutAction,
  ICrudSearchAction,
  loadMoreDataWhenScrolled,
  parseHeaderForLinks,
} from 'react-jhipster';

import {cleanEntity} from 'app/shared/util/entity-utils';
import {FAILURE, REQUEST, SUCCESS} from 'app/shared/reducers/action-type.util';

import {defaultValue, IMessageGroup} from 'app/shared/model/message-group.model';
import {IMessageContent} from "app/shared/model/message-content.model";

export const ACTION_TYPES = {
  SEARCH_MESSAGEGROUPS: 'messageGroup/SEARCH_MESSAGEGROUPS',
  FETCH_MESSAGEGROUP_LIST: 'messageGroup/FETCH_MESSAGEGROUP_LIST',
  FETCH_MESSAGEGROUP: 'messageGroup/FETCH_MESSAGEGROUP',
  CREATE_MESSAGEGROUP: 'messageGroup/CREATE_MESSAGEGROUP',
  UPDATE_MESSAGEGROUP: 'messageGroup/UPDATE_MESSAGEGROUP',
  PARTIAL_UPDATE_MESSAGEGROUP: 'messageGroup/PARTIAL_UPDATE_MESSAGEGROUP',
  DELETE_MESSAGEGROUP: 'messageGroup/DELETE_MESSAGEGROUP',
  SET_BLOB: 'messageGroup/SET_BLOB',
  RESET: 'messageGroup/RESET',
  FETCH_ALL_GROUPS_JOINED_LIST: 'messages/FETCH_ALL_GROUPS_JOINED_LIST',
  FETCH_CONTENT_IN_GROUP_LIST: 'messages/FETCH_CONTENT_IN_GROUP_LIST'
};

const initialState = {
  loading: false,
  errorMessage: null,
  messageGroupList: [] as ReadonlyArray<IMessageGroup>,
  messageContentList: [] as ReadonlyArray<IMessageContent>,
  entity: defaultValue,
  links: {next: 0},
  updating: false,
  totalItems: 0,
  updateSuccess: false,
  groupIdCurrent: null,
};

export type MessageComponentState = Readonly<typeof initialState>;

// Reducer

export default (state: MessageComponentState = initialState, action): MessageComponentState =>
{
  switch (action.type)
  {
    case REQUEST(ACTION_TYPES.SEARCH_MESSAGEGROUPS):
    case REQUEST(ACTION_TYPES.FETCH_ALL_GROUPS_JOINED_LIST):
    case REQUEST(ACTION_TYPES.FETCH_CONTENT_IN_GROUP_LIST):
    case REQUEST(ACTION_TYPES.FETCH_MESSAGEGROUP_LIST):
    case REQUEST(ACTION_TYPES.FETCH_MESSAGEGROUP):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_MESSAGEGROUP):
    case REQUEST(ACTION_TYPES.UPDATE_MESSAGEGROUP):
    case REQUEST(ACTION_TYPES.DELETE_MESSAGEGROUP):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_MESSAGEGROUP):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.SEARCH_MESSAGEGROUPS):
    case FAILURE(ACTION_TYPES.FETCH_ALL_GROUPS_JOINED_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CONTENT_IN_GROUP_LIST):
    case FAILURE(ACTION_TYPES.FETCH_MESSAGEGROUP_LIST):
    case FAILURE(ACTION_TYPES.FETCH_MESSAGEGROUP):
    case FAILURE(ACTION_TYPES.CREATE_MESSAGEGROUP):
    case FAILURE(ACTION_TYPES.UPDATE_MESSAGEGROUP):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_MESSAGEGROUP):
    case FAILURE(ACTION_TYPES.DELETE_MESSAGEGROUP):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.SEARCH_MESSAGEGROUPS):
    case SUCCESS(ACTION_TYPES.FETCH_ALL_GROUPS_JOINED_LIST):
    {
      const links = parseHeaderForLinks(action.payload.headers.link);
      window.console.log(action)
      return {
        ...state,
        loading: false,
        links,
        messageGroupList: loadMoreDataWhenScrolled(state.messageGroupList, action.payload.data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
      };
    }
    case SUCCESS(ACTION_TYPES.FETCH_CONTENT_IN_GROUP_LIST):
    {
      const data = action.payload.data;
      const links = parseHeaderForLinks(action.payload.headers.link);
      const messageContentListCurrent =
        data.length > 0 &&
        state.groupIdCurrent === data[0].groupId
          ? state.messageContentList : [];
      const groupId = messageContentListCurrent.length > 0 ? messageContentListCurrent[0].groupId : null;
      window.console.log(messageContentListCurrent)
      return {
        ...state,
        loading: false,
        links,
        groupIdCurrent: groupId,
        messageContentList: loadMoreDataWhenScrolled(messageContentListCurrent, data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
      };
    }
    case SUCCESS(ACTION_TYPES.FETCH_MESSAGEGROUP_LIST):
    {
      const links = parseHeaderForLinks(action.payload.headers.link);

      return {
        ...state,
        loading: false,
        links,
        messageGroupList: loadMoreDataWhenScrolled(state.messageGroupList, action.payload.data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
      };
    }
    case SUCCESS(ACTION_TYPES.FETCH_MESSAGEGROUP):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_MESSAGEGROUP):
    case SUCCESS(ACTION_TYPES.UPDATE_MESSAGEGROUP):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_MESSAGEGROUP):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_MESSAGEGROUP):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.SET_BLOB:
    {
      const {name, data, contentType} = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType,
        },
      };
    }
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/message-groups';
const apiUrlMessageContent = 'api/message-contents';
const apiSearchUrl = 'api/_search/message-groups';

// Actions

export const getSearchEntities: ICrudSearchAction<IMessageGroup> = (query, page, size, sort) => ({
  type: ACTION_TYPES.SEARCH_MESSAGEGROUPS,
  payload: axios.get<IMessageGroup>(`${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`),
});

export const getEntities: ICrudGetAllAction<IMessageGroup> = (page, size, sort) =>
{
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_MESSAGEGROUP_LIST,
    payload: axios.get<IMessageGroup>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`),
  };
};

export const getEntity: ICrudGetAction<IMessageGroup> = id =>
{
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_MESSAGEGROUP,
    payload: axios.get<IMessageGroup>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IMessageGroup> = entity => async dispatch =>
{
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_MESSAGEGROUP,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  return result;
};

export const updateEntity: ICrudPutAction<IMessageGroup> = entity => async dispatch =>
{
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_MESSAGEGROUP,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IMessageGroup> = entity => async dispatch =>
{
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_MESSAGEGROUP,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IMessageGroup> = id => async dispatch =>
{
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_MESSAGEGROUP,
    payload: axios.delete(requestUrl),
  });
  return result;
};

export const getAllGroupsJoined: ICrudGetAllAction<IMessageGroup> = (page, size, sort) =>
{
  const requestUrl = `${apiUrl}/joined`;
  return {
    type: ACTION_TYPES.FETCH_ALL_GROUPS_JOINED_LIST,
    payload: axios.get(`${requestUrl}?${sort ? `page=${page}&size=${size}` : ''}`),
  };
};

export const getContentInGroup = (groupId, page, size) =>
{
  const queryParams = `?${page && size ? `page=${page}&size=${size}` : ''}`
  const requestUrl = `${apiUrlMessageContent}/message-groups/${groupId}${queryParams}`;
  return {
    type: ACTION_TYPES.FETCH_CONTENT_IN_GROUP_LIST,
    payload: axios.get(`${requestUrl}`),
  };
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType,
  },
});

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
