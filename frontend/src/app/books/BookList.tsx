import {observer} from "mobx-react";
import {ApolloCache, gql, Reference, useMutation, useQuery} from "@apollo/client";
import {CloseOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Empty, Modal, Result, Space, Spin, Table} from "antd";
import {FormattedMessage, useIntl} from "react-intl";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import {EntityListScreenProps, OpenInBreadcrumbParams, Screens, useScreens} from "@amplicode/react-core";
import BookDetails from "./BookDetails";
import {TableRowSelection} from "antd/lib/table/interface";

const ROUTE = "book-list";

const FIND_ALL__BOOK = gql`
  query findAll_Book {
    findAll_Book {
      genre {
        name
      }
      id
      name
      authors {
        firstName
        lastName
      }
    }
  }
`;

const DELETE__BOOK = gql`
  mutation delete_Book($id: Long!) {
    delete_Book(id: $id)
  }
`;

const BookList = observer(({ onSelect }: EntityListScreenProps) => {
  const screens: Screens = useScreens();
  const intl = useIntl();
  const match = useRouteMatch<{ entityId: string }>(`/${ROUTE}/:entityId`);
  const history = useHistory();

  const { loading, error, data } = useQuery(FIND_ALL__BOOK);

  const [executeDeleteMutation] = useMutation(DELETE__BOOK);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const tableRowSelection: TableRowSelection<any> = {
    type: 'radio',
    selectedRowKeys: selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  }

  // Entity list can work in select mode, which means that you can select an entity instance and it will be passed to onSelect callback.
  // This functionality is used in EntityLookupField.
  const isSelectMode = onSelect != null;

  const openEditor = useCallback(
    (id?: string) => {
      const params: OpenInBreadcrumbParams = {
        breadcrumbCaption: intl.formatMessage({id: 'screen.BookDetails'}),
        component: BookDetails,
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

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return (
      <Result
        status="error"
        title={<FormattedMessage id="common.requestFailed" />}
      />
    );
  }

  const items = data?.["findAll_Book"];

  function onRemoveClick() {
    if (selectedRowKeys.length === 0) {
      return;
    }

    Modal.confirm({
      content: intl.formatMessage({
        id: "EntityListScreen.deleteConfirmation"
      }),
      okText: intl.formatMessage({id: "common.ok"}),
      cancelText: intl.formatMessage({id: "common.cancel"}),
      onOk: () => {
        let entityId = selectedRowKeys[0]
        let entityInstance = items.find((item: any) => item["id"] === entityId)
        executeDeleteMutation({
          variables: {
            id: entityId
          },
          update: getUpdateFn(entityInstance)
        });
      }
    });
  }

  function getNameColumnValue(value: any, record: any): React.ReactNode {
    return <>
      <Button type={"link"}
              title={intl.formatMessage({ id: "common.edit" })}
              onClick={() => openEditor(record["id"])}
      >
        {value}
      </Button>
    </>
  }

  function getAuthorsColumnValue(value: any): React.ReactNode {
    let authors = value as any[];
    let authorsStr = "n/a";
    if (authors) {
      authorsStr = authors
          .map(author => author["firstName"] + " " + author["lastName"])
          .reduce((a, b) => a + (a.length === 0 ? "" : ", ") + b, "");
    }
    return <>
      { authorsStr }
    </>
  }

  const tableColumns = [
    {
      title : "Name",
      dataIndex: "name",
      key: "name",
      render: getNameColumnValue,
      sorter: (a: any, b: any) => a["name"].localeCompare(b["name"])
    },
    {
      title : "Genre",
      dataIndex: ["genre", "name"],
      key: "genre",
      sorter: (a: any, b: any) => a["genre"]["name"].localeCompare(b["genre"]["name"])
    },
    {
      title : "Authors",
      dataIndex: "authors",
      key: "authors",
      render: getAuthorsColumnValue
    }
  ]

  if (items == null || items.length === 0) {
    return (
        <div className="narrow-layout">
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
          <Empty/>
        </div>
    );
  }

  return (
    <div className="narrow-layout">
      {!isSelectMode && (
          <div style={{marginBottom: "12px"}}>
            <Space>
              <Button
                  htmlType="button"
                  key="create"
                  title='intl.formatMessage({id: "common.create"})'
                  type="primary"
                  icon={<PlusOutlined/>}
                  onClick={() => openEditor()}
              >
                <span>
                  <FormattedMessage id="common.create"/>
                </span>
              </Button>
              <Button
                  htmlType="button"
                  key="delete"
                  title='intl.formatMessage({id: "common.remove"})'
                  type="primary"
                  icon={<DeleteOutlined/>}
                  disabled={tableRowSelection.selectedRowKeys?.length === 0}
                  onClick={() => onRemoveClick()}
              >
                <span>
                  <FormattedMessage id="common.remove"/>
                </span>
              </Button>
              </Space>
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
              <FormattedMessage id="common.close" />
            </span>
          </Button>
        </div>
      )}

      <Table columns={tableColumns}
             dataSource={items}
             pagination={false}
             rowSelection={tableRowSelection}
             rowKey="id"
      />
    </div>
  );
});

function getUpdateFn(e: any) {
  return (cache: ApolloCache<any>) => {
    cache.modify({
      fields: {
        findAll_Book(existingRefs, { readField }) {
          return existingRefs.filter(
            (ref: Reference) => e["id"] !== readField("id", ref)
          );
        }
      }
    });
  };
}

export default BookList;
