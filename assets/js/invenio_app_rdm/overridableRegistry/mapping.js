// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

/**
 * Add here all the overridden components of your app.
 */

import { Grid, Select, Input, Button, Form as SemanticForm, Header, Icon } from "semantic-ui-react";
import React, { Component } from "react"
import { Formik, Form, Field, FieldArray } from 'formik';

const decodeSearchFromURL = (queryString) => {
  const searchArray = [];
  const searchTerms = queryString.split(/\s+/);
  for (let term of searchTerms) {
    let field = 'all', value, operator, type;
    if (term.includes(':')) {
      [field, value] = term.split(':');
      operator = field.startsWith('+') ? 'AND' : 'OR';
      field = field.replace(/^\+/, '')

      value = value.replace(/(^\(+|\)+$)/g, '').trim(" ");
      type = value.startsWith('+') ? 'exact' : 'any';
      value = value.replace(/^\+/, '');
    }
    else {
      value = term
      operator = value.startsWith('+') ? 'AND' : 'OR';
      value = value.replace(/^\+/, '');

      value = value.replace(/(^\(+|\)+$)/g, '').trim(" ");
      type = value.startsWith('+') ? 'exact' : 'any';
      value = value.replace("+", '');
    }
    searchArray.push({ type, field, operator, value });
  }

  return { searches: searchArray };
};
const defaultSearchValue = { type: 'exact', field: 'all', operator: 'AND', value: '' }

const searchTypes = [
  { key: 'exact', text: 'Exact', value: 'exact' },
  { key: 'any', text: 'Any of the words', value: 'any' },
]

const searchFields = [
  { key: 'all', text: 'All', value: 'all' },
  { key: 'title', text: 'Title', value: 'metadata.title' },
  { key: 'author', text: 'Author', value: 'metadata.creators.person_or_org.name' },
  { key: 'description', text: 'Description', value: 'metadata.description' },
  // { key: 'date', text: 'Date', value: 'metadata.publication_date' },
]

const searchOperators = [
  { key: 'AND', text: 'And', value: 'AND' },
  { key: 'OR', text: 'Or', value: 'OR' },
]

const appendSearchType = (term, type) => {
  switch (type) {
    case "exact":
      return `(${term.split(" ").map(t => `+${t}`).join(" ")})`
    case "any":
      return `(${term})`
    default:
      return `(${term})`
  }
}

const appendSearchField = (term, field) => {
  if (field == "all") return term
  else {
    return `${field}:${term}`
  }
}

const appendSearchOperator = (term1, term2, operator) => {
  switch (operator) {
    case "AND":
      return `${term1} +${term2}`
    case "OR":
      return `${term1} ${term2}`
    default:
      return `${term1} ${term2}`
  }
}

function Search(props) {
  const initialDefaultValues = {
    searches: [defaultSearchValue]
  }

  const [initialValues, setInitialValues] = React.useState()

  React.useEffect(() => {
    if (props.queryString) {
      const decodedSearch = decodeSearchFromURL(props.queryString);
      setInitialValues(decodedSearch);
    }
    else {
      setInitialValues(initialDefaultValues);
    }
  }, [])


  const handleSearchSubmit = values => {
    let search = ""
    values.searches.forEach((searchItem) => {
      if (searchItem.value == "") return
      const seachAfterAppendingField = appendSearchField(
        appendSearchType(
          searchItem.value,
          searchItem.type
        ),
        searchItem.field
      )

      if (search == "") {
        search = seachAfterAppendingField
      } else {
        search = appendSearchOperator(
          search,
          seachAfterAppendingField,
          searchItem.operator
        )
      }
    })
    props.onInputChange(search);
    props.onBtnSearchClick();

    // initializeValues()
  }

  if (!initialValues)
    return null

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSearchSubmit}
      render={({ setFieldValue, values }) => {
        return (
          <Form className="ui form" action="#">
            <FieldArray
              name="searches"
              render={arrayHelpers => (
                <>
                  <SemanticForm.Group>
                    {
                      values.searches.length > 1 ? (
                        <SemanticForm.Field width={2}>
                          <Header as='h4' dividing>
                            Operator
                          </Header>
                        </SemanticForm.Field>
                      ) : (
                        <SemanticForm.Field width={2}>
                          <Header as='h4'></Header>
                        </SemanticForm.Field>
                      )
                    }

                    <SemanticForm.Field width={2}>
                      <Header as='h4' dividing>
                        Field
                      </Header>
                    </SemanticForm.Field>

                    <SemanticForm.Field width={2}>
                      <Header as='h4' dividing>
                        Contains
                      </Header>
                    </SemanticForm.Field>

                    <SemanticForm.Field width={8}>
                      <Header as='h4' dividing>
                        Search Text
                      </Header>
                    </SemanticForm.Field>
                  </SemanticForm.Group>
                  {
                    values.searches.map((search, index) => (
                      <SemanticForm.Group>
                        <>
                          {
                            index == 0 ? (
                              <SemanticForm.Field width={2} />
                            )

                              : (
                                <Field name={`searches.${index}.operator`}>
                                  {
                                    ({ field: { value, onChange } }) => (
                                      <SemanticForm.Select name={`searches.${index}.operator`} fluid options={searchOperators} onChange={(e, { name, value }) => {
                                        setFieldValue(`searches.${index}.operator`, value)
                                      }}
                                        value={value}
                                        width={2}
                                      />
                                    )
                                  }
                                </Field>
                              )
                          }
                        </>

                        <Field name={`searches.${index}.field`}>
                          {
                            ({ field: { value, onChange } }) => (
                              <SemanticForm.Select name={`searches.${index}.field`} fluid options={searchFields} onChange={(e, { name, value }) => {
                                setFieldValue(`searches.${index}.field`, value)
                              }}
                                value={value}
                                width={2}
                              />
                            )
                          }
                        </Field>
                        <Field name={`searches.${index}.type`}>
                          {
                            ({ field: { value, onChange } }) => (
                              <SemanticForm.Select name={`searches.${index}.type`} fluid options={searchTypes} onChange={(e, { name, value }) => {
                                setFieldValue(`searches.${index}.type`, value)
                              }}
                                value={value}
                                width={2}
                              />
                            )
                          }
                        </Field>
                        <Field name={`searches.${index}.value`} as={SemanticForm.Input} fluid placeholder="Search Text" width={8} />
                        <SemanticForm.Field width={2}>
                          <SemanticForm.Group width="equal" textAlign="center" centered>
                            <Button type="button" fluid basic icon='add' onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              arrayHelpers.insert(index + 1, defaultSearchValue)
                            }} />
                            {
                              values.searches.length > 1 && (
                                <Button type="button" variant="primary" fluid basic icon='x' onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  arrayHelpers.remove(index)
                                }} />
                              )
                            }
                          </SemanticForm.Group>
                        </SemanticForm.Field>

                      </SemanticForm.Group>
                    ))
                  }
                  <SemanticForm.Button floated='right' type="submit">Search</SemanticForm.Button>
                </>
              )}
            />
          </Form>
        )
      }}
    />
  )
}

export const overriddenComponents = {
  "InvenioAppRdm.Search.SearchBar.element": Search
}