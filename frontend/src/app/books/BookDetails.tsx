import { useEffect, useCallback, useState } from "react";
import {
  gql,
  useLazyQuery,
  useMutation,
  FetchResult,
  ApolloError,
  ApolloCache, useQuery
} from "@apollo/client";
import {Form, Button, Card, message, Alert, Spin, Result, Input, Select} from "antd";
import { useForm } from "antd/es/form/Form";
import { observer } from "mobx-react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import {
  EntityDetailsScreenProps,
  useScreens,
  guessDisplayName
} from "@amplicode/react-core";
import { EntityLookupField } from "@amplicode/react-antd";
import BookList from "./BookList";
import GenreList from "../genres/GenreList";

const { Option } = Select;

const FIND_BY_ID__BOOK = gql`
  query findById_Book($id: Long!) {
    findById_Book(id: $id) {
      genre {
        id
        name
      }
      authors {
        id
        firstName
        lastName
      }
      id
      name
    }
  }
`;

const SAVE__BOOK = gql`
  mutation save_Book($input: BookDetailsDtoInput) {
    save_Book(input: $input) {
      genre {
        id
        name
      }
      authors {
        id
        firstName
        lastName
      }
      id
      name
    }
  }
`;

const ALL_GENRES = gql`
  query allGenres {
    allGenres {
      id
      name
    }
  }
`;

const LIST__AUTHOR = gql`
  query list_Author {
    list_Author(filter: {name: ""}) {
      firstName
      id
      lastName
    }
  }
`;

const BookDetails = observer(({ id }: EntityDetailsScreenProps) => {
  const [form] = useForm();
  const intl = useIntl();
  const screens = useScreens();
  const history = useHistory();

  const [
    loadItem,
    { loading: queryLoading, error: queryError, data }
  ] = useLazyQuery(FIND_BY_ID__BOOK, {
    variables: {
      id
    }
  });

  const {loading: genresLoading, error: genresError, data: genresData} = useQuery(ALL_GENRES);
  const {loading: authorsLoading, error: authorsError, data: authorsData} = useQuery(LIST__AUTHOR);

  const [executeUpsertMutation, { loading: upsertInProcess }] = useMutation(
    SAVE__BOOK
  );

  const [formError, setFormError] = useState<string | undefined>();

  const goToParentScreen = useCallback(() => {
    history.push("."); // Remove entity id part from url
    screens.closeActiveBreadcrumb();
  }, [screens, history]);

  const handleSubmit = useCallback(
    values => {
      executeUpsertMutation({
        variables: {
          input: formValuesToData(values, id)
        },
        update: getUpdateFn(values)
      })
        .then(({ errors }: FetchResult) => {
          if (errors == null || errors.length === 0) {
            goToParentScreen();
            message.success(
              intl.formatMessage({
                id: "EntityDetailsScreen.savedSuccessfully"
              })
            );
            return;
          }
          setFormError(errors.join("\n"));
          console.error(errors);
          message.error(intl.formatMessage({ id: "common.requestFailed" }));
        })
        .catch((e: Error | ApolloError) => {
          setFormError(e.message);
          console.error(e);
          message.error(intl.formatMessage({ id: "common.requestFailed" }));
        });
    },
    [executeUpsertMutation, id, intl, goToParentScreen]
  );

  const handleSubmitFailed = useCallback(() => {
    message.error(
      intl.formatMessage({ id: "EntityDetailsScreen.validationError" })
    );
  }, [intl]);

  useEffect(() => {
    if (id != null) {
      loadItem();
    }
  }, [loadItem, id]);

  const item = data?.["findById_Book"];

  useEffect(() => {
    if (item != null) {
      form.setFieldsValue(dataToFormValues(item));
    }
  }, [item, form]);

  if (queryLoading) {
    return <Spin />;
  }

  if (queryError) {
    return (
      <Result
        status="error"
        title={<FormattedMessage id="common.requestFailed" />}
      />
    );
  }

  const genreItems = (genresLoading || genresError) ? [] : genresData?.["allGenres"];
  const authorItems = (authorsLoading || authorsError) ? [] : authorsData?.["list_Author"];

  return (
    <Card className="narrow-layout">
      <Form
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFailed}
        layout="vertical"
        form={form}
      >
        <Form.Item name="name" label="Name" style={{ marginBottom: "12px" }}>
          <Input autoFocus/>
        </Form.Item>

        <Form.Item name="genre" label="Genre" style={{ marginBottom: "12px" }}>
          <Select>
            {genreItems.map((genre: any) => (
                <Option key={genre["id"]} value={genre["id"]}>
                  {genre["name"]}
                </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="authors" label="Authors" style={{ marginBottom: "12px" }}>
          <Select mode="multiple" allowClear>
            {authorItems.map((author: any) => (
                <Option key={author["id"]} value={author["id"]}>
                  {author["firstName"] + " " + author["lastName"]}
                </Option>
            ))}
          </Select>
        </Form.Item>

        {formError && (
          <Alert
            message={formError}
            type="error"
            style={{ marginBottom: "18px" }}
          />
        )}

        <Form.Item style={{ textAlign: "center" }}>
          <Button htmlType="button" onClick={goToParentScreen}>
            <FormattedMessage id="common.cancel" />
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={upsertInProcess}
            style={{ marginLeft: "8px" }}
          >
            <FormattedMessage id={"common.submit"} />
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
});

function formValuesToData(values: any, id?: string): any {
  let map = {
    ...values,
    id
  };
  let formGenre = map["genre"] as number;
  let formAuthor = map["authors"] as number[];
  map["genre"] = {"id": formGenre};
  map["authors"] = formAuthor.map(val => ({"id": val}));
  return map;
}

function dataToFormValues(data: any): any {
  let map = { ...data };
  let genreObj = map["genre"];
  let authorsObj = map["authors"] as any[];
  map["genre"] = genreObj ? genreObj["id"] : null;
  map["authors"] = authorsObj ? authorsObj.map(val => val["id"]) : [];
  return map;
}

function getUpdateFn(values: any) {
  return (cache: ApolloCache<any>, result: FetchResult) => {
    const updateResult = result.data?.["save_Book"];
    // Reflect the update in Apollo cache
    cache.modify({
      fields: {
        findAll_Book(existingRefs = []) {
          const updatedItemRef = cache.writeFragment({
            id: `BookDto:${updateResult.id}`,
            data: values,
            fragment: gql(`
              fragment New_BookDto on BookDto {
                id
              }
            `)
          });
          return [...existingRefs, updatedItemRef];
        }
      }
    });
  };
}

export default BookDetails;
