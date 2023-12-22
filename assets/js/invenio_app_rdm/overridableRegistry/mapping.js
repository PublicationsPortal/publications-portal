// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

/**
 * Add here all the overridden components of your app.
 */

import { Grid, Select, Input, Button, Form as SemanticForm } from "semantic-ui-react";
import React, {Component} from "react"
import { Formik, Form, Field, FieldArray } from 'formik';

function Search (props) {
  const {
    actionProps,
    onBtnSearchClick,
    onInputChange,
    onKeyPress,
    overridableId,
    placeholder,
    queryString,
    uiProps,
  } = props;

  const searchType = [
    { key: 'all', text: 'All', value: 'all' },
    { key: 'any', text: 'Any of the words', value: 'any' },
  ]

  const searchFields = [
    { key: 'all', text: 'All', value: 'all' },
    { key: 'title', text: 'Title', value: 'metadata.title' },
    { key: 'author', text: 'Author', value: 'metadata.author' },
  ]

  const searchOperator = [
    { key: 'AND', text: 'And', value: 'AND' },
    { key: 'OR', text: 'Or', value: 'OR' },
  ]

  const handleSearchSubmit = values => {
    let search = ""
    values.searches.forEach(searchItem => {
      search += `${searchItem.field == 'all' ? '' : searchItem.field}:${searchItem.value}
       ${searchItem.operator}`;
    });
    search = search.replace(/(AND|OR)\s*$/, '');
    search = search.trim();
    console.log({search})
    onInputChange(search);
    onBtnSearchClick();
  }

  const initialValues = {
    searches: [
      { type: 'all', field: 'all', operator: 'AND', value: '' },
    ]
  }

  return (
    
        <Formik
          initialValues={initialValues}
          onSubmit={handleSearchSubmit}
          render={({ values }) => (
            <Form>
              <Grid centered divided="vertically">
              <FieldArray
                name="searches"
                render={arrayHelpers => (
                  <>
                    {values.searches && values.searches.length > 0 ? (
                      values.searches.map((search, index) => (
                        <Grid.Row key={index}>
                          <Grid.Column width={2}>
                            <Field as="select" name={`searches.${index}.type`}>
                              {searchType.map((type) => (
                                <option key={type.key} value={type.value}>
                                  {type.text}
                                </option>
                              ))}
                            </Field>
                          </Grid.Column>

                          <Grid.Column width={4}>
                            <Field as={SemanticForm.Input} name={`searches.${index}.value`} fluid placeholder="Type here..." />
                          </Grid.Column>

                          <Grid.Column width={2}>
                            <Field as="select" name={`searches.${index}.field`}>
                              {searchFields.map((type) => (
                                <option key={type.key} value={type.value}>
                                  {type.text}
                                </option>
                              ))}
                            </Field>
                          </Grid.Column>

                          <Grid.Column width={2}>
                            <Field as="select" name={`searches.${index}.operator`}>
                              {searchOperator.map((type) => (
                                <option key={type.key} value={type.value}>
                                  {type.text}
                                </option>
                              ))}
                            </Field>
                          </Grid.Column>
                                
                          <Grid.Column width={1}>
                            <Button 
                              onClick={() => arrayHelpers.remove(index)} 
                              type="button"
                            >
                              X
                            </Button>
                          </Grid.Column>

                          {/* <Grid.Column width={1}>
                            <Button
                              onClick={() => arrayHelpers.insert(index, { type: 'all', field: 'all', operator: 'AND', value: '' })} 
                              type="button"
                            >
                              +
                            </Button>
                          </Grid.Column> */}
                        </Grid.Row>
                      ))
                    ) : (
                      <Button type="submit" onClick={() => arrayHelpers.push('')} floated="right">
                        Add Search
                      </Button>
                    )}
                    
                    <Grid.Row>
                      <Grid.Column>
                        <Button type="button" onClick={() => arrayHelpers.push('')} floated="right">
                          Add
                        </Button>
                      </Grid.Column>
                      <Grid.Column>
                        <Button type="submit" floated="right">Submit</Button>
                      </Grid.Column>
                    </Grid.Row>
                  </>
                )}
              />
              </Grid>
              </Form>
          )}
        />
      
     
  )
}

export const overriddenComponents = {
  "InvenioAppRdm.Search.SearchBar.element": Search
}