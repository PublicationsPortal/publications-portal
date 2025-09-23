// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";

import { FieldLabel, Input, RichInputField } from "react-invenio-forms";
import { Divider, Grid } from "semantic-ui-react";

import PropTypes from "prop-types";

export class Summarization extends Component {
  render() {
    const {
      fieldPath, // injected by the custom field loader via the `field` config property
      simple,
      advanced,
      icon,
      label,
    } = this.props;
    return (
      <>
        {label && (
          <>
            <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
            <Divider fitted />
          </>
        )}
        <Grid padded>
          <Grid.Column width="16">
            <RichInputField
              fieldPath={`${fieldPath}.simple`}
              label={simple.label}
            />
            {simple.description && (
              <label className="helptext mb-0">{simple.description}</label>
            )}
          </Grid.Column>
          <Grid.Column width="16">
            <RichInputField
              fieldPath={`${fieldPath}.advanced`}
              label={advanced.label}
            />
            {advanced.description && (
              <label className="helptext mb-0">{advanced.description}</label>
            )}
          </Grid.Column>
        </Grid>
      </>
    );
  }
}

Summarization.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  simple: PropTypes.object.isRequired,
  advanced: PropTypes.object.isRequired,
  icon: PropTypes.string,
  label: PropTypes.string,
};

Summarization.defaultProps = {
  icon: undefined,
  label: undefined,
};