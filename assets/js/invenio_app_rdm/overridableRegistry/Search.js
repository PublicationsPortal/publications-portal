import React from "react"
import { Button, Form as SemanticForm, Header } from "semantic-ui-react";
import { Formik, Form, Field, FieldArray } from 'formik';

// Constant Variables start
const defaultSearchValue = { type: 'any', field: 'all', operator: 'AND', value: '' }

const searchTypes = [
  { key: 'any', text: 'Any of the words', value: 'any' },
  { key: 'all', text: 'All of the words', value: 'all' },
  { key: 'exact', text: 'Exact', value: 'exact' },
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
  { key: 'NOT', text: 'Not', value: 'NOT' },
]
// Constant Variables end

// Decoding the encoded search query from the URL and converting into the array of object to feed into the Formik
const decodeSearchFromURL = (queryString) => {
  const searchArray = [];

  const splittedSearches = queryString.split(") ")

  splittedSearches.forEach(s => {
    let field = "all", value, operator = "OR", type = "any";

    // Operator Detection
    if (s.startsWith("+")) {
      operator = "AND"
      // Remove the + from s
      s = s.replace("+", "")
    }
    else if (s.startsWith("-")) {
      operator = "NOT"
      // Remove the + from s
      s = s.replace("-", "")
    }

    // Field Detection
    if (s.includes(":")) {
      [field, value] = s.split(":")
    }
    else {
      value = s
    }

    // Value Sanitization: Remove ( and )
    value = value.replace("(", "")
    value = value.replace(")", "")

    // Type detection
    if (value.includes("+")) {
      type = "all"
      value = value.replaceAll("+", "")
    }
    else if (value.includes("\"")) {
      type = "exact"
      value = value.replaceAll("\"", "")
    }

    searchArray.push({ type, field, operator, value });
  })

  return { searches: searchArray };
};

// Search encoding Helper function start
const appendSearchType = (term, type) => {
  switch (type) {
    case "all":
      return `(${term.split(" ").map(t => `+${t}`).join(" ")})`
    case "exact":
      return `("${term}")`
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
      return `${term1 ? `${term1} ` : ""}+${term2}`
    case "OR":
      return `${term1 ? `${term1} ` : ""}${term2}`
    case "NOT":
      return `${term1 ? `${term1} ` : ""}-${term2}`
    default:
      return `${term1 ? `${term1} ` : ""}${term2}`
  }
}

const generateSearchQuery = (searches) => {
  let search = ""
  searches.forEach((searchItem, index) => {
    if (searchItem.value == "") return
    const seachAfterAppendingField = appendSearchField(
      appendSearchType(
        searchItem.value,
        searchItem.type
      ),
      searchItem.field
    )

    search = appendSearchOperator(
      search,
      seachAfterAppendingField,
      index == 0 && searches[index + 1]
        ? (searches[index + 1].operator && searches[index + 1].operator == "AND" ? "AND" : "")
        :
        searchItem.operator
    )
  })
  return search
}

// Search encoding Helper function end

export default function Search(props) {
  const [initialValues, setInitialValues] = React.useState({
    searches: [defaultSearchValue]
  })

  React.useEffect(() => {
    if (props.queryString) {
      const decodedSearch = decodeSearchFromURL(props.queryString);
      setInitialValues(decodedSearch);
    }
  }, [])


  const handleSearchSubmit = values => {
    const search = generateSearchQuery(values.searches)
    props.onInputChange(search);
    props.onBtnSearchClick();
  }

  if (!initialValues) return null
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={handleSearchSubmit}
      render={({ setFieldValue, values, resetForm, onReset }) => {
        return (
          <Form className="ui form" action="#">
            <FieldArray
              name="searches"
              render={arrayHelpers => (
                <>
                  <SemanticForm.Group className="computer screen only">
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
                          <SemanticForm.Group width="equal">
                            <Button type="button" fluid basic primary icon='add' onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              arrayHelpers.insert(index + 1, defaultSearchValue)
                            }} />
                            {
                              values.searches.length > 1 && (
                                <Button type="button" color="grey" fluid basic icon='x' onClick={(e) => {
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
                  <SemanticForm.Group width="equal" style={{ justifyContent: "right" }}>
                    <SemanticForm.Button color="orange" type="button" basic
                      onClick={() => {
                        setInitialValues({ searches: [defaultSearchValue] })
                        resetForm({ values: { searches: [defaultSearchValue] } })
                      }}
                    >
                      Reset
                    </SemanticForm.Button>
                    <SemanticForm.Button primary type="submit">Search</SemanticForm.Button>
                  </SemanticForm.Group>
                </>
              )}
            />
          </Form>
        )
      }}
    />
  )
}