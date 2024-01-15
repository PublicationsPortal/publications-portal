import React from "react"
import { Button, Form as SemanticForm, Header, Divider } from "semantic-ui-react";
import { Formik, Form, Field, FieldArray } from 'formik';
import moment from 'moment';

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

const dateTypes = [
  // { key: 'creation_date', text: 'Creation Date', value: 'metadata.creation_date' },
  { key: 'publication_date', text: 'Publication Date', value: 'metadata.publication_date' },
  // { key: 'update_date', text: 'Update Date', value: 'metadata.update_date' },
]

const timePeriod = [
  { key: 'all_year', text: 'All Year', value: 'all_year' },
  { key: 'last_year', text: 'Last Year', value: 'last_year' },
  { key: 'last_month', text: 'Last Month', value: 'last_month' },
  { key: 'last_two_years', text: 'Last Two Years', value: 'last_two_years' },
  { key: 'last_five_years', text: 'Last Five Years', value: 'last_five_years' },
  { key: 'specific', text: 'Specific', value: 'specific' },
]
// Constant Variables end

// Decoding the encoded search query from the URL and converting into the array of object to feed into the Formik
const decodeSearchFromURL = (queryString) => {
  const searches = [];
  const date = { type: dateTypes[0].value, timePeriod: timePeriod[0].value, specific_date_start_period: "", specific_date_end_period: "" }
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
    if (field == "metadata.publication_date" || field == "metadata.creation_date" || field == "metadata.update_date") {
      // Value Sanitization: Remove [ and ]
      value = value.replace("[", "")
      value = value.replace("]", "")

      let [startDate, endDate] = value.split(" TO ")
      startDate = moment(startDate)
      endDate = moment(endDate)

      const yearsDifference = endDate.diff(startDate, 'years')
      const monthsDifference = endDate.diff(startDate, 'months')

      if (yearsDifference == 2) {
        date.timePeriod = "last_two_years"
      }
      else if (yearsDifference == 5) {
        date.timePeriod = "last_five_years"
      }
      else if (yearsDifference == 1) {
        date.timePeriod = "last_year"
      }
      else if (monthsDifference == 1) {
        date.timePeriod = "last_month"
      }
      else {
        date.timePeriod = "specific"
        date.specific_date_start_period = startDate.format("YYYY-MM-DD")
        date.specific_date_end_period = endDate.format("YYYY-MM-DD")
      }

      date.type = field
    }
    else {
      // Type detection
      if (value.includes("+")) {
        type = "all"
        value = value.replaceAll("+", "")
      }
      else if (value.includes("\"")) {
        type = "exact"
        value = value.replaceAll("\"", "")
      }
      searches.push({ type, field, operator, value });

    }
  })
  return { date, searches }
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

const generateSearchDateQuery = (date) => {
  const { type, timePeriod, specific_date_start_period, specific_date_end_period } = date
  let startDate = ""
  let endDate = moment()

  if (timePeriod == "all_year") {
    return ""
  }

  if (timePeriod == "specific") {
    startDate = moment(specific_date_start_period)
    endDate = moment(specific_date_end_period)
  }
  else if (timePeriod == "last_year") {
    startDate = moment().subtract(1, 'years')
  }
  else if (timePeriod == "last_two_years") {
    startDate = moment().subtract(2, 'years')
  }
  else if (timePeriod == "last_five_years") {
    startDate = moment().subtract(5, 'years')
  }
  else if (timePeriod == "last_month") {
    startDate = moment().subtract(1, 'months')
  }

  // Formatting the date to YYYY-MM-DD
  startDate = startDate.format("YYYY-MM-DD")
  endDate = endDate.format("YYYY-MM-DD")

  return `+${appendSearchField(`[${startDate} TO ${endDate}]`, type)}`
}

const generateSearchQuery = (values) => {
  const { searches, date } = values
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
  search = search + " " + generateSearchDateQuery(date)
  return search
}

// Search encoding Helper function end

export default function Search(props) {
  const [initialValues, setInitialValues] = React.useState({
    searches: [defaultSearchValue],
    date: {
      type: dateTypes[0].value,
      timePeriod: timePeriod[0].value,
      specific_date_start_period: "",
      specific_date_end_period: "",
    }
  })

  React.useEffect(() => {
    if (props.queryString) {
      const decodedSearch = decodeSearchFromURL(props.queryString);
      setInitialValues({
        searches: [...decodedSearch.searches, defaultSearchValue],
        date: decodedSearch.date
      });
    }
  }, [])


  const handleSearchSubmit = values => {
    const search = generateSearchQuery(values)
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
            <SemanticForm.Group className="computer screen only">
              <SemanticForm.Field width={2} />
              <SemanticForm.Field width={4}>
                <Header as='h4' dividing>
                  Date Type
                </Header>
              </SemanticForm.Field>

              <SemanticForm.Field width={4}>
                <Header as='h4' dividing>
                  Time Period
                </Header>
              </SemanticForm.Field>

              <SemanticForm.Field width={6}>
                <Header as='h4' dividing>
                  Specific Period
                </Header>
              </SemanticForm.Field>
            </SemanticForm.Group>
            <SemanticForm.Group className="computer screen only">
              <SemanticForm.Field width={2} />
              <Field name={`date.type`}>
                {
                  ({ field: { value, onChange } }) => (
                    <SemanticForm.Select name={`date.type`} fluid options={dateTypes} onChange={(e, { name, value }) => {
                      setFieldValue(`date.type`, value)
                    }}
                      value={value}
                      width={4}
                    />
                  )
                }
              </Field>

              <Field name={`date.timePeriod`}>
                {
                  ({ field: { value, onChange } }) => (
                    <SemanticForm.Select name={`date.timePeriod`} fluid options={timePeriod} onChange={(e, { name, value }) => {
                      setFieldValue(`date.timePeriod`, value)
                    }}
                      value={value}
                      width={4}
                    />
                  )
                }
              </Field>

              {
                values.date.timePeriod == "specific" && <>
                  <Field name={`date.specific_date_start_period`}>
                    {
                      ({ field: { value, onChange } }) => (
                        <SemanticForm.Input name={`date.specific_date_start_period`} type="date" fluid onChange={(e, { name, value }) => {
                          setFieldValue(`date.specific_date_start_period`, value)
                        }}
                          value={value}
                          width={3}
                        />
                      )
                    }
                  </Field>
                  <Field name={`date.specific_date_end_period`}>
                    {
                      ({ field: { value, onChange } }) => (
                        <SemanticForm.Input name={`date.specific_date_end_period`} type="date" fluid onChange={(e, { name, value }) => {
                          setFieldValue(`date.specific_date_end_period`, value)
                        }}
                          value={value}
                          width={3}
                        />
                      )
                    }
                  </Field>
                </>
              }

            </SemanticForm.Group>
            <Divider />
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