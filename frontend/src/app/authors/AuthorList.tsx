import { observer } from "mobx-react";
import {
  gql,
  useQuery,
  useMutation,
  ApolloCache,
  Reference
} from "@apollo/client";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from "@ant-design/icons";
import {Button, Card, Modal, Spin, Empty, Result, Row, Col, Input} from "antd";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { MutationFunctionOptions } from "@apollo/client/react/types/types";
import { FetchResult } from "@apollo/client/link/core";
import React, {useCallback, useEffect, useState} from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  EntityListScreenProps,
  guessDisplayName,
  guessLabel,
  OpenInBreadcrumbParams,
  Screens,
  useScreens
} from "@amplicode/react-core";
import AuthorDetails from "./AuthorDetails";

const ROUTE = "author-list";

const LIST__AUTHOR = gql`
  query list_Author($name: String) {
    list_Author(filter: {name: $name}) {
      firstName
      id
      lastName
    }
  }
`;

const DELETE__AUTHOR = gql`
  mutation delete_Author($id: Long!) {
    delete_Author(id: $id)
  }
`;

const AuthorList = observer(({ onSelect }: EntityListScreenProps) => {
  const screens: Screens = useScreens();
  const intl = useIntl();
  const match = useRouteMatch<{ entityId: string }>(`/${ROUTE}/:entityId`);
  const history = useHistory();
  const [nameFilterValue, setNameFilterValue] = useState("");
  const [nameToSearchBy, setNameToSearchBy] = useState("");

  const { loading, error, data } = useQuery(LIST__AUTHOR, {
    variables: {"name": nameToSearchBy}
  });

  const [executeDeleteMutation] = useMutation(DELETE__AUTHOR);

  // Entity list can work in select mode, which means that you can select an entity instance and it will be passed to onSelect callback.
  // This functionality is used in EntityLookupField.
  const isSelectMode = onSelect != null;

  const openEditor = useCallback(
    (id?: string) => {
      const params: OpenInBreadcrumbParams = {
        breadcrumbCaption: intl.formatMessage({id: id ? 'screen.AuthorDetails' : 'screen.CreateAuthor'}),
        component: AuthorDetails,
      };
      if (id != null) {
        params.props = {id};
      }
      screens.openInBreadcrumb(params);
      // Append /id to existing url
      history.push(id ? `/${ROUTE}/${id}` : `/${ROUTE}/new`);
    },
    [screens, history, intl]
  );

  useEffect(() => {
    if (
      screens.activeTab?.breadcrumbs.length === 1 &&
      match?.params.entityId != null
    ) {
      openEditor(match.params.entityId);
    }
  }, [match, openEditor, screens]);

  if (error) {
    return (
      <Result
        status="error"
        title={<FormattedMessage id="common.requestFailed" />}
      />
    );
  }

  const items = data?.["list_Author"];

  function onInputBlur(event: React.FocusEvent<HTMLInputElement>) {
    setNameToSearchBy(event.currentTarget.value)
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNameFilterValue(event.target.value);
  }

  function onInputPressEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    setNameToSearchBy(event.currentTarget.value)
  }

  return (
    <div className="narrow-layout">
      <Row gutter={16} style={{marginBottom: 8}}>
        <Col flex={"none"}>
          <span style={{verticalAlign: "middle"}}>
              <FormattedMessage id="author.filterByName"/>
          </span>
        </Col>
        <Col flex={"auto"}>
          <Input
                 autoFocus={true}
                 allowClear={true}
                 value={nameFilterValue}
                 onChange={onInputChange}
                 onBlur={onInputBlur}
                 onPressEnter={onInputPressEnter}/>
        </Col>
      </Row>
      {!isSelectMode && (
        <div style={{ marginBottom: "12px" }}>
          <Button
            htmlType="button"
            key="create"
            title='intl.formatMessage({id: "common.create"})'
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openEditor()}
          >
            <span>
              <FormattedMessage id="common.create" />
            </span>
          </Button>
        </div>
      )}
      {isSelectMode && (
        <div style={{ marginBottom: "12px" }}>
          <Button
            htmlType="button"
            key="close"
            title='intl.formatMessage({id: "common.close"})'
            type="primary"
            icon={<CloseOutlined />}
            onClick={screens.closeActiveBreadcrumb}
          >
            <span>
              <FormattedMessage id="common.close"/>
            </span>
          </Button>
        </div>
      )}

      {
        loading ? <Spin/> : <span/>
      }

      {items == null || items.length === 0
          ? <Empty/>
          :
        items.map((e: any) => (
            <Card
                key={e["id"]}
                title={guessDisplayName(e)}
                style={{marginBottom: "12px"}}
                actions={getCardActions({
                  screens,
                  entityInstance: e,
                  onSelect,
                  executeDeleteMutation,
                  intl,
                  openEditor
                })}
            >
                <Fields entity={e}/>
            </Card>
        ))
      }
    </div>
  );
});

const Fields = ({ entity }: { entity: any }) => (
  <>
    {Object.keys(entity)
      .filter(p => p !== "id" && entity[p] != null)
      .map(p => (
        <div key={p}>
          <strong>{guessLabel(p)}:</strong> {renderFieldValue(entity, p)}
        </div>
      ))}
  </>
);

function renderFieldValue(entity: any, property: string): string {
  return typeof entity[property] === "object"
    ? guessDisplayName(entity[property])
    : String(entity[property]);
}

interface CardActionsInput {
  screens: Screens;
  entityInstance: any;
  onSelect?: (entityInstance: this["entityInstance"]) => void;
  executeDeleteMutation: (
    options?: MutationFunctionOptions
  ) => Promise<FetchResult>;
  intl: IntlShape;
  openEditor: (id?: string) => void;
}

function getCardActions(input: CardActionsInput) {
  const {
    screens,
    entityInstance,
    onSelect,
    executeDeleteMutation,
    intl,
    openEditor
  } = input;

  if (onSelect == null) {
    return [
      <DeleteOutlined
        key="delete"
        title={intl.formatMessage({ id: "common.remove" })}
        onClick={() => {
          Modal.confirm({
            content: intl.formatMessage({
              id: "EntityListScreen.deleteConfirmation"
            }),
            okText: intl.formatMessage({ id: "common.ok" }),
            cancelText: intl.formatMessage({ id: "common.cancel" }),
            onOk: () => {
              executeDeleteMutation({
                variables: {
                  id: entityInstance.id
                },
                update: getUpdateFn(entityInstance)
              });
            }
          });
        }}
      />,
      <EditOutlined
        key="edit"
        title={intl.formatMessage({ id: "common.edit" })}
        onClick={() => {
          openEditor(entityInstance.id);
        }}
      />
    ];
  }

  if (onSelect != null) {
    return [
      <CheckOutlined
        key="select"
        title={intl.formatMessage({
          id: "EntityLookupField.selectEntityInstance"
        })}
        onClick={() => {
          if (onSelect != null) {
            onSelect(entityInstance);
            screens.closeActiveBreadcrumb();
          }
        }}
      />
    ];
  }
}

function getUpdateFn(e: any) {
  return (cache: ApolloCache<any>) => {
    cache.modify({
      fields: {
        list_Author(existingRefs, { readField }) {
          return existingRefs.filter(
            (ref: Reference) => e["id"] !== readField("id", ref)
          );
        }
      }
    });
  };
}

export default AuthorList;
