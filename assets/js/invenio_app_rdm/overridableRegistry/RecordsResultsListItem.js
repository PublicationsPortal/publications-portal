import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React, { useState, useEffect, useRef } from "react";
import { Item, Label, Icon, Button, Popup } from "semantic-ui-react";
import { CompactStats } from "@js/invenio_app_rdm/components/CompactStats";
import { DisplayPartOfCommunities } from "@js/invenio_app_rdm/components/DisplayPartOfCommunities";
import { SearchItemCreators } from "@js/invenio_app_rdm/utils";

export default function RecordsResultsListItem(props) {
  const uniqueViews = _get(props.result, "stats.all_versions.unique_views", 0);
  const uniqueDownloads = _get(props.result, "stats.all_versions.unique_downloads", 0);
  const publishingInformation = _get(props.result, "ui.publishing_information.journal", "");
  const viewLink = `/records/${props.result.id}`;
  const simpleAbstract = _get(props.result, "custom_fields.summarization:summarization.simple", "");
  const advancedAbstract = _get(props.result, "custom_fields.summarization:summarization.advanced", "");

  const hasSimpleAbstract = simpleAbstract && simpleAbstract.trim();
  const hasAdvancedAbstract = advancedAbstract && advancedAbstract.trim();
  const hasSummaries = hasSimpleAbstract || hasAdvancedAbstract;

  const [currentAbstractType, setCurrentAbstractType] = useState('original');
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      setAnimationClass('animate-in');
    }
  }, [isExpanded]);

  // Reset scroll position when abstract type changes
  useEffect(() => {
    if (contentRef.current && currentAbstractType !== 'original') {
      contentRef.current.scrollTop = 0;
    }
  }, [currentAbstractType]);

  const handleAbstractTypeChange = () => {
    if (currentAbstractType === 'original') {
      // From original state, always go to advanced first if available
      if (hasAdvancedAbstract) {
        setCurrentAbstractType('advanced');
        setIsExpanded(true);
        setAnimationClass('');
        setTimeout(() => setAnimationClass('animate-in'), 10);
      } else if (hasSimpleAbstract) {
        setCurrentAbstractType('simple');
        setIsExpanded(true);
        setAnimationClass('');
        setTimeout(() => setAnimationClass('animate-in'), 10);
      }
    } else if (currentAbstractType === 'advanced') {
      // From advanced, go to simple if available, otherwise close
      if (hasSimpleAbstract) {
        setCurrentAbstractType('simple');
        setAnimationClass('');
        setTimeout(() => setAnimationClass('animate-in'), 10);
      } else {
        setCurrentAbstractType('original');
        setIsExpanded(false);
        setAnimationClass('');
      }
    } else if (currentAbstractType === 'simple') {
      // From simple, always close
      setCurrentAbstractType('original');
      setIsExpanded(false);
      setAnimationClass('');
    }
  };

  const getButtonContent = () => {
    if (currentAbstractType === 'original') {
      // Show "AI Summary" button to start the cycle
      if (hasAdvancedAbstract) {
        return {
          icon: 'graduation cap',
          text: 'AI Summary'
        };
      } else if (hasSimpleAbstract) {
        return {
          icon: 'lightbulb outline',
          text: 'Simple AI Summary'
        };
      }
    } else if (currentAbstractType === 'advanced') {
      // From advanced, show "Simple AI Summary" if available, otherwise "Close"
      if (hasSimpleAbstract) {
        return {
          icon: 'lightbulb outline',
          text: 'Simple AI Summary'
        };
      } else {
        return {
          icon: 'times',
          text: 'Close'
        };
      }
    } else if (currentAbstractType === 'simple') {
      // From simple, always show "Close"
      return {
        icon: 'times',
        text: 'Close'
      };
    }
    return null;
  };

  const getCurrentAbstractContent = () => {
    switch (currentAbstractType) {
      case 'simple':
        return simpleAbstract;
      case 'advanced':
        return advancedAbstract;
      default:
        return props.descriptionStripped;
    }
  };

  const getAbstractIcon = () => {
    switch (currentAbstractType) {
      case 'simple':
        return 'lightbulb outline';
      case 'advanced':
        return 'graduation cap';
      default:
        return 'file alternate outline';
    }
  };

  const getAbstractTitle = () => {
    switch (currentAbstractType) {
      case 'simple':
        return 'Simple AI Summary';
      case 'advanced':
        return 'AI Summary';
      default:
        return 'Original Abstract';
    }
  };

  return (
    <Item key={props.key ?? props.result.id}>
      <Item.Content>
        {/* FIXME: Uncomment to enable themed banner */}
        {/* <DisplayVerifiedCommunity communities={result.parent?.communities} /> */}
        <Item.Extra className="labels-actions">
          <Label horizontal size="small" className="primary">
            {props.publicationDate} ({props.version})
          </Label>
          <Label horizontal size="small" className="neutral">
            {props.resourceType}
          </Label>
          <Label
            horizontal
            size="small"
            className={`access-status ${props.accessStatusId}`}
          >
            {props.accessStatusIcon && <Icon name={props.accessStatusIcon} />}
            {props.accessStatus}
          </Label>
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink}>{props.title}</a>
        </Item.Header>
        <Item className="creatibutors">
          <SearchItemCreators creators={props.creators} othersLink={viewLink} />
        </Item>
        <Item.Description>
          <div style={{ marginBottom: '1rem' }}>
            {_truncate(props.descriptionStripped, { length: 350 })}
          </div>

          {hasSummaries && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <Button
                basic
                size="mini"
                color="blue"
                onClick={handleAbstractTypeChange}
                className="abstract-button"
                style={{
                  fontSize: '0.7rem',
                  padding: '0.8em 1.8em',
                  minHeight: 'auto'
                }}
              >
                <Icon name={getButtonContent()?.icon} style={{ fontSize: '0.8rem' }} />
                {getButtonContent()?.text}
              </Button>
            </div>
          )}

          {isExpanded && currentAbstractType !== 'original' && (
            <div
              className={`abstract-summary ${animationClass}`}
              style={{
                background: '#f4f8fb',
                borderRadius: '10px',
                padding: '1.2em 1em',
                marginTop: '0.5em',
                boxShadow: '0 2px 12px rgba(106,130,251,0.07)',
                borderLeft: '4px solid #6a82fb',
                fontStyle: 'italic',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: animationClass === 'animate-in' ? 'translateY(0)' : 'translateY(20px)',
                opacity: animationClass === 'animate-in' ? 1 : 0,
                height: '400px', // Increased height from 200px to 280px
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.8rem',
                color: '#333',
                fontWeight: '600',
                flexShrink: 0, // Prevent header from shrinking
                lineHeight: '1.2'
              }}>
                <Icon name={getAbstractIcon()} style={{ color: '#6a82fb', fontSize: '1em', verticalAlign: 'middle' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{getAbstractTitle()}</span>
                <Popup
                  trigger={
                    <Icon
                      name="help circle"
                      style={{
                        color: '#6a82fb',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        verticalAlign: 'middle',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '1.1rem',
                        minHeight: '1.1rem'
                      }}
                    />
                  }
                  content={
                    <div style={{ maxWidth: '300px' }}>
                      <strong>Disclaimer</strong>
                      <br /><br />
                      Disclaimer: The AI Summary is not a scientific research tool but a communication aid powered by a Large Language Model (LLM). It provides simplified summaries of scientific abstracts to enhance accessibility for non-specialists. While efforts are made to ensure accuracy, the outputs should not replace professional scientific interpretation or advice.
                    </div>
                  }
                  position="top center"
                  wide="very"
                  hoverable
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div style={{
                wordWrap: 'break-word',
                lineHeight: '1.5',
                color: '#555',
                overflow: 'auto', // Make content scrollable
                flex: 1, // Take remaining space
                paddingRight: '0.5rem' // Add some padding for scrollbar
              }}
                ref={contentRef}
              >
                <span dangerouslySetInnerHTML={{ __html: getCurrentAbstractContent() }} />
              </div>
            </div>
          )}
        </Item.Description>
        <Item.Extra>
          {props.subjects.map((subject) => (
            <Label key={subject.title_l10n} size="tiny">
              {subject.title_l10n}
            </Label>
          ))}

          <div className="flex justify-space-between align-items-end">
            <small>
              <DisplayPartOfCommunities communities={props.result.parent?.communities} />
              <p>
                {props.createdDate && (
                  <>
                    {i18next.t("Uploaded on {{uploadDate}}", {
                      uploadDate: props.createdDate,
                    })}
                  </>
                )}
                {props.createdDate && publishingInformation && " | "}

                {publishingInformation && (
                  <>
                    {i18next.t("Published in: {{publishInfo}}", {
                      publishInfo: publishingInformation,
                    })}
                  </>
                )}
              </p>

              {!props.allVersionsVisible && props.versions.index > 1 && (
                <p>
                  <b>
                    {i18next.t("{{count}} more versions exist for this record", {
                      count: props.numOtherVersions,
                    })}
                  </b>
                </p>
              )}
            </small>

            <small>
              <CompactStats
                uniqueViews={uniqueViews}
                uniqueDownloads={uniqueDownloads}
              />
            </small>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  )
}
